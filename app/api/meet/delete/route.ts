import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabase-admin";
import { validateTelegramInitData } from "../../../../lib/telegram-auth";
import {deliverTelegramNotification} from "../../../../lib/server/notifications/deliver";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { initData, eventId } = await request.json();
    const validation = validateTelegramInitData(initData || "");
    if (validation.ok === false) return NextResponse.json({ ok: false, error: validation.error }, { status: 403 });

    const { data: user } = await supabaseAdmin.from("users").select("id").eq("telegram_id", validation.user.id).single();
    const { data: event } = await supabaseAdmin.from("meet_events").select("id,creator_id,title").eq("id", eventId).maybeSingle();
    if (!event) return NextResponse.json({ ok: true });
    if (!user || event.creator_id !== user.id) return NextResponse.json({ ok: false, error: "NOT_EVENT_CREATOR" }, { status: 403 });

    const {data:confirmedParticipants}=await supabaseAdmin.from("meet_participants").select("user_id").eq("event_id",event.id);
    const { data: chat } = await supabaseAdmin.from("chats").select("id").eq("event_id", event.id).maybeSingle();
    if (chat) {
      const messageDelete = await supabaseAdmin.from("messages").delete().eq("chat_id", chat.id);
      if (messageDelete.error) throw messageDelete.error;
      const participantDelete = await supabaseAdmin.from("chat_participants").delete().eq("chat_id", chat.id);
      if (participantDelete.error) throw participantDelete.error;
      const chatDelete = await supabaseAdmin.from("chats").delete().eq("id", chat.id);
      if (chatDelete.error) throw chatDelete.error;
    }

    const requestsDelete = await supabaseAdmin.from("meet_join_requests").delete().eq("event_id", event.id);
    if (requestsDelete.error) throw requestsDelete.error;
    const participantsDelete = await supabaseAdmin.from("meet_participants").delete().eq("event_id", event.id);
    if (participantsDelete.error) throw participantsDelete.error;
    const eventDelete = await supabaseAdmin.from("meet_events").delete().eq("id", event.id);
    if (eventDelete.error) throw eventDelete.error;

    await Promise.all((confirmedParticipants??[]).map((participant)=>deliverTelegramNotification({eventType:"meet_cancelled",recipientUserId:participant.user_id,dedupeKey:`meet_cancelled:${event.id}:${participant.user_id}`,entityId:event.id,text:event.title,href:"/meet"})));

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("MEET DELETE API ERROR:", { code: error?.code, message: error?.message });
    return NextResponse.json({ ok: false, error: "DELETE_FAILED" }, { status: 500 });
  }
}
