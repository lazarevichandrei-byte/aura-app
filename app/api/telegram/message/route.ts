import {NextResponse} from "next/server";
import {supabaseAdmin} from "../../../../lib/supabase-admin";
import {validateTelegramInitData} from "../../../../lib/telegram-auth";
import {deliverTelegramNotification} from "../../../../lib/server/notifications/deliver";

export async function POST(request:Request){
  try{
    const {initData,chatId,messageId}=await request.json();const validation=validateTelegramInitData(initData||"");if(validation.ok===false)return NextResponse.json({ok:false,error:validation.error},{status:403});
    const {data:actor}=await supabaseAdmin.from("users").select("id,name").eq("telegram_id",validation.user.id).maybeSingle();if(!actor)return NextResponse.json({ok:false,error:"USER_NOT_FOUND"},{status:404});
    const {data:message}=await supabaseAdmin.from("messages").select("id,chat_id,sender_id,body").eq("id",messageId).eq("chat_id",chatId).eq("sender_id",actor.id).maybeSingle();if(!message)return NextResponse.json({ok:false,error:"MESSAGE_NOT_FOUND"},{status:404});
    const {data:chat}=await supabaseAdmin.from("chats").select("id,event_id,user1_id,user2_id").eq("id",chatId).maybeSingle();if(!chat)return NextResponse.json({ok:false,error:"CHAT_NOT_FOUND"},{status:404});
    let recipients:string[]=[];let eventType:"private_message"|"meet_chat_message"="private_message";
    if(chat.event_id){const {data:members}=await supabaseAdmin.from("chat_participants").select("user_id").eq("chat_id",chatId);if(!members?.some((item)=>item.user_id===actor.id))return NextResponse.json({ok:false,error:"CHAT_ACCESS_DENIED"},{status:403});recipients=members.map((item)=>item.user_id).filter((id)=>id!==actor.id);eventType="meet_chat_message";}
    else{if(chat.user1_id!==actor.id&&chat.user2_id!==actor.id)return NextResponse.json({ok:false,error:"CHAT_ACCESS_DENIED"},{status:403});recipients=[chat.user1_id===actor.id?chat.user2_id:chat.user1_id].filter(Boolean) as string[];}
    const preview=String(message.body||"").slice(0,80);await Promise.all(recipients.map((recipientUserId)=>deliverTelegramNotification({eventType,recipientUserId,dedupeKey:`message:${message.id}:${recipientUserId}`,entityId:chatId,text:`${actor.name||"AURA"}: ${preview}`,href:`/chat/${chatId}`,rateLimitSeconds:15})));
    return NextResponse.json({ok:true,recipientCount:recipients.length});
  }catch(error:any){console.error("MESSAGE NOTIFICATION ERROR:",{code:error?.code,message:error?.message});return NextResponse.json({ok:false,error:"DELIVERY_FAILED"},{status:500});}
}
