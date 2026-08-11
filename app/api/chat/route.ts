import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabase-admin";
import { validateTelegramInitData } from "../../../lib/telegram-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { initData, chatId, action = "load", text, body, replyToId, replyPreview } = await request.json();
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
      console.error("CHAT API USER ERROR:", { stage: "load-user", chatId, telegramId: validation.user.id });
      return NextResponse.json({ ok: false, error: "USER_NOT_FOUND" }, { status: 404 });
    }
    const { data: chat, error: chatError } = chatResult;
    if (chatError || !chat) {
      console.error("CHAT API LOAD ERROR:", { chatId, userId: user.id, code: chatError?.code, message: chatError?.message });
      return NextResponse.json({ ok: false, error: "CHAT_NOT_FOUND" }, { status: 404 });
    }

    if (action === "load" && chat.event_id) {
      const { data: bootstrap, error: bootstrapError } = await supabaseAdmin.rpc(
        "bootstrap_meet_chat",
        {
          p_chat_id: chat.id,
          p_user_id: user.id,
        }
      );
      if (bootstrapError) throw bootstrapError;
      if (!bootstrap) {
        return NextResponse.json({ ok: false, error: "CHAT_NOT_FOUND" }, { status: 404 });
      }
      if (!bootstrap.is_member) {
        console.error("CHAT API ACCESS DENIED:", { chatId, eventId: chat.event_id, userId: user.id });
        return NextResponse.json({ ok: false, error: "CHAT_ACCESS_DENIED" }, { status: 403 });
      }
      if (!bootstrap.event) {
        return NextResponse.json({ ok: false, error: "MEET_NOT_FOUND" }, { status: 404 });
      }

      return NextResponse.json({
        ok: true,
        currentUserId: user.id,
        chat: bootstrap.chat,
        event: bootstrap.event,
        participantCount: bootstrap.participant_count,
        otherUser: null,
        messages: bootstrap.messages ?? [],
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
  } catch (error: any) {
    console.error("CHAT API ERROR:", {
      code: error?.code,
      message: error?.message,
      details: error?.details,
      hint: error?.hint,
    });
    return NextResponse.json({ ok: false, error: "SERVER_ERROR" }, { status: 500 });
  }
}
