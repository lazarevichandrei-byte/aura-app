import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabase-admin";
import { validateTelegramInitData } from "../../../../lib/telegram-auth";

export const runtime = "nodejs";

async function getAuthenticatedUser(initData: string) {
  const validation = validateTelegramInitData(initData);
  if (!validation.ok) return null;

  const { data } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("telegram_id", validation.user.id)
    .single();

  return data;
}

async function getOrCreateMeetChat(eventId: string) {
  const { data: existing, error: checkError } = await supabaseAdmin
    .from("chats")
    .select("id")
    .eq("event_id", eventId)
    .maybeSingle();

  if (checkError) throw checkError;
  if (existing) return existing.id;

  const { data, error } = await supabaseAdmin
    .from("chats")
    .insert({
      event_id: eventId,
      user1_id: null,
      user2_id: null,
      last_message: "",
      liked_by: true,
      is_new_match: false,
      has_messages: false,
      unread_count: 0,
    })
    .select("id")
    .single();

  if (error || !data) throw error ?? new Error("CHAT_CREATE_FAILED");
  return data.id;
}

async function addParticipant(eventId: string, userId: string) {
  const chatId = await getOrCreateMeetChat(eventId);

  const { error: meetError } = await supabaseAdmin
    .from("meet_participants")
    .upsert({ event_id: eventId, user_id: userId }, { onConflict: "event_id,user_id" });
  if (meetError) throw meetError;

  const { error: chatError } = await supabaseAdmin
    .from("chat_participants")
    .upsert({ chat_id: chatId, user_id: userId }, { onConflict: "chat_id,user_id" });
  if (chatError) throw chatError;
}

export async function POST(request: Request) {
  try {
    const { initData, action, eventId, requestId } = await request.json();
    if (!initData || !action) {
      return NextResponse.json({ ok: false, error: "MISSING_DATA" }, { status: 400 });
    }

    const user = await getAuthenticatedUser(initData);
    if (!user) {
      return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 403 });
    }

    if (action === "join" || action === "leave") {
      const { data: event } = await supabaseAdmin
        .from("meet_events")
        .select("id, creator_id, join_type, is_active, expires_at")
        .eq("id", eventId)
        .single();

      if (!event) return NextResponse.json({ ok: false, error: "MEET_NOT_FOUND" }, { status: 404 });

      if (action === "join") {
        if (event.join_type !== "open" || !event.is_active || new Date(event.expires_at) <= new Date()) {
          return NextResponse.json({ ok: false, error: "JOIN_NOT_ALLOWED" }, { status: 403 });
        }
        await addParticipant(event.id, user.id);
      } else {
        if (event.creator_id === user.id) {
          return NextResponse.json({ ok: false, error: "CREATOR_CANNOT_LEAVE" }, { status: 403 });
        }
        const { data: chat } = await supabaseAdmin.from("chats").select("id").eq("event_id", event.id).maybeSingle();
        const { error: meetError } = await supabaseAdmin.from("meet_participants").delete().eq("event_id", event.id).eq("user_id", user.id);
        if (meetError) throw meetError;
        if (chat) {
          const { error: chatError } = await supabaseAdmin.from("chat_participants").delete().eq("chat_id", chat.id).eq("user_id", user.id);
          if (chatError) throw chatError;
        }
      }
    } else if (action === "approve" || action === "reject") {
      const { data: joinRequest } = await supabaseAdmin
        .from("meet_join_requests")
        .select("id, event_id, user_id, status, meet_events!inner(creator_id)")
        .eq("id", requestId)
        .single();

      const meetEvent = Array.isArray(joinRequest?.meet_events)
        ? joinRequest.meet_events[0]
        : joinRequest?.meet_events;
      if (!joinRequest || meetEvent?.creator_id !== user.id) {
        return NextResponse.json({ ok: false, error: "NOT_EVENT_CREATOR" }, { status: 403 });
      }

      if (joinRequest.status === "pending") {
        const status = action === "approve" ? "approved" : "rejected";
        const { error } = await supabaseAdmin
          .from("meet_join_requests")
          .update({ status, reviewed_at: new Date().toISOString() })
          .eq("id", joinRequest.id);
        if (error) throw error;
        if (action === "approve") await addParticipant(joinRequest.event_id, joinRequest.user_id);
      }
    } else {
      return NextResponse.json({ ok: false, error: "UNKNOWN_ACTION" }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("MEET MEMBERSHIP API ERROR:", error);
    return NextResponse.json({ ok: false, error: "SERVER_ERROR" }, { status: 500 });
  }
}
