import "server-only";

import {supabaseAdmin} from "../../../supabase-admin";
import {buildConversationFeaturesV1} from "./conversation";
import {isAuraPairFeaturesV1} from "./contracts";
import {normalizeSnapshotAt} from "./time";
import {FEATURE_SCHEMA_VERSION,type AuraPairFeaturesV1,type FeatureSnapshot} from "./types";

export async function buildPairFeatures(viewerUserId:string,candidateUserId:string,snapshotAt:string|Date):Promise<FeatureSnapshot<AuraPairFeaturesV1>>{
  if(viewerUserId===candidateUserId)throw new Error("SELF_PAIR_NOT_ALLOWED");
  const normalizedSnapshotAt=normalizeSnapshotAt(snapshotAt);
  const [{data,error},conversation]=await Promise.all([
    supabaseAdmin.rpc("build_aura_pair_features_v1",{p_viewer_user_id:viewerUserId,p_candidate_user_id:candidateUserId,p_snapshot_at:normalizedSnapshotAt}),
    buildConversationFeaturesV1(viewerUserId,candidateUserId,normalizedSnapshotAt),
  ]);
  if(error)throw error;
  const features={...(data as Record<string,unknown>),...conversation};
  if(!isAuraPairFeaturesV1(features))throw new Error("INVALID_PAIR_FEATURE_CONTRACT");
  return {featureSchemaVersion:FEATURE_SCHEMA_VERSION,snapshotAt:normalizedSnapshotAt,features};
}
