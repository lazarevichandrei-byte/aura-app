import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabase-admin";
import { validateTelegramInitData } from "../../../../lib/telegram-auth";
import { ensureMeetChatParticipant, reserveMeetGuestSlot } from "../../../../lib/server/meet-chat-participant";
import {deliverTelegramNotification} from "../../../../lib/server/notifications/deliver";
import {recordServerEventBestEffort} from "../../../../lib/server/events/record";

export const runtime = "nodejs";

async function getAuthenticatedUser(initData: string) {
  const validation = validateTelegramInitData(initData);
  if (!validation.ok) {
    console.error("MEET MEMBERSHIP AUTH ERROR:", { hasInitData: Boolean(initData), error: "error" in validation ? validation.error : "INVALID_INIT_DATA" });
    return null;
  }

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

  if (error?.code === "23505") {
    const retry = await supabaseAdmin.from("chats").select("id").eq("event_id", eventId).maybeSingle();
    if (retry.error || !retry.data) throw retry.error ?? new Error("CHAT_CREATE_FAILED");
    return retry.data.id;
  }
  if (error || !data) throw error ?? new Error("CHAT_CREATE_FAILED");
  return data.id;
}

async function addParticipant(eventId: string, userId: string) {
  const { data: event, error: eventError } = await supabaseAdmin
    .from("meet_events").select("creator_id,max_people").eq("id", eventId).single();
  if (eventError || !event) throw eventError ?? new Error("MEET_NOT_FOUND");
  if (event.creator_id === userId) {
    const chatId=await getOrCreateMeetChat(eventId);
    await ensureMeetChatParticipant(chatId,userId);
    return {added:false,chatId};
  }

  const addedMeetParticipant = await reserveMeetGuestSlot(eventId, userId);

  let chatId:string;
  try {
    chatId = await getOrCreateMeetChat(eventId);
    await ensureMeetChatParticipant(chatId, userId);
  } catch (error) {
    if (addedMeetParticipant) {
      const rollback = await supabaseAdmin.from("meet_participants").delete().eq("event_id", eventId).eq("user_id", userId);
      if (rollback.error) console.error("MEET JOIN ROLLBACK ERROR:", { eventId, userId, code: rollback.error.code, message: rollback.error.message });
    }
    throw error;
  }
  return {added:addedMeetParticipant,chatId};
}

