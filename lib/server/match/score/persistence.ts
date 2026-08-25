import "server-only";

import {supabaseAdmin} from "../../../supabase-admin";
import {normalizeSnapshotAt} from "../features/time";
import type {AuraScoreV1} from "./types";

export type PersistedAuraScoreV1={id:string;viewer_user_id:string;candidate_user_id:string;feature_schema_version:1;score_version:1;snapshot_at:string;total_score:number;components:AuraScoreV1["components"];reasons:AuraScoreV1["reasons"];flags:AuraScoreV1["flags"];created_at:string};

export async function persistAuraScoreV1(viewerUserId:string,candidateUserId:string,score:AuraScoreV1):Promise<PersistedAuraScoreV1>{
  if(viewerUserId===candidateUserId)throw new Error("SELF_PAIR_NOT_ALLOWED");
  const snapshotAt=normalizeSnapshotAt(score.snapshotAt);
  const record={viewer_user_id:viewerUserId,candidate_user_id:candidateUserId,feature_schema_version:score.featureSchemaVersion,score_version:score.scoreVersion,snapshot_at:snapshotAt,total_score:score.totalScore,components:score.components,reasons:score.reasons,flags:score.flags};
  const columns="id,viewer_user_id,candidate_user_id,feature_schema_version,score_version,snapshot_at,total_score,components,reasons,flags,created_at";
  const inserted=await supabaseAdmin.from("aura_match_score_snapshots").insert(record).select(columns).single();
  if(!inserted.error)return inserted.data as PersistedAuraScoreV1;
  if(inserted.error.code!=="23505")throw inserted.error;
  const existing=await supabaseAdmin.from("aura_match_score_snapshots").select(columns).eq("viewer_user_id",viewerUserId).eq("candidate_user_id",candidateUserId).eq("feature_schema_version",score.featureSchemaVersion).eq("score_version",score.scoreVersion).eq("snapshot_at",snapshotAt).single();
  if(existing.error)throw existing.error;
  return existing.data as PersistedAuraScoreV1;
}
