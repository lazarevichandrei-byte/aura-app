import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabase-admin";
import { validateTelegramInitData } from "../../../../lib/telegram-auth";
import { calculateMeetExpiration } from "../../../../lib/meet/time";
import { ensureMeetChatParticipant } from "../../../../lib/server/meet-chat-participant";
import {recordServerEventSafe} from "../../../../lib/server/events/record";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let step = "parse-request";
  let createdEventId: string | null = null;
  let createdChatId: string | null = null;
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
      if (!eventError && event) {
        createdEventId = event.id;
      }
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
      if (!chatError && chat) {
        createdChatId = chat.id;
      }
      if (chatError?.code === "23505") {
        const retry = await supabaseAdmin.from("chats").select("id").eq("event_id", event.id).limit(1).maybeSingle();
        chat = retry.data;
        chatError = retry.error;
      }
    }
    if (chatError || !chat) throw chatError ?? new Error("CHAT_CREATE_FAILED");

    step = "creator-participant-lookup";
    const { data: participant, error: participantCheckError } = await supabaseAdmin
      .from("chat_participants")
      .select("chat_id,user_id")
      .eq("chat_id", chat.id)
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();
    if (participantCheckError) throw participantCheckError;

    let participantInsertError = null;
    if (!participant) {
      step = "creator-participant-insert";
      try {
        await ensureMeetChatParticipant(chat.id, user.id);
      } catch (error) {
        participantInsertError = error;
      }
    } else {
      step = "creator-read-state-ensure";
      await ensureMeetChatParticipant(chat.id, user.id);
    }

    step = "creator-participant-verify";
    const verification = await supabaseAdmin
      .from("chat_participants")
      .select("chat_id,user_id")
      .eq("chat_id", chat.id)
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();
    if (verification.error) throw verification.error;
    if (!verification.data) {
      if (participantInsertError) throw participantInsertError;
      throw new Error("CREATOR_PARTICIPANT_NOT_FOUND");
    }

    await Promise.allSettled([
      recordServerEventSafe({eventName:"meet_created",actorUserId:user.id,entityType:"meet_event",entityId:event.id,dedupeKey:`meet:created:${event.id}`}),
      recordServerEventSafe({eventName:"meet_chat_joined",actorUserId:user.id,entityType:"chat",entityId:chat.id,dedupeKey:`meet:chat_joined:${chat.id}:${user.id}`,metadata:{meet_event_id:event.id}}),
    ]);

    return NextResponse.json({ ok: true, eventId: event.id, chatId: chat.id });
  } catch (error: unknown) {
    const databaseError = error as { code?: string; message?: string; details?: string; hint?: string };
    if (createdChatId) {
      const rollbackParticipants = await supabaseAdmin
        .from("chat_participants")
        .delete()
        .eq("chat_id", createdChatId);
      if (rollbackParticipants.error) {
        console.error("MEET CREATE PARTICIPANTS ROLLBACK ERROR:", {
          chatId: createdChatId,
          code: rollbackParticipants.error.code,
          message: rollbackParticipants.error.message,
        });
      }
      const rollbackChat = await supabaseAdmin.from("chats").delete().eq("id", createdChatId);
      if (rollbackChat.error) {
        console.error("MEET CREATE CHAT ROLLBACK ERROR:", {
          chatId: createdChatId,
          code: rollbackChat.error.code,
          message: rollbackChat.error.message,
        });
      }
    }
    if (createdEventId) {
      const rollbackEvent = await supabaseAdmin.from("meet_events").delete().eq("id", createdEventId);
      if (rollbackEvent.error) {
        console.error("MEET CREATE EVENT ROLLBACK ERROR:", {
          eventId: createdEventId,
          code: rollbackEvent.error.code,
          message: rollbackEvent.error.message,
        });
      }
    }
    console.error("MEET CREATE API ERROR:", { step, code: databaseError.code, message: databaseError.message, details: databaseError.details, hint: databaseError.hint });
    const responseError = step.startsWith("creator-participant")
      ? "CREATOR_PARTICIPANT_FAILED"
      : "CREATE_FAILED";
    return NextResponse.json({ ok: false, error: responseError, message: "Не удалось создать встречу. Попробуйте ещё раз." }, { status: 500 });
  }
}
