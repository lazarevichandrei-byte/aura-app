import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabase-admin";
import { validateTelegramInitData } from "../../../../lib/telegram-auth";
import {recipientPushCopy} from "../../../../lib/i18n/server-notifications";
import {notificationEnabled,type NotificationEventType} from "../../../../lib/notifications/preferences";
import {getUserNotificationPreferences} from "../../../../lib/server/notifications/preferences";

export const runtime = "nodejs";

export async function POST(request:Request){
  try{
    const {initData,userId,type,text} = await request.json();
    if(!initData || !userId || !type || !text){
      return NextResponse.json({ok:false,error:"MISSING_DATA"},{status:400});
    }

    const validation = validateTelegramInitData(initData);
    if(validation.ok === false){
      return NextResponse.json({ok:false,error:validation.error},{status:403});
    }

    const {data:actor} = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("telegram_id",validation.user.id)
      .single();
    if(!actor) return NextResponse.json({ok:false,error:"USER_NOT_FOUND"},{status:404});
    if(actor.id === userId) return NextResponse.json({ok:true,skipped:true,reason:"SELF"});

    let allowed = false;
    let eventType:NotificationEventType|null=null;
    let deliveryEntityId:string|undefined;
    let dedupeEntityId:string|undefined;
    if(type === "like" || type === "match"){
      return NextResponse.json({ok:false,error:"USE_DATING_ACTION_ENDPOINT"},{status:410});
    }else if(type === "message"){
      return NextResponse.json({ok:false,error:"USE_VERIFIED_MESSAGE_ENDPOINT"},{status:410});
    }else{
      return NextResponse.json({ok:false,error:"UNKNOWN_NOTIFICATION_TYPE"},{status:400});
    }

    if(!allowed || !eventType){
      return NextResponse.json({ok:false,error:"NOTIFICATION_NOT_ALLOWED"},{status:403});
    }

    const {data:recipient} = await supabaseAdmin
      .from("users")
      .select("telegram_id,is_online,language")
      .eq("id",userId)
      .single();
    if(!recipient?.telegram_id) return NextResponse.json({ok:false,error:"RECIPIENT_NOT_FOUND"},{status:404});

    const preferences=await getUserNotificationPreferences(userId);
    const disabled=!notificationEnabled(preferences,eventType);
    if(disabled || recipient.is_online){
      return NextResponse.json({ok:true,skipped:true,reason:disabled ? "SETTING_DISABLED" : "RECIPIENT_ONLINE"});
    }

    const dedupeKey=dedupeEntityId?`${eventType}:${dedupeEntityId}:${userId}`:null;
    if(dedupeKey){
      const {error:reserveError}=await supabaseAdmin.from("notification_deliveries").insert({dedupe_key:dedupeKey,notification_type:eventType,recipient_user_id:userId,entity_id:deliveryEntityId??dedupeEntityId});
      if(reserveError?.code==="23505")return NextResponse.json({ok:true,skipped:true,reason:"DUPLICATE"});
      if(reserveError)return NextResponse.json({ok:false,error:"DELIVERY_RESERVE_FAILED"},{status:500});
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    if(!token) return NextResponse.json({ok:false,error:"BOT_TOKEN_MISSING"},{status:500});
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aura-app-sage.vercel.app";
    const copy=recipientPushCopy(eventType,recipient.language);
    const localizedText=copy.text || text;
    const telegramResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        chat_id:recipient.telegram_id,
        text:`${copy.title}\n\n${localizedText}`,
        reply_markup:{inline_keyboard:[[{text:copy.button,web_app:{url:appUrl}}]]}
      })
    });
    const result = await telegramResponse.json();
    if(!telegramResponse.ok || !result?.ok){
      if(dedupeKey)await supabaseAdmin.from("notification_deliveries").delete().eq("dedupe_key",dedupeKey);
      return NextResponse.json({ok:false,error:"TELEGRAM_SEND_FAILED"},{status:502});
    }
    return NextResponse.json({ok:true});
  }catch(error:any){
    console.error("TELEGRAM NOTIFICATION ERROR:",{code:error?.code,message:error?.message});
    return NextResponse.json({ok:false,error:"SERVER_ERROR"},{status:500});
  }
}
