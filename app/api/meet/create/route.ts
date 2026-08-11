import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabase-admin";
import { validateTelegramInitData } from "../../../../lib/telegram-auth";
import { calculateMeetExpiration } from "../../../../lib/meet/time";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let step = "parse-request";
  try {
    const { initData, eventId, values } = await request.json();
    if (!initData || !eventId || !values) {
      return NextResponse.json({ ok: false, error: "MISSING_DATA" }, { status: 400 });
    }

    step = "validate-telegram";
    const validation = validateTelegramInitData(initData);
    if (validation.ok === false) {
      console.error("MEET CREATE AUTH ERROR:", { hasInitData: Boolean(initData), eventId, error: validation.error });
      return NextResponse.json({ ok: false, error: validation.error }, { status: 403 });
    }

    step = "load-user";
    const { data: user } = await supabaseAdmin.from("users").select("id").eq("telegram_id", validation.user.id).single();
    if (!user) return NextResponse.json({ ok: false, error: "USER_NOT_FOUND" }, { status: 404 });

    const startsAt = new Date(values.starts_at);
    if (Number.isNaN(startsAt.getTime()) || startsAt.getTime() <= Date.now()) {
      return NextResponse.json({ ok: false, error: "INVALID_START_TIME" }, { status: 400 });
    }

    step = "ensure-event";
    let { data: event, error: eventError } = await supabaseAdmin
      .from("meet_events")
      .select("id, creator_id")
      .eq("id", eventId)
      .maybeSingle();

    if (!event) {
      const result = await supabaseAdmin
        .from("meet_events")
        .insert({
          id: eventId,
          creator_id: user.id,
          title: values.title,
          description: values.description,
          category: values.category,
          city: values.city,
          place: values.place,
          latitude: values.latitude,
          longitude: values.longitude,
          starts_at: values.starts_at,
          duration: values.duration,
          join_type: values.join_type,
          max_people: values.max_people,
          expires_at: calculateMeetExpiration(values.starts_at, values.duration),
        })
        .select("id, creator_id")
        .single();
      event = result.data;
      eventError = result.error;
      if (eventError?.code === "23505") {
        const retry = await supabaseAdmin.from("meet_events").select("id,creator_id").eq("id", eventId).maybeSingle();
        event = retry.data;
        eventError = retry.error;
      }
    }
    if (eventError || !event) throw eventError ?? new Error("EVENT_CREATE_FAILED");
    if (event.creator_id !== user.id) return NextResponse.json({ ok: false, error: "EVENT_ID_CONFLICT" }, { status: 409 });

    step = "ensure-chat";
    let { data: chat, error: chatError } = await supabaseAdmin.from("chats").select("id").eq("event_id", event.id).limit(1).maybeSingle();
    if (!chat) {
      const result = await supabaseAdmin.from("chats").insert({
        event_id: event.id, user1_id: null, user2_id: null, last_message: "",
        liked_by: true, is_new_match: false, has_messages: false, unread_count: 0,
      }).select("id").single();
      chat = result.data;
      chatError = result.error;
      if (chatError?.code === "23505") {
        const retry = await supabaseAdmin.from("chats").select("id").eq("event_id", event.id).limit(1).maybeSingle();
        chat = retry.data;
        chatError = retry.error;
      }
    }
    if (chatError || !chat) throw chatError ?? new Error("CHAT_CREATE_FAILED");

    step = "ensure-chat-participant";
    const { data: participant, error: participantCheckError } = await supabaseAdmin
      .from("chat_participants")
      .select("chat_id")
      .eq("chat_id", chat.id)
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();
    if (participantCheckError) throw participantCheckError;
    if (!participant) {
      const { error } = await supabaseAdmin.from("chat_participants").insert({ chat_id: chat.id, user_id: user.id });
      if (error && error.code !== "23505") {
        const verification = await supabaseAdmin
          .from("chat_participants")
          .select("chat_id")
          .eq("chat_id", chat.id)
          .eq("user_id", user.id)
          .limit(1)
          .maybeSingle();
        if (verification.error || !verification.data) throw error;
      }
    }

    return NextResponse.json({ ok: true, eventId: event.id, chatId: chat.id });
  } catch (error: any) {
    console.error("MEET CREATE API ERROR:", { step, code: error?.code, message: error?.message, details: error?.details, hint: error?.hint });
    return NextResponse.json({ ok: false, error: "CREATE_FAILED", message: "Не удалось создать встречу. Попробуйте ещё раз." }, { status: 500 });
  }
}
