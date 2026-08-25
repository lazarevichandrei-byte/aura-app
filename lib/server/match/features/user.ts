import "server-only";

import {supabaseAdmin} from "../../../supabase-admin";
import {isAuraUserFeaturesV1} from "./contracts";
import {normalizeSnapshotAt} from "./time";
import {FEATURE_SCHEMA_VERSION,type FeatureSnapshot,type AuraUserFeaturesV1} from "./types";

export async function buildUserFeatures(userId:string,snapshotAt:string|Date):Promise<FeatureSnapshot<AuraUserFeaturesV1>>{
  const normalizedSnapshotAt=normalizeSnapshotAt(snapshotAt);
  const {data,error}=await supabaseAdmin.rpc("build_aura_user_features_v1",{p_user_id:userId,p_snapshot_at:normalizedSnapshotAt});
  if(error)throw error;
  if(!isAuraUserFeaturesV1(data))throw new Error("INVALID_USER_FEATURE_CONTRACT");
  return {featureSchemaVersion:FEATURE_SCHEMA_VERSION,snapshotAt:normalizedSnapshotAt,features:data};
}

