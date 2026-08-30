import {isAuraPairFeaturesV1,isAuraUserFeaturesV1} from "./contracts";
import type {AuraPairFeaturesV2,AuraUserFeaturesV2} from "./types-v2";

const count=(value:unknown)=>typeof value==="number"&&Number.isInteger(value)&&value>=0;
const finite=(value:unknown)=>typeof value==="number"&&Number.isFinite(value)&&value>=0;
const nullableFinite=(value:unknown)=>value===null||finite(value);

export function isAuraUserFeaturesV2(value:unknown):value is AuraUserFeaturesV2{
  return isAuraUserFeaturesV1(value);
}

export function isAuraPairFeaturesV2(value:unknown):value is AuraPairFeaturesV2{
  if(!value||typeof value!=="object"||Array.isArray(value))return false;
  const row=value as Record<string,unknown>;
  const v1Keys={...row};
  for(const key of [
    "viewer_sent_30d","candidate_sent_30d","viewer_messages_read_by_candidate_30d","candidate_messages_read_by_viewer_30d",
    "viewer_message_read_rate_30d","candidate_message_read_rate_30d","viewer_median_read_seconds_30d","candidate_median_read_seconds_30d",
    "viewer_unread_older_than_24h_30d","candidate_unread_older_than_24h_30d",
  ])delete v1Keys[key];
  if(!isAuraPairFeaturesV1(v1Keys))return false;
  return ["viewer_sent_30d","candidate_sent_30d","viewer_messages_read_by_candidate_30d","candidate_messages_read_by_viewer_30d","viewer_unread_older_than_24h_30d","candidate_unread_older_than_24h_30d"].every(key=>count(row[key]))
    &&["viewer_message_read_rate_30d","candidate_message_read_rate_30d"].every(key=>finite(row[key])&&(row[key] as number)<=1)
    &&nullableFinite(row.viewer_median_read_seconds_30d)&&nullableFinite(row.candidate_median_read_seconds_30d);
}
