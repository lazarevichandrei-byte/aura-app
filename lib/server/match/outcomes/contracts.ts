import {AURA_OUTCOME_WINDOWS,type AuraOutcomeValuesV1,type BuiltAuraOutcomeV1} from "./types";

const OUTCOME_KEYS=["profile_opened","return_to_profile","liked","passed","matched","chat_started","messages_sent_by_viewer","messages_sent_by_candidate","shared_meet_activity","viewer_joined_candidate_meet","candidate_joined_viewer_meet","blocked","reported"] as const;
const BUILD_KEYS=["outcomeSchemaVersion","viewerUserId","candidateUserId","anchorEventId","anchorAt","windowType","windowEndsAt","evaluatedAt","scoreSnapshotId","scoreVersion","featureSchemaVersion","anchorContext","outcomes"] as const;
const object=(value:unknown):value is Record<string,unknown>=>Boolean(value)&&typeof value==="object"&&!Array.isArray(value);
const exact=(value:Record<string,unknown>,keys:readonly string[])=>Object.keys(value).length===keys.length&&keys.every(key=>key in value);
const nonnegativeInteger=(value:unknown)=>typeof value==="number"&&Number.isInteger(value)&&value>=0;

export function isAuraOutcomeValuesV1(value:unknown):value is AuraOutcomeValuesV1{
  if(!object(value)||!exact(value,OUTCOME_KEYS))return false;
  return OUTCOME_KEYS.filter(key=>!key.startsWith("messages_sent_")).every(key=>typeof value[key]==="boolean")
    &&nonnegativeInteger(value.messages_sent_by_viewer)&&nonnegativeInteger(value.messages_sent_by_candidate);
}

export function isBuiltAuraOutcomeV1(value:unknown):value is BuiltAuraOutcomeV1{
  if(!object(value)||!exact(value,BUILD_KEYS)||value.outcomeSchemaVersion!==1||typeof value.viewerUserId!=="string"||typeof value.candidateUserId!=="string"||typeof value.anchorEventId!=="string"||typeof value.anchorAt!=="string"||typeof value.windowEndsAt!=="string"||typeof value.evaluatedAt!=="string"||!AURA_OUTCOME_WINDOWS.includes(value.windowType as never)||!isAuraOutcomeValuesV1(value.outcomes)||!object(value.anchorContext))return false;
  if(!exact(value.anchorContext,["source","position_bucket"])||![value.anchorContext.source,value.anchorContext.position_bucket].every(item=>item===null||typeof item==="string"))return false;
  return value.scoreSnapshotId===null?value.scoreVersion===null&&value.featureSchemaVersion===null:typeof value.scoreSnapshotId==="string"&&value.scoreVersion===1&&value.featureSchemaVersion===1;
}
