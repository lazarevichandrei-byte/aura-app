import {NextResponse} from "next/server";
import {supabaseAdmin} from "../../../../lib/supabase-admin";
import {validateTelegramInitData} from "../../../../lib/telegram-auth";
import {calculateMeetExpiration} from "../../../../lib/meet/time";
import {deliverTelegramNotification} from "../../../../lib/server/notifications/deliver";
import {recordServerEventSafe} from "../../../../lib/server/events/record";

export async function POST(request:Request){
  try{
    const {initData,eventId,values}=await request.json();const validation=validateTelegramInitData(initData||"");
    if(validation.ok===false)return NextResponse.json({ok:false,error:validation.error},{status:403});
    const {data:user}=await supabaseAdmin.from("users").select("id").eq("telegram_id",validation.user.id).maybeSingle();
    const {data:current}=await supabaseAdmin.from("meet_events").select("id,creator_id,starts_at,place,join_type").eq("id",eventId).maybeSingle();
    if(!user||!current||current.creator_id!==user.id)return NextResponse.json({ok:false,error:"NOT_EVENT_CREATOR"},{status:403});
    const duration=values.duration??"1h";const allowed={title:values.title,description:values.description,category:values.category,city:values.city,place:values.place,latitude:values.latitude,longitude:values.longitude,starts_at:values.starts_at,duration,max_people:values.max_people,expires_at:calculateMeetExpiration(values.starts_at,duration)};
    const {data:updated,error}=await supabaseAdmin.from("meet_events").update(allowed).eq("id",eventId).select().single();if(error)throw error;
    const meaningful=current.starts_at!==updated.starts_at||current.place!==updated.place||current.join_type!==updated.join_type;
    await recordServerEventSafe({eventName:"meet_updated",actorUserId:user.id,entityType:"meet_event",entityId:eventId,dedupeKey:`meet:updated:${eventId}:${updated.updated_at||updated.starts_at}`,metadata:{change_bucket:meaningful?"time_or_place":"details"}});
    if(meaningful){const {data:participants}=await supabaseAdmin.from("meet_participants").select("user_id").eq("event_id",eventId);await Promise.all((participants??[]).map((participant)=>deliverTelegramNotification({eventType:"meet_updated",recipientUserId:participant.user_id,dedupeKey:`meet_updated:${eventId}:${updated.updated_at||updated.starts_at}:${participant.user_id}`,entityId:eventId,href:`/meet/${eventId}`})));}
    return NextResponse.json({ok:true,event:updated});
  }catch(error:unknown){const databaseError=error as {code?:string;message?:string};console.error("MEET UPDATE API ERROR:",{code:databaseError.code,message:databaseError.message});return NextResponse.json({ok:false,error:"UPDATE_FAILED"},{status:500});}
}
