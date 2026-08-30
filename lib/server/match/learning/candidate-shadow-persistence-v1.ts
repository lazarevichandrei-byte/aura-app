import "server-only";

import {supabaseAdmin} from "../../../supabase-admin";
import {normalizeSnapshotAt} from "../features/time";
import type {AuraLearningCandidateV1} from "./candidate-v1";

export type PersistAuraCandidateShadowV1Input={
  viewerUserId:string;
  candidateUserId:string;
  snapshotAt:string;
  activeScore:number;
  shadowScore:number;
  candidateScore:number;
  featureSchemaVersion:2;
  candidate:AuraLearningCandidateV1;
};

export async function persistAuraCandidateShadowV1(input:PersistAuraCandidateShadowV1Input){
  if(input.viewerUserId===input.candidateUserId)throw new Error("SELF_PAIR_NOT_ALLOWED");
  const snapshotAt=normalizeSnapshotAt(input.snapshotAt);
  const record={
    viewer_user_id:input.viewerUserId,
    candidate_user_id:input.candidateUserId,
    snapshot_at:snapshotAt,
    candidate_version:input.candidate.version,
    feature_schema_version:input.featureSchemaVersion,
    active_score:input.activeScore,
    shadow_score:input.shadowScore,
    candidate_score:input.candidateScore,
    status:"SHADOW_ONLY",
    model:{sampleSize:input.candidate.sampleSize,eligible:input.candidate.eligible,weights:input.candidate.weights,diagnostics:input.candidate.diagnostics},
  };
  const inserted=await supabaseAdmin.from("aura_candidate_shadow_snapshots").insert(record).select("id").single();
  if(!inserted.error)return inserted.data;
  if(inserted.error.code!=="23505")throw inserted.error;
  const existing=await supabaseAdmin.from("aura_candidate_shadow_snapshots").select("id").eq("viewer_user_id",input.viewerUserId).eq("candidate_user_id",input.candidateUserId).eq("snapshot_at",snapshotAt).eq("candidate_version",input.candidate.version).single();
  if(existing.error)throw existing.error;
  return existing.data;
}
