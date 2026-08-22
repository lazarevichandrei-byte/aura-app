import {NextResponse} from "next/server";
import {supabaseAdmin} from "../../../lib/supabase-admin";
import {validateTelegramInitData} from "../../../lib/telegram-auth";

export const runtime="nodejs";

export async function POST(request:Request){
  try{
    const body=await request.json().catch(()=>null);
    const validation=validateTelegramInitData(typeof body?.initData==="string"?body.initData:"");
    if(validation.ok===false)return NextResponse.json({ok:false,error:validation.error},{status:validation.error==="BOT_TOKEN_MISSING"?500:403});
    const targetUserId=typeof body?.targetUserId==="string"?body.targetUserId:"";
    const [{data:actor,error:actorError},{data:target,error:targetError}]=await Promise.all([
      supabaseAdmin.from("users").select("id").eq("telegram_id",validation.user.id).maybeSingle(),
      supabaseAdmin.from("users").select("id").eq("id",targetUserId).maybeSingle(),
    ]);
    if(actorError||targetError)throw actorError||targetError;
    if(!actor||!target)return NextResponse.json({ok:false,error:"USER_NOT_FOUND"},{status:404});
    if(actor.id===target.id)return NextResponse.json({ok:false,error:"SELF_CHAT_NOT_ALLOWED"},{status:400});
    const {data:blocks,error:blockError}=await supabaseAdmin.from("blocked_users").select("id").or(`and(user_id.eq.${actor.id},blocked_user_id.eq.${target.id}),and(user_id.eq.${target.id},blocked_user_id.eq.${actor.id})`).limit(1);
    if(blockError)throw blockError;
    if(blocks?.length)return NextResponse.json({ok:false,error:"USER_RELATION_BLOCKED"},{status:403});
    const {data:chatId,error}=await supabaseAdmin.rpc("get_or_create_direct_dating_chat",{p_user_a:actor.id,p_user_b:target.id});
    if(error)throw error;
    const updatedAt=new Date().toISOString();
    const {error:actorStateError}=await supabaseAdmin.from("chat_user_state").upsert({chat_id:chatId,user_id:actor.id,hidden_at:null,updated_at:updatedAt},{onConflict:"chat_id,user_id"});
    if(actorStateError)throw actorStateError;
    const {error:targetStateError}=await supabaseAdmin.from("chat_user_state").upsert({chat_id:chatId,user_id:target.id,updated_at:updatedAt},{onConflict:"chat_id,user_id",ignoreDuplicates:true});
    if(targetStateError)throw targetStateError;
    return NextResponse.json({ok:true,chatId});
  }catch(error){
    console.error("DIRECT CHAT API ERROR",{message:error instanceof Error?error.message:"unknown"});
    return NextResponse.json({ok:false,error:"DIRECT_CHAT_FAILED"},{status:500});
  }
}
