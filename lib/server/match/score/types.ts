import type {AuraPairFeaturesV1,AuraUserFeaturesV1} from "../features/types";

export const AURA_SCORE_VERSION=1 as const;
export const AURA_SCORE_COMPONENTS=["compatibility","interest","reciprocity","engagement","freshness","safety"] as const;
export type AuraScoreComponentV1=typeof AURA_SCORE_COMPONENTS[number];

export const AURA_SCORE_REASON_CODES_V1=[
  "SAME_CITY","AGE_CLOSE","AGE_COMPATIBLE","VIEWER_LIKED","CANDIDATE_LIKED","MUTUAL_LIKE",
  "PROFILE_IMPRESSIONS","PROFILE_OPENS","REPEATED_PROFILE_OPEN","RETURNED_TO_PROFILE","LONG_DWELL",
  "RECENT_INTERACTION","SHARED_MEET_ACTIVITY","BOTH_ACTIVE","LOW_RECENT_ACTIVITY","CREATED_BLOCK_ACTIVITY",
  "CREATED_REPORT_ACTIVITY","COOLDOWN_ACTIVE","PRIOR_MATCH","EXISTING_CHAT","PREVIOUS_REJECT",
] as const;
export type AuraScoreReasonCodeV1=typeof AURA_SCORE_REASON_CODES_V1[number];

export type AuraScoreReasonV1={code:AuraScoreReasonCodeV1;component:AuraScoreComponentV1;contribution:number};
export type AuraScoreComponentsV1={compatibility:number;interest:number;reciprocity:number;engagement:number;freshness:number;safety:number};
export type AuraScoreFlagsV1={cooldownActive:boolean;priorMatch:boolean;existingChat:boolean;currentCycleStatus:AuraPairFeaturesV1["current_cycle_status"]};

export type AuraScoreV1={
  scoreVersion:1;
  featureSchemaVersion:1;
  snapshotAt:string;
  totalScore:number;
  components:AuraScoreComponentsV1;
  reasons:AuraScoreReasonV1[];
  flags:AuraScoreFlagsV1;
};

export type ScoreAuraMatchV1Input={
  viewerFeatures:AuraUserFeaturesV1;
  candidateFeatures:AuraUserFeaturesV1;
  pairFeatures:AuraPairFeaturesV1;
  featureSchemaVersion:1;
  snapshotAt:string;
};
