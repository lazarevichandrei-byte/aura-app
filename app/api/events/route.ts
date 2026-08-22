import {NextResponse} from "next/server";
import {AURA_EVENT_CATALOG,isAuraEventName,isClientAuraEventName,type ClientAuraEventName} from "../../../lib/events/catalog";
import {hasPrivilegedEventFields,MAX_CLIENT_EVENT_ID_LENGTH,MAX_EVENT_BATCH_SIZE,MAX_EVENT_BODY_BYTES,validateMetadata,validateOccurredAt,validUuid} from "../../../lib/events/validate";
import {supabaseAdmin} from "../../../lib/supabase-admin";
import {validateTelegramInitData} from "../../../lib/telegram-auth";

export const runtime="nodejs";

type RawEvent=Record<string,unknown>;
const responseError=(error:string,status:number,correlationId:string)=>NextResponse.json({ok:false,error,correlationId},{status});

async function authorizeEntity(actorId:string,eventName:ClientAuraEventName,targetUserId:string|null,entityId:string){
  if(eventName.startsWith("profile_")||eventName==="return_to_profile"){
    if(!targetUserId||targetUserId===actorId)return "INVALID_TARGET";
    const [{data:target,error:targetError},{data:blocks,error:blockError}]=await Promise.all([
      supabaseAdmin.from("users").select("id,hide_profile").eq("id",targetUserId).maybeSingle(),
      supabaseAdmin.from("blocked_users").select("id").or(`and(user_id.eq.${actorId},blocked_user_id.eq.${targetUserId}),and(user_id.eq.${targetUserId},blocked_user_id.eq.${actorId})`).limit(1),
    ]);
    if(targetError||blockError)throw targetError||blockError;
    if(!target||target.hide_profile||blocks?.length)return "TARGET_NOT_AVAILABLE";
    return null;
  }
  if(eventName==="meet_viewed"){
    const {data,error}=await supabaseAdmin.from("meet_events").select("id,is_active,expires_at").eq("id",entityId).maybeSingle();
    if(error)throw error;
    if(!data||!data.is_active||new Date(data.expires_at).getTime()<=Date.now())return "ENTITY_NOT_AVAILABLE";
    return null;
  }
  const {data,error}=await supabaseAdmin.from("chats").select("id,event_id,user1_id,user2_id").eq("id",entityId).maybeSingle();
  if(error)throw error;
  if(!data||data.event_id||data.user1_id!==actorId&&data.user2_id!==actorId)return "ENTITY_ACCESS_DENIED";
  return null;
}

export async function POST(request:Request){
  const started=Date.now();const correlationId=crypto.randomUUID();let logEvent="unknown";let result="rejected";
  try{
    const raw=await request.text();
    if(new TextEncoder().encode(raw).length>MAX_EVENT_BODY_BYTES)return responseError("PAYLOAD_TOO_LARGE",413,correlationId);
    const body=JSON.parse(raw) as Record<string,unknown>;
    if(hasPrivilegedEventFields(body))return responseError("ACTOR_FIELD_NOT_ALLOWED",400,correlationId);
    const initData=typeof body.initData==="string"?body.initData:"";
    const validation=validateTelegramInitData(initData);
    if(validation.ok===false)return responseError(validation.error,validation.error==="BOT_TOKEN_MISSING"?500:403,correlationId);
    const {data:actor,error:actorError}=await supabaseAdmin.from("users").select("id").eq("telegram_id",validation.user.id).maybeSingle();
    if(actorError)throw actorError;
    if(!actor)return responseError("USER_NOT_FOUND",404,correlationId);
    const events=(Array.isArray(body.events)?body.events:[body.event??body]).filter((item):item is RawEvent=>Boolean(item)&&typeof item==="object"&&!Array.isArray(item));
    if(events.length<1||events.length>MAX_EVENT_BATCH_SIZE)return responseError("INVALID_BATCH_SIZE",400,correlationId);
    const accepted:Array<{duplicate:boolean}>=[];
    for(const event of events){
      if(hasPrivilegedEventFields(event))return responseError("PRIVILEGED_FIELD_NOT_ALLOWED",400,correlationId);
      const eventName=typeof event.eventName==="string"?event.eventName:"";logEvent=eventName||"unknown";
      if(!isAuraEventName(eventName))return responseError("UNKNOWN_EVENT",400,correlationId);
      if(!isClientAuraEventName(eventName))return responseError("SERVER_EVENT_NOT_ALLOWED",403,correlationId);
      const catalog=AURA_EVENT_CATALOG[eventName];
      const clientEventId=typeof event.clientEventId==="string"?event.clientEventId.trim():"";
      if(!clientEventId||clientEventId.length>MAX_CLIENT_EVENT_ID_LENGTH)return responseError("INVALID_CLIENT_EVENT_ID",400,correlationId);
      const targetUserId=event.targetUserId===undefined?null:validUuid(event.targetUserId)?event.targetUserId:null;
      if(event.targetUserId!==undefined&&!targetUserId||catalog.targetRequired&&!targetUserId)return responseError("INVALID_TARGET",400,correlationId);
      const expectedEntityId=catalog.entityType==="user"?targetUserId:event.entityId;
      if(!expectedEntityId||!validUuid(expectedEntityId))return responseError("INVALID_ENTITY",400,correlationId);
      if(event.entityType!==undefined&&event.entityType!==catalog.entityType)return responseError("INVALID_ENTITY_TYPE",400,correlationId);
      const timestamp=validateOccurredAt(event.occurredAt);
      if(!timestamp.ok)return responseError(timestamp.error,400,correlationId);
      const metadata=validateMetadata(eventName,event.metadata);
      if(metadata.ok===false)return responseError(metadata.error,400,correlationId);
      const authorizationError=await authorizeEntity(actor.id,eventName,targetUserId,expectedEntityId);
      if(authorizationError)return responseError(authorizationError,authorizationError==="ENTITY_ACCESS_DENIED"?403:404,correlationId);
      const {error}=await supabaseAdmin.from("aura_interaction_events").insert({event_name:eventName,schema_version:1,source_type:"client",actor_user_id:actor.id,target_user_id:targetUserId,entity_type:catalog.entityType,entity_id:expectedEntityId,client_event_id:clientEventId,dedupe_key:null,occurred_at:timestamp.occurredAt,metadata:metadata.metadata});
      if(error&&error.code!=="23505")throw error;
      accepted.push({duplicate:error?.code==="23505"});
    }
    result=accepted.every(item=>item.duplicate)?"duplicate":"accepted";
    return NextResponse.json({ok:true,accepted:true,duplicate:accepted.every(item=>item.duplicate),correlationId});
  }catch(error){
    if(error instanceof SyntaxError)return responseError("INVALID_JSON",400,correlationId);
    result="failed";console.error("[AURA_EVENT]",{event_name:logEvent,schema_version:1,source_type:"client",result,correlation_id:correlationId,latency_bucket:"unknown"});
    return responseError("EVENT_INGESTION_FAILED",500,correlationId);
  }finally{
    if(result!=="failed"){const elapsed=Date.now()-started;console.info("[AURA_EVENT]",{event_name:logEvent,schema_version:1,source_type:"client",result,correlation_id:correlationId,latency_bucket:elapsed<50?"lt_50ms":elapsed<200?"50_199ms":elapsed<1000?"200_999ms":"1s_plus"});}
  }
}
