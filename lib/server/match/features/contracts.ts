import {ACTIVITY_AGE_BUCKETS,CYCLE_STATUSES,DWELL_BUCKETS,IMPRESSION_AGE_BUCKETS,PROFILE_COMPLETENESS_BUCKETS,type AuraPairFeaturesV1,type AuraUserFeaturesV1} from "./types";

const USER_KEYS=["photo_count","has_bio","has_city","profile_completeness_bucket","likes_7d","passes_7d","matches_30d","profile_impressions_received_7d","profile_opens_received_7d","active_days_7d","active_days_30d","last_activity_age_bucket","chats_started_30d","messages_sent_30d","meet_created_30d","meet_join_requests_30d","meet_join_accepted_30d","meet_participations_30d","blocks_created_90d","reports_created_90d"] as const;
const BASE_PAIR_KEYS=["impressions_7d","impressions_30d","opens_7d","opens_30d","return_to_profile_30d","max_dwell_bucket_30d","recent_impression_age_bucket","prior_like_from_viewer","prior_like_from_candidate","prior_match","prior_reject","current_cycle_status","cooldown_active","has_existing_direct_chat","prior_chat_started","shared_meet_count_90d","viewer_joined_candidate_meet_90d","candidate_joined_viewer_meet_90d","age_difference","same_city"] as const;
const CONVERSATION_PAIR_KEYS=["direct_message_count_30d","viewer_message_count_30d","candidate_message_count_30d","viewer_avg_message_chars_30d","candidate_avg_message_chars_30d","viewer_median_message_chars_30d","candidate_median_message_chars_30d","viewer_long_messages_30d","candidate_long_messages_30d","viewer_short_messages_30d","candidate_short_messages_30d","viewer_question_messages_30d","candidate_question_messages_30d","viewer_meet_intent_messages_30d","candidate_meet_intent_messages_30d","viewer_median_reply_seconds_30d","candidate_median_reply_seconds_30d","active_chat_days_30d","conversation_span_days","longest_viewer_burst","longest_candidate_burst","message_balance_ratio","viewer_started_conversation","candidate_started_conversation","mutual_conversation"] as const;
const PAIR_KEYS=[...BASE_PAIR_KEYS,...CONVERSATION_PAIR_KEYS] as const;
const isObject=(value:unknown):value is Record<string,unknown>=>Boolean(value)&&typeof value==="object"&&!Array.isArray(value);
const exactKeys=(value:Record<string,unknown>,keys:readonly string[])=>Object.keys(value).length===keys.length&&keys.every(key=>key in value);
const count=(value:unknown)=>typeof value==="number"&&Number.isInteger(value)&&value>=0;
const finite=(value:unknown)=>typeof value==="number"&&Number.isFinite(value)&&value>=0;
const bool=(value:unknown)=>typeof value==="boolean";
const nullableFinite=(value:unknown)=>value===null||finite(value);
const oneOf=<T extends string>(value:unknown,values:readonly T[]):value is T=>typeof value==="string"&&values.includes(value as T);

export function isAuraUserFeaturesV1(value:unknown):value is AuraUserFeaturesV1{
  if(!isObject(value)||!exactKeys(value,USER_KEYS))return false;
  return count(value.photo_count)&&bool(value.has_bio)&&bool(value.has_city)&&oneOf(value.profile_completeness_bucket,PROFILE_COMPLETENESS_BUCKETS)
    &&["likes_7d","passes_7d","matches_30d","profile_impressions_received_7d","profile_opens_received_7d","active_days_7d","active_days_30d","chats_started_30d","messages_sent_30d","meet_created_30d","meet_join_requests_30d","meet_join_accepted_30d","meet_participations_30d","blocks_created_90d","reports_created_90d"].every(key=>count(value[key]))
    &&oneOf(value.last_activity_age_bucket,ACTIVITY_AGE_BUCKETS);
}

export function isAuraPairFeaturesV1(value:unknown):value is AuraPairFeaturesV1{
  if(!isObject(value)||!exactKeys(value,PAIR_KEYS))return false;
  const baseOk=["impressions_7d","impressions_30d","opens_7d","opens_30d","return_to_profile_30d","shared_meet_count_90d"].every(key=>count(value[key]))
    &&["prior_like_from_viewer","prior_like_from_candidate","prior_match","prior_reject","cooldown_active","has_existing_direct_chat","prior_chat_started","viewer_joined_candidate_meet_90d","candidate_joined_viewer_meet_90d"].every(key=>bool(value[key]))
    &&oneOf(value.max_dwell_bucket_30d,DWELL_BUCKETS)&&oneOf(value.recent_impression_age_bucket,IMPRESSION_AGE_BUCKETS)&&oneOf(value.current_cycle_status,CYCLE_STATUSES)
    &&(value.age_difference===null||count(value.age_difference))&&(value.same_city===null||bool(value.same_city));
  const countKeys=["direct_message_count_30d","viewer_message_count_30d","candidate_message_count_30d","viewer_long_messages_30d","candidate_long_messages_30d","viewer_short_messages_30d","candidate_short_messages_30d","viewer_question_messages_30d","candidate_question_messages_30d","viewer_meet_intent_messages_30d","candidate_meet_intent_messages_30d","active_chat_days_30d","conversation_span_days","longest_viewer_burst","longest_candidate_burst"];
  const finiteKeys=["viewer_avg_message_chars_30d","candidate_avg_message_chars_30d","viewer_median_message_chars_30d","candidate_median_message_chars_30d","message_balance_ratio"];
  return baseOk&&countKeys.every(key=>count(value[key]))&&finiteKeys.every(key=>finite(value[key]))&&nullableFinite(value.viewer_median_reply_seconds_30d)&&nullableFinite(value.candidate_median_reply_seconds_30d)&&["viewer_started_conversation","candidate_started_conversation","mutual_conversation"].every(key=>bool(value[key]));
}
