import {AURA_EVENT_CATALOG,type AuraEventName,type AuraEntityType} from "./catalog";

export const MAX_EVENT_BODY_BYTES=16_384;
export const MAX_EVENT_BATCH_SIZE=10;
export const MAX_CLIENT_EVENT_ID_LENGTH=128;
export const MAX_METADATA_BYTES=1_024;
export const MAX_EVENT_AGE_MS=7*24*60*60*1000;
export const MAX_EVENT_FUTURE_MS=5*60*1000;
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const FORBIDDEN_KEYS=new Set(["actor_user_id","actorUserId","initData","message_body","messageBody","body","last_message","raw_text","text","embedding","metadata_embedding"]);

export type EventValidationError={ok:false;error:string};
export type ValidatedMetadata={ok:true;metadata:Record<string,string|number|boolean>};

export function validateMetadata(eventName:AuraEventName,value:unknown):ValidatedMetadata|EventValidationError{
  if(value===undefined||value===null)value={};
  if(typeof value!=="object"||Array.isArray(value))return {ok:false,error:"INVALID_METADATA"};
  const metadata=value as Record<string,unknown>;
  if(new TextEncoder().encode(JSON.stringify(metadata)).length>MAX_METADATA_BYTES)return {ok:false,error:"METADATA_TOO_LARGE"};
  const rule=AURA_EVENT_CATALOG[eventName].metadata as {required?:readonly string[];allowed?:readonly string[];enums?:Readonly<Record<string,readonly string[]>>};
  const allowed=new Set<string>(rule.allowed??[]);
  for(const key of Object.keys(metadata)){
    if(FORBIDDEN_KEYS.has(key))return {ok:false,error:"FORBIDDEN_METADATA"};
    if(!allowed.has(key))return {ok:false,error:"UNKNOWN_METADATA_FIELD"};
  }
  for(const key of rule.required??[])if(metadata[key]===undefined)return {ok:false,error:"MISSING_METADATA_FIELD"};
  for(const [key,choices] of Object.entries(rule.enums??{}))if(metadata[key]!==undefined&&!choices.includes(String(metadata[key])))return {ok:false,error:"INVALID_METADATA_VALUE"};
  for(const [key,item] of Object.entries(metadata)){
    if(!["string","number","boolean"].includes(typeof item)||typeof item==="string"&&item.length>128||typeof item==="number"&&!Number.isFinite(item))return {ok:false,error:"INVALID_METADATA_VALUE"};
    if((key==="photo_index"||key==="photo_count")&&(!Number.isInteger(item)||Number(item)<0||Number(item)>20))return {ok:false,error:"INVALID_METADATA_VALUE"};
  }
  return {ok:true,metadata:metadata as Record<string,string|number|boolean>};
}

export function validateOccurredAt(value:unknown,now=Date.now()){
  if(typeof value!=="string")return {ok:false,error:"INVALID_OCCURRED_AT"} as const;
  const timestamp=new Date(value).getTime();
  if(!Number.isFinite(timestamp))return {ok:false,error:"INVALID_OCCURRED_AT"} as const;
  if(timestamp<now-MAX_EVENT_AGE_MS)return {ok:false,error:"EVENT_TOO_OLD"} as const;
  if(timestamp>now+MAX_EVENT_FUTURE_MS)return {ok:false,error:"EVENT_IN_FUTURE"} as const;
  return {ok:true,occurredAt:new Date(timestamp).toISOString()} as const;
}

export function validUuid(value:unknown):value is string{return typeof value==="string"&&UUID.test(value);}
export function validEntityType(value:unknown):value is AuraEntityType{return typeof value==="string"&&["user","dating_cycle","dating_match","chat","message","meet_event","meet_request","report","block"].includes(value);}
const PRIVILEGED_EVENT_FIELDS=["actor_user_id","actorUserId","actor_id","actorId","dedupe_key","dedupeKey","source_type","sourceType","schema_version","schemaVersion"] as const;
export function hasPrivilegedEventFields(value:Record<string,unknown>){return PRIVILEGED_EVENT_FIELDS.some((field)=>field in value);}
