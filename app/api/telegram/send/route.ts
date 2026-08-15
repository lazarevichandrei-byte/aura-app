import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabase-admin";
import { validateTelegramInitData } from "../../../../lib/telegram-auth";
import {recipientPushCopy} from "../../../../lib/i18n/server-notifications";
import {notificationEnabled,type NotificationEventType} from "../../../../lib/notifications/preferences";
import {getUserNotificationPreferences} from "../../../../lib/server/notifications/preferences";

export const runtime = "nodejs";

export async function POST(request:Request){
  try{
    const {initData,userId,type,text,chatId,entityId} = await request.json();
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
    if(type === "like"){
      const {data} = await supabaseAdmin
        .from("likes")
        .select("id,from_user_id")
        .eq("from_user_id",actor.id)
        .eq("to_user_id",userId)
        .limit(1)
        .maybeSingle();
      allowed = Boolean(data);
      eventType="like_received";deliveryEntityId=data?.id;dedupeEntityId=data?.id;
    }else if(type === "match"){
      const {data} = await supabaseAdmin
        .from("chats")
        .select("id")
        .or(`and(user1_id.eq.${actor.id},user2_id.eq.${userId}),and(user1_id.eq.${userId},user2_id.eq.${actor.id})`)
        .limit(1)
        .maybeSingle();
      allowed = Boolean(data);
      eventType="match_created";deliveryEntityId=data?.id;dedupeEntityId=data?.id;
    }else if(type === "message" && typeof chatId === "string"){
      const {data} = await supabaseAdmin
        .from("chats")
        .select("id,user1_id,user2_id,event_id")
        .eq("id",chatId)
        .maybeSingle();
      if(data?.event_id){
        const {data:members}=await supabaseAdmin.from("chat_participants").select("user_id").eq("chat_id",chatId).in("user_id",[actor.id,userId]);
        allowed=(members?.length??0)===2;eventType="meet_chat_message";
      }else{allowed=Boolean(data&&((data.user1_id===actor.id&&data.user2_id===userId)||(data.user2_id===actor.id&&data.user1_id===userId)));eventType="private_message";}
      deliveryEntityId=chatId;dedupeEntityId=typeof entityId==="string"?entityId:undefined;
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

    if((eventType==="private_message"||eventType==="meet_chat_message")&&deliveryEntityId){
      const since=new Date(Date.now()-15_000).toISOString();
      const {data:recent}=await supabaseAdmin.from("notification_deliveries").select("id").eq("recipient_user_id",userId).eq("notification_type",eventType).eq("entity_id",deliveryEntityId).gte("delivered_at",since).limit(1).maybeSingle();
      if(recent)return NextResponse.json({ok:true,skipped:true,reason:"RATE_LIMITED"});
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
