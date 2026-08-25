export const AURA_OUTCOME_SCHEMA_VERSION=1 as const;
export const AURA_OUTCOME_WINDOWS=["24h","7d","30d"] as const;
export type AuraOutcomeWindowV1=typeof AURA_OUTCOME_WINDOWS[number];

export type AuraOutcomeValuesV1={
  profile_opened:boolean;
  return_to_profile:boolean;
  liked:boolean;
  passed:boolean;
  matched:boolean;
  chat_started:boolean;
  messages_sent_by_viewer:number;
  messages_sent_by_candidate:number;
  shared_meet_activity:boolean;
  viewer_joined_candidate_meet:boolean;
  candidate_joined_viewer_meet:boolean;
  blocked:boolean;
  reported:boolean;
};

export type AuraOutcomeAnchorContextV1={source:string|null;position_bucket:string|null};

export type BuiltAuraOutcomeV1={
  outcomeSchemaVersion:1;
  viewerUserId:string;
  candidateUserId:string;
  anchorEventId:string;
  anchorAt:string;
  windowType:AuraOutcomeWindowV1;
  windowEndsAt:string;
  evaluatedAt:string;
  scoreSnapshotId:string|null;
  scoreVersion:1|null;
  featureSchemaVersion:1|null;
  anchorContext:AuraOutcomeAnchorContextV1;
  outcomes:AuraOutcomeValuesV1;
};

export type AuraOutcomeMetricsV1={impression_count:number;open_rate:number;like_rate:number;pass_rate:number;match_rate:number;chat_start_rate:number;meet_activity_rate:number;block_rate:number;report_rate:number};
export type AuraScoreBucketV1="0-19"|"20-39"|"40-59"|"60-79"|"80-100";
