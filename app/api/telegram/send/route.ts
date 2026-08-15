import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../lib/supabase-admin";
import { validateTelegramInitData } from "../../../../lib/telegram-auth";

export const runtime = "nodejs";

export async function POST(request:Request){
  try{
    const {initData,userId,type,title,text,button,chatId} = await request.json();
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
    if(type === "like"){
      const {data} = await supabaseAdmin
        .from("likes")
        .select("from_user_id")
        .eq("from_user_id",actor.id)
        .eq("to_user_id",userId)
        .limit(1)
        .maybeSingle();
      allowed = Boolean(data);
    }else if(type === "match"){
      const {data} = await supabaseAdmin
        .from("chats")
        .select("id")
        .or(`and(user1_id.eq.${actor.id},user2_id.eq.${userId}),and(user1_id.eq.${userId},user2_id.eq.${actor.id})`)
        .limit(1)
        .maybeSingle();
      allowed = Boolean(data);
    }else if(type === "message" && typeof chatId === "string"){
      const {data} = await supabaseAdmin
        .from("chats")
        .select("id,user1_id,user2_id")
        .eq("id",chatId)
        .maybeSingle();
      allowed = Boolean(
        data &&
        ((data.user1_id === actor.id && data.user2_id === userId) ||
         (data.user2_id === actor.id && data.user1_id === userId))
      );
    }

    if(!allowed){
      return NextResponse.json({ok:false,error:"NOTIFICATION_NOT_ALLOWED"},{status:403});
    }

    const {data:recipient} = await supabaseAdmin
      .from("users")
      .select("telegram_id,is_online,likes_notifications,messages_notifications,matches_notifications")
      .eq("id",userId)
      .single();
    if(!recipient?.telegram_id) return NextResponse.json({ok:false,error:"RECIPIENT_NOT_FOUND"},{status:404});

    const disabled =
      (type === "like" && recipient.likes_notifications === false) ||
      (type === "message" && recipient.messages_notifications === false) ||
      (type === "match" && recipient.matches_notifications === false);
    if(disabled || recipient.is_online){
      return NextResponse.json({ok:true,skipped:true,reason:disabled ? "SETTING_DISABLED" : "RECIPIENT_ONLINE"});
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    if(!token) return NextResponse.json({ok:false,error:"BOT_TOKEN_MISSING"},{status:500});
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://aura-app-sage.vercel.app";
    const telegramResponse = await fetch(`https://api.telegram.org/bot${token}/sendMessage`,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        chat_id:recipient.telegram_id,
        text:title ? `${title}\n\n${text}` : text,
        reply_markup:{inline_keyboard:[[{text:button || "🚀 Открыть",web_app:{url:appUrl}}]]}
      })
    });
    const result = await telegramResponse.json();
    if(!telegramResponse.ok || !result?.ok){
      return NextResponse.json({ok:false,error:"TELEGRAM_SEND_FAILED"},{status:502});
    }
    return NextResponse.json({ok:true});
  }catch(error:any){
    console.error("TELEGRAM NOTIFICATION ERROR:",{code:error?.code,message:error?.message});
    return NextResponse.json({ok:false,error:"SERVER_ERROR"},{status:500});
  }
}
