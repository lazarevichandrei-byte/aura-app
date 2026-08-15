import {NextResponse} from "next/server";
import {supabaseAdmin} from "../../../../lib/supabase-admin";
import {recipientPushCopy} from "../../../../lib/i18n/server-notifications";
import {normalizeNotificationPreferences,notificationEnabled} from "../../../../lib/notifications/preferences";
import {getUsersNotificationPreferences} from "../../../../lib/server/notifications/preferences";

export const runtime="nodejs";

export async function GET(request:Request){
  const secret=process.env.CRON_SECRET;
  if(!secret||request.headers.get("authorization")!==`Bearer ${secret}`)return NextResponse.json({ok:false,error:"UNAUTHORIZED"},{status:401});
  const now=Date.now();const from=new Date(now+25*60_000).toISOString();const to=new Date(now+35*60_000).toISOString();
  const {data:events,error}=await supabaseAdmin.from("meet_events").select("id,title,creator_id,starts_at,expires_at,is_active").eq("is_active",true).gte("starts_at",from).lte("starts_at",to).gt("expires_at",new Date(now).toISOString());
  if(error)return NextResponse.json({ok:false,error:"EVENT_QUERY_FAILED"},{status:500});
  let delivered=0,skipped=0,failed=0;
  for(const event of events??[]){
    const {data:participants}=await supabaseAdmin.from("meet_participants").select("user_id").eq("event_id",event.id);
    const recipientIds=[...new Set([event.creator_id,...(participants??[]).map((item)=>item.user_id)].filter(Boolean))];
    if(!recipientIds.length)continue;
    const [{data:recipients},storedPreferences]=await Promise.all([
      supabaseAdmin.from("users").select("id,telegram_id,language").in("id",recipientIds),
      getUsersNotificationPreferences(recipientIds),
    ]);
    for(const recipient of recipients??[]){
      const preferences=storedPreferences.get(recipient.id)??normalizeNotificationPreferences(null);
      if(!recipient.telegram_id||!notificationEnabled(preferences,"meet_reminder")){skipped++;continue;}
      const dedupeKey=`reminder:${event.id}:${recipient.id}:30m`;
      const {error:reserveError}=await supabaseAdmin.from("notification_deliveries").insert({dedupe_key:dedupeKey,notification_type:"meet_reminder",recipient_user_id:recipient.id,entity_id:event.id});
      if(reserveError){if(reserveError.code==="23505"){skipped++;continue;}failed++;console.error("[NOTIFICATION_DELIVERY]",{notification_type:"meet_reminder",delivery_result:"failed",skip_reason:"reserve_error",code:reserveError.code});continue;}
      const token=process.env.TELEGRAM_BOT_TOKEN;const appUrl=process.env.NEXT_PUBLIC_APP_URL||"https://aura-app-sage.vercel.app";const copy=recipientPushCopy("meet_reminder",recipient.language);
      try{
        if(!token)throw new Error("BOT_TOKEN_MISSING");
        const response=await fetch(`https://api.telegram.org/bot${token}/sendMessage`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chat_id:recipient.telegram_id,text:`${copy.title}\n\n${event.title}: ${copy.text}`,reply_markup:{inline_keyboard:[[{text:copy.button,web_app:{url:`${appUrl}/meet/${event.id}`}}]]}})});
        const result=await response.json();if(!response.ok||!result?.ok)throw new Error("TELEGRAM_SEND_FAILED");delivered++;
      }catch(error){failed++;await supabaseAdmin.from("notification_deliveries").delete().eq("dedupe_key",dedupeKey);console.error("[NOTIFICATION_DELIVERY]",{notification_type:"meet_reminder",delivery_result:"failed",skip_reason:error instanceof Error?error.message:"telegram_error"});}
    }
  }
  return NextResponse.json({ok:true,delivered,skipped,failed});
}
