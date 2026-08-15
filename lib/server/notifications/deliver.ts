import {supabaseAdmin} from "../../supabase-admin";
import {recipientPushCopy} from "../../i18n/server-notifications";
import {notificationEnabled,type NotificationEventType} from "../../notifications/preferences";
import {getUserNotificationPreferences} from "./preferences";

export async function deliverTelegramNotification({eventType,recipientUserId,dedupeKey,entityId,text,href,rateLimitSeconds=0}:{eventType:NotificationEventType;recipientUserId:string;dedupeKey:string;entityId?:string;text?:string;href?:string;rateLimitSeconds?:number}){
  let reserved=false;
  try{
    const {data:recipient}=await supabaseAdmin.from("users").select("id,telegram_id,is_online,language").eq("id",recipientUserId).maybeSingle();
    if(!recipient?.telegram_id)return {ok:true,skipped:true,reason:"recipient_missing"};
    const preferences=await getUserNotificationPreferences(recipientUserId);
    if(!notificationEnabled(preferences,eventType))return {ok:true,skipped:true,reason:preferences.enabled?"disabled_event":"disabled_master"};
    if(recipient.is_online)return {ok:true,skipped:true,reason:"recipient_online"};
    if(rateLimitSeconds&&entityId){const since=new Date(Date.now()-rateLimitSeconds*1000).toISOString();const {data:recent}=await supabaseAdmin.from("notification_deliveries").select("id").eq("recipient_user_id",recipientUserId).eq("notification_type",eventType).eq("entity_id",entityId).gte("delivered_at",since).limit(1).maybeSingle();if(recent)return {ok:true,skipped:true,reason:"rate_limited"};}
    const {error:reserveError}=await supabaseAdmin.from("notification_deliveries").insert({dedupe_key:dedupeKey,notification_type:eventType,recipient_user_id:recipientUserId,entity_id:entityId});
    if(reserveError?.code==="23505")return {ok:true,skipped:true,reason:"duplicate"};
    if(reserveError)throw reserveError;
    reserved=true;
    const token=process.env.TELEGRAM_BOT_TOKEN;if(!token)throw new Error("BOT_TOKEN_MISSING");
    const appUrl=process.env.NEXT_PUBLIC_APP_URL||"https://aura-app-sage.vercel.app";const copy=recipientPushCopy(eventType,recipient.language);
    const response=await fetch(`https://api.telegram.org/bot${token}/sendMessage`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chat_id:recipient.telegram_id,text:`${copy.title}\n\n${text||copy.text||""}`.trim(),reply_markup:{inline_keyboard:[[{text:copy.button,web_app:{url:`${appUrl}${href||""}`}}]]}})});
    const result=await response.json();if(!response.ok||!result?.ok)throw new Error("TELEGRAM_SEND_FAILED");
    console.info("[NOTIFICATION_DELIVERY]",{notification_type:eventType,delivery_result:"delivered"});return {ok:true};
  }catch(error:any){
    if(reserved)await supabaseAdmin.from("notification_deliveries").delete().eq("dedupe_key",dedupeKey);
    console.error("[NOTIFICATION_DELIVERY]",{notification_type:eventType,delivery_result:"failed",skip_reason:error?.code||error?.message||"unknown"});return {ok:false,error:"DELIVERY_FAILED"};
  }
}
