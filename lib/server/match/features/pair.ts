import "server-only";

import {supabaseAdmin} from "../../../supabase-admin";
import {isAuraPairFeaturesV1} from "./contracts";
import {normalizeSnapshotAt} from "./time";
import {FEATURE_SCHEMA_VERSION,type AuraPairFeaturesV1,type FeatureSnapshot} from "./types";

export async function buildPairFeatures(viewerUserId:string,candidateUserId:string,snapshotAt:string|Date):Promise<FeatureSnapshot<AuraPairFeaturesV1>>{
  if(viewerUserId===candidateUserId)throw new Error("SELF_PAIR_NOT_ALLOWED");
  const normalizedSnapshotAt=normalizeSnapshotAt(snapshotAt);
  const {data,error}=await supabaseAdmin.rpc("build_aura_pair_features_v1",{p_viewer_user_id:viewerUserId,p_candidate_user_id:candidateUserId,p_snapshot_at:normalizedSnapshotAt});
  if(error)throw error;
  if(!isAuraPairFeaturesV1(data))throw new Error("INVALID_PAIR_FEATURE_CONTRACT");
  return {featureSchemaVersion:FEATURE_SCHEMA_VERSION,snapshotAt:normalizedSnapshotAt,features:data};
}

