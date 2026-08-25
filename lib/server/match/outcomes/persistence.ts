import "server-only";

import {supabaseAdmin} from "../../../supabase-admin";
import {isBuiltAuraOutcomeV1} from "./contracts";
import type {AuraOutcomeAnchorContextV1,AuraOutcomeValuesV1,AuraOutcomeWindowV1,BuiltAuraOutcomeV1} from "./types";

export type PersistedAuraOutcomeV1={id:string;viewer_user_id:string;candidate_user_id:string;anchor_event_id:string;outcome_schema_version:1;window_type:AuraOutcomeWindowV1;anchor_at:string;window_ends_at:string;evaluated_at:string;is_window_complete:true;score_version:1|null;feature_schema_version:1|null;score_snapshot_id:string|null;anchor_context:AuraOutcomeAnchorContextV1;outcomes:AuraOutcomeValuesV1;created_at:string};
const COLUMNS="id,viewer_user_id,candidate_user_id,anchor_event_id,outcome_schema_version,window_type,anchor_at,window_ends_at,evaluated_at,is_window_complete,score_version,feature_schema_version,score_snapshot_id,anchor_context,outcomes,created_at";

export async function persistAuraOutcomeV1(value:BuiltAuraOutcomeV1):Promise<PersistedAuraOutcomeV1>{
  if(!isBuiltAuraOutcomeV1(value))throw new Error("INVALID_AURA_OUTCOME_V1");
  const record={viewer_user_id:value.viewerUserId,candidate_user_id:value.candidateUserId,anchor_event_id:value.anchorEventId,outcome_schema_version:1,window_type:value.windowType,anchor_at:value.anchorAt,window_ends_at:value.windowEndsAt,evaluated_at:value.evaluatedAt,is_window_complete:true,score_version:value.scoreVersion,feature_schema_version:value.featureSchemaVersion,score_snapshot_id:value.scoreSnapshotId,anchor_context:value.anchorContext,outcomes:value.outcomes};
  const inserted=await supabaseAdmin.from("aura_match_outcomes").insert(record).select(COLUMNS).single();
  if(!inserted.error)return inserted.data as PersistedAuraOutcomeV1;
  if(inserted.error.code!=="23505")throw inserted.error;
  const existing=await supabaseAdmin.from("aura_match_outcomes").select(COLUMNS).eq("anchor_event_id",value.anchorEventId).eq("outcome_schema_version",1).eq("window_type",value.windowType).single();
  if(existing.error)throw existing.error;
  return existing.data as PersistedAuraOutcomeV1;
}
