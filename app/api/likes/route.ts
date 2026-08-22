import {NextResponse} from "next/server";
import {supabaseAdmin} from "../../../lib/supabase-admin";
import {validateTelegramInitData} from "../../../lib/telegram-auth";
import {deliverTelegramNotification} from "../../../lib/server/notifications/deliver";
import {recordServerEventBestEffort} from "../../../lib/server/events/record";

export const runtime="nodejs";

const text=(value:unknown)=>typeof value==="string"?value.trim():"";

async function authenticatedUser(initData:string){
  const validation=validateTelegramInitData(initData);
  if(validation.ok===false)return {error:validation.error,status:validation.error==="BOT_TOKEN_MISSING"?500:403} as const;
  const {data,error}=await supabaseAdmin.from("users").select("id").eq("telegram_id",validation.user.id).maybeSingle();
  if(error)throw error;
  return data?{user:data} as const:{error:"USER_NOT_FOUND",status:404} as const;
}

export async function POST(request:Request){
  try{
    const body=await request.json().catch(()=>null);
    const initData=text(body?.initData);
    const action=text(body?.action);
    if(!initData)return NextResponse.json({ok:false,error:"INVALID_REQUEST"},{status:400});
    const identity=await authenticatedUser(initData);
    if("error" in identity)return NextResponse.json({ok:false,error:identity.error},{status:identity.status});
    const actor=identity.user;

    if(action==="inbox"){
      const {data:entitlement,error:entitlementError}=await supabaseAdmin.from("user_entitlements").select("premium_until").eq("user_id",actor.id).maybeSingle();
      if(entitlementError)throw entitlementError;
      const premium=Boolean(entitlement?.premium_until&&new Date(entitlement.premium_until).getTime()>Date.now());
      const {data:cycles,error:cyclesError}=await supabaseAdmin.from("dating_interaction_cycles")
        .select("id,initiated_by_user_id,created_at")
        .eq("status","pending")
        .eq("recipient_user_id",actor.id)
        .order("created_at",{ascending:false});
      if(cyclesError)throw cyclesError;
      const count=cycles?.length??0;
      if(!premium)return NextResponse.json({ok:true,premium:false,count,people:[]});
      const ids=(cycles??[]).map((cycle)=>cycle.initiated_by_user_id);
      const {data:users,error:usersError}=ids.length?await supabaseAdmin.from("users").select("id,name,age,city,avatar_url,photos,main_photo_index").in("id",ids):{data:[],error:null};
      if(usersError)throw usersError;
      const usersById=new Map((users??[]).map((user)=>[user.id,user]));
      return NextResponse.json({ok:true,premium:true,count,people:(cycles??[]).map((cycle)=>({cycleId:cycle.id,from_user_id:cycle.initiated_by_user_id,created_at:cycle.created_at,users:usersById.get(cycle.initiated_by_user_id)})).filter((item)=>item.users)});
    }

    const targetUserId=text(body?.targetUserId);
    if(!targetUserId||!["like","dismiss","skip"].includes(action))return NextResponse.json({ok:false,error:"INVALID_REQUEST"},{status:400});
    const {data:target,error:targetError}=await supabaseAdmin.from("users").select("id,hide_profile").eq("id",targetUserId).maybeSingle();
    if(targetError)throw targetError;
    if(!target)return NextResponse.json({ok:false,error:"TARGET_USER_NOT_FOUND"},{status:404});
    if(actor.id===target.id)return NextResponse.json({ok:false,error:"SELF_ACTION_NOT_ALLOWED"},{status:400});
    const {data:blocks,error:blockError}=await supabaseAdmin.from("blocked_users").select("id").or(`and(user_id.eq.${actor.id},blocked_user_id.eq.${target.id}),and(user_id.eq.${target.id},blocked_user_id.eq.${actor.id})`).limit(1);
    if(blockError)throw blockError;
    if(blocks?.length)return NextResponse.json({ok:false,error:"USER_RELATION_BLOCKED"},{status:403});
    if(action==="like"&&target.hide_profile)return NextResponse.json({ok:false,error:"TARGET_NOT_AVAILABLE"},{status:403});

    const databaseAction=action==="like"?"like":"reject";
    const {data,error}=await supabaseAdmin.rpc("process_dating_action",{p_actor_id:actor.id,p_target_id:target.id,p_action:databaseAction});
    if(error)throw error;
    const result=(Array.isArray(data)?data[0]:data) as {state:string;cycleId:string;matchId:string|null;chatId:string|null;eventCreated:boolean;cooldownUntil:string|null};
    if(result.state==="pending")recordServerEventBestEffort({eventName:"like",actorUserId:actor.id,targetUserId:target.id,entityType:"dating_cycle",entityId:result.cycleId,dedupeKey:`dating:like:${result.cycleId}:${actor.id}`});
    if(result.state==="rejected")recordServerEventBestEffort({eventName:"pass",actorUserId:actor.id,targetUserId:target.id,entityType:"dating_cycle",entityId:result.cycleId,dedupeKey:`dating:pass:${result.cycleId}:${actor.id}`});
    if(result.state==="matched"&&result.matchId)recordServerEventBestEffort({eventName:"match_created",actorUserId:actor.id,targetUserId:target.id,entityType:"dating_match",entityId:result.matchId,dedupeKey:`dating:match:${result.matchId}`,metadata:result.chatId?{chat_id:result.chatId}:{}});
    if(result.state==="pending"){
      await deliverTelegramNotification({eventType:"like_received",recipientUserId:target.id,dedupeKey:`like_received:${result.cycleId}:${target.id}`,entityId:result.cycleId,href:"/likes"});
    }else if(result.state==="matched"&&result.matchId){
      await Promise.all([actor.id,target.id].map((recipientUserId)=>deliverTelegramNotification({eventType:"match_created",recipientUserId,dedupeKey:`match_created:${result.matchId}:${recipientUserId}`,entityId:result.matchId,href:result.chatId?`/chat/${result.chatId}`:"/chats"})));
    }
    return NextResponse.json({ok:true,state:result.state,cycleId:result.cycleId,chatId:result.chatId??null,cooldownUntil:result.cooldownUntil??null});
  }catch(error){
    const databaseError=error as {code?:string;message?:string};
    console.error("LIKES API ERROR",{code:databaseError.code||"UNKNOWN",message:databaseError.message||"Unknown error"});
    return NextResponse.json({ok:false,error:"LIKE_ACTION_FAILED"},{status:500});
  }
}
