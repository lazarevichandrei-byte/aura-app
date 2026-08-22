import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabase-admin";
import { validateTelegramInitData } from "../../../lib/telegram-auth";

export const runtime = "nodejs";

async function loadPendingMeetRequests(eventId: string, userId: string) {
  const { data: event, error: eventError } = await supabaseAdmin
    .from("meet_events")
    .select("creator_id")
    .eq("id", eventId)
    .single();
  if (eventError) throw eventError;
  if (event.creator_id !== userId) {
    return { isCreator: false, pendingRequests: [] };
  }

  const { data, error } = await supabaseAdmin
    .from("meet_join_requests")
    .select("id,event_id,user_id,status,created_at,users(id,name,age,city,avatar_url,photos)")
    .eq("event_id", eventId)
    .eq("status", "pending")
    .order("created_at", { ascending: true });
  if (error) throw error;

  return {
    isCreator: true,
    pendingRequests: (data ?? []).map((request) => ({
      ...request,
      users: Array.isArray(request.users) ? request.users[0] ?? null : request.users,
    })),
  };
}

export async function POST(request: Request) {
  try {
    const { initData, chatId, action = "load", text, body, replyToId, replyPreview, readThroughMessageId } = await request.json();
    if (!initData || !chatId) {
      return NextResponse.json({ ok: false, error: "MISSING_DATA" }, { status: 400 });
    }

    const validation = validateTelegramInitData(initData);
    if (validation.ok === false) {
      console.error("CHAT API AUTH ERROR:", { stage: "validate-telegram", chatId, initDataPresent: Boolean(initData), error: validation.error });
      return NextResponse.json({ ok: false, error: validation.error }, { status: 403 });
    }

    const [userResult, chatResult] = await Promise.all([
      supabaseAdmin
        .from("users")
        .select("id")
        .eq("telegram_id", validation.user.id)
        .single(),
      supabaseAdmin
        .from("chats")
        .select("id,event_id,user1_id,user2_id")
        .eq("id", chatId)
        .single(),
    ]);
    const { data: user } = userResult;
    if (!user) {
      console.error("CHAT API USER ERROR:", { stage: "load-user", chatId });
      return NextResponse.json({ ok: false, error: "USER_NOT_FOUND" }, { status: 404 });
    }
    const { data: chat, error: chatError } = chatResult;
    if (chatError || !chat) {
      console.error("CHAT API LOAD ERROR:", { chatId, userId: user.id, code: chatError?.code, message: chatError?.message });
      return NextResponse.json({ ok: false, error: "CHAT_NOT_FOUND" }, { status: 404 });
    }

    let activeMeetEvent: { id: string; is_active: boolean; expires_at: string } | null = null;
    if (chat.event_id) {
      const { data: event, error: eventError } = await supabaseAdmin
        .from("meet_events")
        .select("id,is_active,expires_at")
        .eq("id", chat.event_id)
        .maybeSingle();
      if (eventError) throw eventError;
      if (!event || !event.is_active || new Date(event.expires_at).getTime() <= Date.now()) {
        return NextResponse.json({ ok: false, error: "MEET_EXPIRED" }, { status: 410 });
      }
      activeMeetEvent = event;
    }

    if (action === "requests") {
      if (!chat.event_id) {
        return NextResponse.json({ ok: false, error: "NOT_MEET_CHAT" }, { status: 400 });
      }
      const requestData = await loadPendingMeetRequests(chat.event_id, user.id);
      return NextResponse.json({ ok: true, ...requestData });
    }

    if (action === "load" && chat.event_id) {
      const { data: bootstrap, error: bootstrapError } = await supabaseAdmin.rpc(
        "bootstrap_meet_chat",
        {
          p_chat_id: chat.id,
          p_user_id: user.id,
        }
      );
      if (bootstrapError) {
        console.error("CHAT MEET RPC ERROR:", {
          chatId: chat.id,
          userId: user.id,
          code: bootstrapError.code,
          message: bootstrapError.message,
        });

        if (bootstrapError.code !== "PGRST202") {
          return NextResponse.json(
            { ok: false, error: "MEET_BOOTSTRAP_FAILED" },
            { status: 500 }
          );
        }

        const { data: participants, error: participantError } = await supabaseAdmin
          .from("chat_participants")
          .select("user_id")
          .eq("chat_id", chat.id);
        if (participantError) throw participantError;
        const isMember = Boolean(
          participants?.some((participant) => participant.user_id === user.id)
        );
        if (!isMember) {
          return NextResponse.json(
            { ok: false, error: "CHAT_ACCESS_DENIED" },
            { status: 403 }
          );
        }

        const [eventResult, messagesResult] = await Promise.all([
          supabaseAdmin
            .from("meet_events")
            .select("id,title,category")
            .eq("id", chat.event_id)
            .single(),
          supabaseAdmin
            .from("messages")
            .select("*")
            .eq("chat_id", chat.id)
            .order("created_at", { ascending: false })
            .limit(30),
        ]);
        if (eventResult.error || !eventResult.data) {
          return NextResponse.json(
            { ok: false, error: "MEET_NOT_FOUND" },
            { status: 404 }
          );
        }
        if (messagesResult.error) throw messagesResult.error;

        const requestData = await loadPendingMeetRequests(chat.event_id, user.id);
        return NextResponse.json({
          ok: true,
          currentUserId: user.id,
          chat,
          event: { ...eventResult.data, expires_at: activeMeetEvent?.expires_at },
          participantCount: participants?.length ?? 0,
          otherUser: null,
          messages: messagesResult.data ?? [],
          ...requestData,
        });
      }
      if (!bootstrap) {
        return NextResponse.json(
          { ok: false, error: "MEET_BOOTSTRAP_FAILED" },
          { status: 500 }
        );
      }
      if (!bootstrap.is_member) {
        console.error("CHAT API ACCESS DENIED:", { chatId, eventId: chat.event_id, userId: user.id });
        return NextResponse.json({ ok: false, error: "CHAT_ACCESS_DENIED" }, { status: 403 });
      }
      if (!bootstrap.event) {
        return NextResponse.json({ ok: false, error: "MEET_NOT_FOUND" }, { status: 404 });
      }

      const requestData = await loadPendingMeetRequests(chat.event_id, user.id);
      return NextResponse.json({
        ok: true,
        currentUserId: user.id,
        chat: bootstrap.chat,
        event: { ...bootstrap.event, expires_at: activeMeetEvent?.expires_at },
        participantCount: bootstrap.participant_count,
        otherUser: null,
        messages: bootstrap.messages ?? [],
        ...requestData,
      });
    }

    let allowed = chat.user1_id === user.id || chat.user2_id === user.id;
    if (chat.event_id) {
      const { data: participants, error: participantError } = await supabaseAdmin
        .from("chat_participants")
        .select("user_id")
        .eq("chat_id", chat.id);
      if (participantError) throw participantError;
      allowed = Boolean(participants?.some((participant) => participant.user_id === user.id));
    }
    if (!allowed) {
      console.error("CHAT API ACCESS DENIED:", { chatId, eventId: chat.event_id, userId: user.id });
      return NextResponse.json({ ok: false, error: "CHAT_ACCESS_DENIED" }, { status: 403 });
    }

    if(!chat.event_id&&action==="load"){
      const timestamp=new Date().toISOString();
      const {error:stateError}=await supabaseAdmin.from("chat_user_state").upsert({chat_id:chat.id,user_id:user.id,hidden_at:null,match_seen_at:timestamp,updated_at:timestamp},{onConflict:"chat_id,user_id"});
      if(stateError)throw stateError;
    }

    if(action==="presence"){
      if(typeof body!=="boolean")return NextResponse.json({ok:false,error:"INVALID_PRESENCE"},{status:400});
      const {error:presenceError}=await supabaseAdmin.from("users").update({is_online:body,last_seen:new Date().toISOString()}).eq("id",user.id);
      if(presenceError)throw presenceError;
      return NextResponse.json({ok:true});
    }

    if (action === "mark_read") {
      if (typeof readThroughMessageId !== "string" || !readThroughMessageId) {
        return NextResponse.json({ ok: false, error: "MISSING_READ_CURSOR" }, { status: 400 });
      }

      const { data: savedCursor, error: readStateError } = await supabaseAdmin.rpc(
        "mark_chat_read",
        {
          p_chat_id: chat.id,
          p_user_id: user.id,
          p_message_id: readThroughMessageId,
        }
      );
      if (readStateError) throw readStateError;
      const cursor = Array.isArray(savedCursor) ? savedCursor[0] : savedCursor;
      if (!cursor) {
        return NextResponse.json({ ok: false, error: "READ_CURSOR_NOT_FOUND" }, { status: 404 });
      }

      return NextResponse.json({
        ok: true,
        chatId: chat.id,
        lastReadAt: cursor.last_read_at,
        lastReadMessageId: cursor.last_read_message_id,
      });
    }

    if (action === "send") {
      const messageText = typeof text === "string" ? text : body;
      if (typeof messageText !== "string" || !messageText.trim()) {
        return NextResponse.json({ ok: false, error: "EMPTY_MESSAGE" }, { status: 400 });
      }
      const { data: message, error } = await supabaseAdmin
        .from("messages")
        .insert({ chat_id: chat.id, sender_id: user.id, body: messageText.trim(), message_type: "text", reply_to_id: replyToId || null, reply_preview: replyPreview || null })
        .select()
        .single();
      if (error) throw error;

      const { error: metadataError } = await supabaseAdmin
        .from("chats")
        .update({
          last_message: message.body,
          last_message_at: message.created_at,
          has_messages: true,
        })
        .eq("id", chat.id);
      if (metadataError) {
        console.error("MESSAGE METADATA ERROR:", {
          chatId: chat.id,
          internalUserId: user.id,
          code: metadataError.code,
          message: metadataError.message,
          details: metadataError.details,
          hint: metadataError.hint,
        });
      }

      return NextResponse.json({ ok: true, message, currentUserId: user.id });
    }

    const [{ data: messages, error: messagesError }, otherUserResult] = await Promise.all([
      supabaseAdmin.from("messages").select("*").eq("chat_id", chat.id).order("created_at", { ascending: false }).limit(30),
      supabaseAdmin.from("users").select("id,name,avatar_url,is_online,last_seen").eq("id", chat.user1_id === user.id ? chat.user2_id : chat.user1_id).single(),
    ]);
    if (messagesError) throw messagesError;

    return NextResponse.json({ ok: true, currentUserId: user.id, chat, event: null, participantCount: null, otherUser: otherUserResult.data, messages: messages ?? [] });
  } catch (error: unknown) {
    const chatError=error as {code?:string;message?:string;details?:string;hint?:string};
    console.error("CHAT API ERROR:", {
      code: chatError.code,
      message: chatError.message,
      details: chatError.details,
      hint: chatError.hint,
    });
    return NextResponse.json({ ok: false, error: "SERVER_ERROR" }, { status: 500 });
  }
}
