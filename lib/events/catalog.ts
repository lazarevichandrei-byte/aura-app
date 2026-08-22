export const CLIENT_EVENT_NAMES=[
  "profile_impression","profile_open","profile_dwell_bucket","return_to_profile","meet_viewed","match_opened",
] as const;

export const SERVER_EVENT_NAMES=[
  "like","pass","match_created","chat_started","message_sent_metadata","meet_created","meet_join_request",
  "meet_join_accepted","meet_join_rejected","meet_chat_joined","meet_participant_left","meet_cancelled","meet_updated","block","report",
] as const;

export type ClientAuraEventName=typeof CLIENT_EVENT_NAMES[number];
export type ServerAuraEventName=typeof SERVER_EVENT_NAMES[number];
export type AuraEventName=ClientAuraEventName|ServerAuraEventName;
export type AuraEntityType="user"|"dating_cycle"|"dating_match"|"chat"|"message"|"meet_event"|"meet_request"|"report"|"block";
export type AuraEventSourceType="client"|"server";

type MetadataRule={required?:readonly string[];allowed?:readonly string[];enums?:Readonly<Record<string,readonly string[]>>};
type CatalogEntry={sourceType:AuraEventSourceType;schemaVersion:1;targetRequired:boolean;entityType:AuraEntityType|null;metadata:MetadataRule};

const SOURCE=["home_feed","aura_match_future"] as const;
const POSITION=["0_4","5_9","10_plus"] as const;
const DWELL=["lt_2s","2_5s","5_15s","15_30s","30s_plus"] as const;

export const AURA_EVENT_CATALOG={
  profile_impression:{sourceType:"client",schemaVersion:1,targetRequired:true,entityType:"user",metadata:{required:["source","position_bucket"],allowed:["source","position_bucket","photo_index","photo_count"],enums:{source:SOURCE,position_bucket:POSITION}}},
  profile_open:{sourceType:"client",schemaVersion:1,targetRequired:true,entityType:"user",metadata:{required:["source"],allowed:["source"],enums:{source:SOURCE}}},
  profile_dwell_bucket:{sourceType:"client",schemaVersion:1,targetRequired:true,entityType:"user",metadata:{required:["source","bucket"],allowed:["source","bucket"],enums:{source:SOURCE,bucket:DWELL}}},
  return_to_profile:{sourceType:"client",schemaVersion:1,targetRequired:true,entityType:"user",metadata:{required:["source"],allowed:["source"],enums:{source:SOURCE}}},
  meet_viewed:{sourceType:"client",schemaVersion:1,targetRequired:false,entityType:"meet_event",metadata:{allowed:[]}},
  match_opened:{sourceType:"client",schemaVersion:1,targetRequired:false,entityType:"chat",metadata:{allowed:[]}},
  like:{sourceType:"server",schemaVersion:1,targetRequired:true,entityType:"dating_cycle",metadata:{allowed:[]}},
  pass:{sourceType:"server",schemaVersion:1,targetRequired:true,entityType:"dating_cycle",metadata:{allowed:[]}},
  match_created:{sourceType:"server",schemaVersion:1,targetRequired:true,entityType:"dating_match",metadata:{allowed:["chat_id"]}},
  chat_started:{sourceType:"server",schemaVersion:1,targetRequired:true,entityType:"chat",metadata:{allowed:[]}},
  message_sent_metadata:{sourceType:"server",schemaVersion:1,targetRequired:false,entityType:"message",metadata:{required:["chat_id","is_first_message"],allowed:["chat_id","is_first_message"]}},
  meet_created:{sourceType:"server",schemaVersion:1,targetRequired:false,entityType:"meet_event",metadata:{allowed:[]}},
  meet_join_request:{sourceType:"server",schemaVersion:1,targetRequired:true,entityType:"meet_request",metadata:{required:["meet_event_id"],allowed:["meet_event_id"]}},
  meet_join_accepted:{sourceType:"server",schemaVersion:1,targetRequired:true,entityType:"meet_request",metadata:{required:["meet_event_id"],allowed:["meet_event_id"]}},
  meet_join_rejected:{sourceType:"server",schemaVersion:1,targetRequired:true,entityType:"meet_request",metadata:{required:["meet_event_id"],allowed:["meet_event_id"]}},
  meet_chat_joined:{sourceType:"server",schemaVersion:1,targetRequired:false,entityType:"chat",metadata:{required:["meet_event_id"],allowed:["meet_event_id"]}},
  meet_participant_left:{sourceType:"server",schemaVersion:1,targetRequired:true,entityType:"meet_event",metadata:{allowed:[]}},
  meet_cancelled:{sourceType:"server",schemaVersion:1,targetRequired:false,entityType:"meet_event",metadata:{allowed:[]}},
  meet_updated:{sourceType:"server",schemaVersion:1,targetRequired:false,entityType:"meet_event",metadata:{allowed:["change_bucket"],enums:{change_bucket:["details","time_or_place"]}}},
  block:{sourceType:"server",schemaVersion:1,targetRequired:true,entityType:"block",metadata:{allowed:[]}},
  report:{sourceType:"server",schemaVersion:1,targetRequired:true,entityType:"report",metadata:{required:["category"],allowed:["category"],enums:{category:["spam","fake_account","harassment","inappropriate_content","other"]}}},
} as const satisfies Record<AuraEventName,CatalogEntry>;

export const isAuraEventName=(value:string):value is AuraEventName=>value in AURA_EVENT_CATALOG;
export const isClientAuraEventName=(value:string):value is ClientAuraEventName=>isAuraEventName(value)&&AURA_EVENT_CATALOG[value].sourceType==="client";
