import "server-only";

import {AURA_EVENT_CATALOG,type AuraEntityType,type ServerAuraEventName} from "../../events/catalog";
import {validateMetadata,validUuid} from "../../events/validate";
import {supabaseAdmin} from "../../supabase-admin";

type ServerEventInput={eventName:ServerAuraEventName;actorUserId:string;targetUserId?:string|null;entityType:AuraEntityType;entityId:string;dedupeKey:string;metadata?:Record<string,string|number|boolean>;occurredAt?:string};
export type EventRecordResult={ok:true;duplicate:boolean}|{ok:false;error:string};

export async function recordServerEvent(input:ServerEventInput):Promise<EventRecordResult>{
  const started=Date.now();
  const correlationId=crypto.randomUUID();
  const catalog=AURA_EVENT_CATALOG[input.eventName];
  const metadata=validateMetadata(input.eventName,input.metadata);
  if(catalog.sourceType!=="server"||catalog.entityType!==input.entityType||!validUuid(input.actorUserId)||!validUuid(input.entityId)||input.targetUserId&&!validUuid(input.targetUserId)||catalog.targetRequired&&!input.targetUserId||!metadata.ok||!input.dedupeKey||input.dedupeKey.length>256){
    console.error("[AURA_EVENT]",{event_name:input.eventName,schema_version:1,source_type:"server",result:"rejected",correlation_id:correlationId,latency_bucket:"lt_50ms"});
    return {ok:false,error:metadata.ok?"INVALID_SERVER_EVENT":"INVALID_METADATA"};
  }
  const {error}=await supabaseAdmin.from("aura_interaction_events").insert({
    event_name:input.eventName,schema_version:1,source_type:"server",actor_user_id:input.actorUserId,target_user_id:input.targetUserId??null,
    entity_type:input.entityType,entity_id:input.entityId,client_event_id:null,dedupe_key:input.dedupeKey,
    occurred_at:input.occurredAt??new Date().toISOString(),metadata:metadata.metadata,
  });
  const duplicate=error?.code==="23505";
  const result=!error||duplicate?duplicate?"duplicate":"accepted":"failed";
  const elapsed=Date.now()-started;const latencyBucket=elapsed<50?"lt_50ms":elapsed<200?"50_199ms":elapsed<1000?"200_999ms":"1s_plus";
  (error&&!duplicate?console.error:console.info)("[AURA_EVENT]",{event_name:input.eventName,schema_version:1,source_type:"server",result,correlation_id:correlationId,latency_bucket:latencyBucket,...(error&&!duplicate?{error_code:error.code??"UNKNOWN"}:{})});
  return error&&!duplicate?{ok:false,error:"EVENT_INSERT_FAILED"}:{ok:true,duplicate};
}

export function recordServerEventBestEffort(input:ServerEventInput){
  void recordServerEvent(input).catch(()=>console.error("[AURA_EVENT]",{event_name:input.eventName,schema_version:1,source_type:"server",result:"failed",correlation_id:crypto.randomUUID(),latency_bucket:"unknown"}));
}
