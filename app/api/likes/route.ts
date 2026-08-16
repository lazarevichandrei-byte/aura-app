import {NextResponse} from "next/server";
import {supabaseAdmin} from "../../../lib/supabase-admin";
import {validateTelegramInitData} from "../../../lib/telegram-auth";
import {deliverTelegramNotification} from "../../../lib/server/notifications/deliver";

export const runtime="nodejs";

function text(value:unknown){return typeof value==="string"?value.trim():"";}

export async function POST(request:Request){
  try{
    const body=await request.json().catch(()=>null);
    const initData=text(body?.initData);
    const action=text(body?.action);
    const targetUserId=text(body?.targetUserId);
    if(!initData||!targetUserId||!["like","dismiss","skip"].includes(action))return NextResponse.json({ok:false,error:"INVALID_REQUEST"},{status:400});

    const validation=validateTelegramInitData(initData);
    if(validation.ok===false)return NextResponse.json({ok:false,error:validation.error},{status:validation.error==="BOT_TOKEN_MISSING"?500:403});

    const [{data:actor,error:actorError},{data:target,error:targetError}]=await Promise.all([
      supabaseAdmin.from("users").select("id").eq("telegram_id",validation.user.id).maybeSingle(),
      supabaseAdmin.from("users").select("id,hide_profile").eq("id",targetUserId).maybeSingle(),
    ]);
    if(actorError||targetError)throw actorError||targetError;
    if(!actor)return NextResponse.json({ok:false,error:"USER_NOT_FOUND"},{status:404});
    if(!target)return NextResponse.json({ok:false,error:"TARGET_USER_NOT_FOUND"},{status:404});
    if(actor.id===target.id)return NextResponse.json({ok:false,error:"SELF_ACTION_NOT_ALLOWED"},{status:400});

    if(action==="dismiss"){
      const {error}=await supabaseAdmin.from("likes").update({status:"dismissed"}).eq("from_user_id",target.id).eq("to_user_id",actor.id);
      if(error)throw error;
      return NextResponse.json({ok:true,chatId:null});
    }

    if(action==="skip"){
      const {error}=await supabaseAdmin.from("likes").delete().or(`and(from_user_id.eq.${actor.id},to_user_id.eq.${target.id}),and(from_user_id.eq.${target.id},to_user_id.eq.${actor.id})`);
      if(error)throw error;
      return NextResponse.json({ok:true,chatId:null});
    }

    const {data:blocks,error:blockError}=await supabaseAdmin.from("blocked_users").select("id").or(`and(user_id.eq.${actor.id},blocked_user_id.eq.${target.id}),and(user_id.eq.${target.id},blocked_user_id.eq.${actor.id})`).limit(1);
    if(blockError)throw blockError;
    if(blocks?.length)return NextResponse.json({ok:false,error:"USER_RELATION_BLOCKED"},{status:403});
    if(target.hide_profile)return NextResponse.json({ok:false,error:"TARGET_NOT_AVAILABLE"},{status:403});

    const {data:chatId,error:likeError}=await supabaseAdmin.rpc("like_user",{from_id:actor.id,to_id:target.id});
    if(likeError)throw likeError;
    const eventType=chatId?"match_created":"like_received";
    const entityId=chatId||`${actor.id}:${target.id}`;
    await deliverTelegramNotification({eventType,recipientUserId:target.id,dedupeKey:`${eventType}:${entityId}:${target.id}`,entityId:chatId||undefined,href:chatId?`/chat/${chatId}`:"/likes"});
    return NextResponse.json({ok:true,chatId:typeof chatId==="string"?chatId:null});
  }catch(error){
    const databaseError=error as {code?:string;message?:string};
    console.error("LIKES API ERROR",{code:databaseError.code||"UNKNOWN",message:databaseError.message||"Unknown error"});
    return NextResponse.json({ok:false,error:"LIKE_ACTION_FAILED"},{status:500});
  }
}
