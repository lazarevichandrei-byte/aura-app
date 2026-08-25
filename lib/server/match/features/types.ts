export const FEATURE_SCHEMA_VERSION=1 as const;

export const PROFILE_COMPLETENESS_BUCKETS=["low","medium","high"] as const;
export const ACTIVITY_AGE_BUCKETS=["lt_1d","1_3d","3_7d","7_30d","30d_plus"] as const;
export const IMPRESSION_AGE_BUCKETS=["none","lt_1h","1_24h","1_7d","7_30d","30d_plus"] as const;
export const DWELL_BUCKETS=["none","lt_2s","2_5s","5_15s","15_30s","30s_plus"] as const;
export const CYCLE_STATUSES=["none","pending","matched","rejected"] as const;

export type ProfileCompletenessBucket=typeof PROFILE_COMPLETENESS_BUCKETS[number];
export type ActivityAgeBucket=typeof ACTIVITY_AGE_BUCKETS[number];
export type ImpressionAgeBucket=typeof IMPRESSION_AGE_BUCKETS[number];
export type DwellBucket=typeof DWELL_BUCKETS[number];
export type CycleStatus=typeof CYCLE_STATUSES[number];

export interface AuraUserFeaturesV1{
  photo_count:number;
  has_bio:boolean;
  has_city:boolean;
  profile_completeness_bucket:ProfileCompletenessBucket;
  likes_7d:number;
  passes_7d:number;
  matches_30d:number;
  profile_impressions_received_7d:number;
  profile_opens_received_7d:number;
  active_days_7d:number;
  active_days_30d:number;
  last_activity_age_bucket:ActivityAgeBucket;
  chats_started_30d:number;
  messages_sent_30d:number;
  meet_created_30d:number;
  meet_join_requests_30d:number;
  meet_join_accepted_30d:number;
  meet_participations_30d:number;
  blocks_created_90d:number;
  reports_created_90d:number;
}

export interface AuraPairFeaturesV1{
  impressions_7d:number;
  impressions_30d:number;
  opens_7d:number;
  opens_30d:number;
  return_to_profile_30d:number;
  max_dwell_bucket_30d:DwellBucket;
  recent_impression_age_bucket:ImpressionAgeBucket;
  prior_like_from_viewer:boolean;
  prior_like_from_candidate:boolean;
  prior_match:boolean;
  prior_reject:boolean;
  current_cycle_status:CycleStatus;
  cooldown_active:boolean;
  has_existing_direct_chat:boolean;
  prior_chat_started:boolean;
  shared_meet_count_90d:number;
  viewer_joined_candidate_meet_90d:boolean;
  candidate_joined_viewer_meet_90d:boolean;
  age_difference:number|null;
  same_city:boolean|null;
}

export type FeatureSnapshot<T>={featureSchemaVersion:1;snapshotAt:string;features:T};