export async function POST(request: Request) {
  try {
    const { initData, action, eventId, requestId, targetUserId } = await request.json();
    if (!initData || !action) {
      return NextResponse.json({ ok: false, error: "MISSING_DATA" }, { status: 400 });
    }

    const user = await getAuthenticatedUser(initData);
    if (!user) {
      return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 403 });
    }

    if (action === "join" || action === "leave" || action === "request" || action === "cancel-request") {
      const { data: event } = await supabaseAdmin
        .from("meet_events")
        .select("id, creator_id, join_type, is_active, expires_at")
        .eq("id", eventId)
        .single();

      if (!event) return NextResponse.json({ ok: false, error: "MEET_NOT_FOUND" }, { status: 404 });

      if (action === "request") {
        if (event.join_type !== "approval" || !event.is_active || new Date(event.expires_at) <= new Date()) {
          return NextResponse.json({ ok: false, error: "REQUEST_NOT_ALLOWED" }, { status: 403 });
        }
        const { data: existingRequest, error: requestCheckError } = await supabaseAdmin
          .from("meet_join_requests").select("id,status").eq("event_id", event.id).eq("user_id", user.id).maybeSingle();
        if (requestCheckError) throw requestCheckError;
        let recordedRequestId=existingRequest?.id;
        if (existingRequest) {
          if (existingRequest.status !== "pending") {
            const { error } = await supabaseAdmin.from("meet_join_requests").update({ status: "pending", reviewed_at: null }).eq("id", existingRequest.id);
            if (error) throw error;
          }
          await deliverTelegramNotification({eventType:"meet_request_new",recipientUserId:event.creator_id,dedupeKey:`meet_request:${existingRequest.id}`,entityId:existingRequest.id,href:`/meet/${event.id}`});
        } else {
          const { data:createdRequest,error } = await supabaseAdmin.from("meet_join_requests").insert({ event_id: event.id, user_id: user.id }).select("id").single();
          if (error && error.code !== "23505") throw error;
          if(createdRequest){recordedRequestId=createdRequest.id;await deliverTelegramNotification({eventType:"meet_request_new",recipientUserId:event.creator_id,dedupeKey:`meet_request:${createdRequest.id}`,entityId:createdRequest.id,href:`/meet/${event.id}`});}
        }
        if(recordedRequestId)recordServerEventBestEffort({eventName:"meet_join_request",actorUserId:user.id,targetUserId:event.creator_id,entityType:"meet_request",entityId:recordedRequestId,dedupeKey:`meet:request:${recordedRequestId}`,metadata:{meet_event_id:event.id}});
      } else if (action === "cancel-request") {
        const { error } = await supabaseAdmin.from("meet_join_requests").delete().eq("event_id", event.id).eq("user_id", user.id).eq("status", "pending");
        if (error) throw error;
      } else if (action === "join") {
        if (event.join_type !== "open" || !event.is_active || new Date(event.expires_at) <= new Date()) {
          return NextResponse.json({ ok: false, error: "JOIN_NOT_ALLOWED" }, { status: 403 });
        }
        const joined=await addParticipant(event.id, user.id);
        recordServerEventBestEffort({eventName:"meet_chat_joined",actorUserId:user.id,targetUserId:event.creator_id,entityType:"chat",entityId:joined.chatId,dedupeKey:`meet:chat_joined:${joined.chatId}:${user.id}`,metadata:{meet_event_id:event.id}});
        if(joined.added)await deliverTelegramNotification({eventType:"meet_participant_joined",recipientUserId:event.creator_id,dedupeKey:`participant_joined:${event.id}:${user.id}:${Date.now()}`,entityId:event.id,href:`/meet/${event.id}`});
      } else {
        if (event.creator_id === user.id) {
          return NextResponse.json({ ok: false, error: "CREATOR_CANNOT_LEAVE" }, { status: 403 });
        }
        const { data: chat } = await supabaseAdmin.from("chats").select("id").eq("event_id", event.id).maybeSingle();
        const { data: removedParticipants, error: meetError } = await supabaseAdmin.from("meet_participants").delete().eq("event_id", event.id).eq("user_id", user.id).select("user_id");
        if (meetError) throw meetError;
        if (chat) {
          const { error: chatError } = await supabaseAdmin.from("chat_participants").delete().eq("chat_id", chat.id).eq("user_id", user.id);
          if (chatError) throw chatError;
        }
        if(removedParticipants?.length)await deliverTelegramNotification({eventType:"meet_participant_left",recipientUserId:event.creator_id,dedupeKey:`participant_left:${event.id}:${user.id}:${Date.now()}`,entityId:event.id,href:`/meet/${event.id}`});
        if(removedParticipants?.length)recordServerEventBestEffort({eventName:"meet_participant_left",actorUserId:user.id,targetUserId:event.creator_id,entityType:"meet_event",entityId:event.id,dedupeKey:`meet:left:${event.id}:${user.id}:${Date.now()}`});
      }
    } else if (action === "remove") {
      if (!eventId || !targetUserId) {
        return NextResponse.json({ ok: false, error: "MISSING_DATA" }, { status: 400 });
      }

      const { data: event, error: eventError } = await supabaseAdmin
        .from("meet_events")
        .select("id,creator_id")
        .eq("id", eventId)
        .maybeSingle();
      if (eventError) throw eventError;
      if (!event) return NextResponse.json({ ok: false, error: "MEET_NOT_FOUND" }, { status: 404 });
      if (event.creator_id !== user.id) {
        return NextResponse.json({ ok: false, error: "NOT_EVENT_CREATOR" }, { status: 403 });
      }
      if (targetUserId === event.creator_id) {
        return NextResponse.json({ ok: false, error: "CREATOR_CANNOT_BE_REMOVED" }, { status: 403 });
      }

      const { error: removeError } = await supabaseAdmin
        .from("meet_participants")
        .delete()
        .eq("event_id", event.id)
        .eq("user_id", targetUserId);
      if (removeError) throw removeError;
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

      if (action === "approve" && (joinRequest.status === "pending" || joinRequest.status === "approved")) {
        const joined=await addParticipant(joinRequest.event_id, joinRequest.user_id);
        const { error } = await supabaseAdmin
          .from("meet_join_requests")
          .update({ status: "approved", reviewed_at: new Date().toISOString() })
          .eq("id", joinRequest.id);
        if (error) throw error;
        await deliverTelegramNotification({eventType:"meet_request_approved",recipientUserId:joinRequest.user_id,dedupeKey:`request_approved:${joinRequest.id}`,entityId:joinRequest.id,href:`/meet/${joinRequest.event_id}`});
        recordServerEventBestEffort({eventName:"meet_join_accepted",actorUserId:user.id,targetUserId:joinRequest.user_id,entityType:"meet_request",entityId:joinRequest.id,dedupeKey:`meet:request_accepted:${joinRequest.id}`,metadata:{meet_event_id:joinRequest.event_id}});
        recordServerEventBestEffort({eventName:"meet_chat_joined",actorUserId:joinRequest.user_id,targetUserId:user.id,entityType:"chat",entityId:joined.chatId,dedupeKey:`meet:chat_joined:${joined.chatId}:${joinRequest.user_id}`,metadata:{meet_event_id:joinRequest.event_id}});
      } else if (action === "reject" && joinRequest.status === "pending") {
        const { error } = await supabaseAdmin
          .from("meet_join_requests")
          .update({ status: "rejected", reviewed_at: new Date().toISOString() })
          .eq("id", joinRequest.id);
        if (error) throw error;
        await deliverTelegramNotification({eventType:"meet_request_rejected",recipientUserId:joinRequest.user_id,dedupeKey:`request_rejected:${joinRequest.id}`,entityId:joinRequest.id,href:`/meet/${joinRequest.event_id}`});
        recordServerEventBestEffort({eventName:"meet_join_rejected",actorUserId:user.id,targetUserId:joinRequest.user_id,entityType:"meet_request",entityId:joinRequest.id,dedupeKey:`meet:request_rejected:${joinRequest.id}`,metadata:{meet_event_id:joinRequest.event_id}});
      }
    } else {
      return NextResponse.json({ ok: false, error: "UNKNOWN_ACTION" }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const routeError = error as { code?: string; message?: string };
    console.error("MEET MEMBERSHIP API ERROR:", {code:routeError.code,message:routeError.message});
    if (routeError.code === "P0001" || routeError.message === "MEET_FULL") {
      return NextResponse.json({ ok: false, error: "MEET_FULL" }, { status: 409 });
    }
    return NextResponse.json({ ok: false, error: "SERVER_ERROR" }, { status: 500 });
  }
}
