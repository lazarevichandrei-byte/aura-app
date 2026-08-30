import "server-only";

import {supabaseAdmin} from "../../../supabase-admin";
import {isAuraPairFeaturesV2,isAuraUserFeaturesV2} from "./contracts-v2";
import {normalizeSnapshotAt} from "./time";
import {FEATURE_SCHEMA_VERSION_V2,type AuraPairFeaturesV2,type AuraUserFeaturesV2,type FeatureSnapshotV2} from "./types-v2";

export async function persistUserFeatureSnapshotV2(userId:string,snapshot:FeatureSnapshotV2<AuraUserFeaturesV2>){
  const snapshotAt=normalizeSnapshotAt(snapshot.snapshotAt);
  if(snapshot.featureSchemaVersion!==FEATURE_SCHEMA_VERSION_V2||!isAuraUserFeaturesV2(snapshot.features))throw new Error("INVALID_USER_FEATURE_V2_CONTRACT");
  const record={user_id:userId,feature_schema_version:2,snapshot_at:snapshotAt,features:snapshot.features};
  const columns="id,user_id,feature_schema_version,snapshot_at,features,created_at";
  const inserted=await supabaseAdmin.from("aura_user_feature_snapshots").insert(record).select(columns).single();
  if(!inserted.error)return inserted.data;
  if(inserted.error.code!=="23505")throw inserted.error;
  const existing=await supabaseAdmin.from("aura_user_feature_snapshots").select(columns).eq("user_id",userId).eq("feature_schema_version",2).eq("snapshot_at",snapshotAt).single();
  if(existing.error)throw existing.error;
  return existing.data;
}

export async function persistPairFeatureSnapshotV2(viewerUserId:string,candidateUserId:string,snapshot:FeatureSnapshotV2<AuraPairFeaturesV2>){
  if(viewerUserId===candidateUserId)throw new Error("SELF_PAIR_NOT_ALLOWED");
  const snapshotAt=normalizeSnapshotAt(snapshot.snapshotAt);
  if(snapshot.featureSchemaVersion!==FEATURE_SCHEMA_VERSION_V2||!isAuraPairFeaturesV2(snapshot.features))throw new Error("INVALID_PAIR_FEATURE_V2_CONTRACT");
  const record={viewer_user_id:viewerUserId,candidate_user_id:candidateUserId,feature_schema_version:2,snapshot_at:snapshotAt,features:snapshot.features};
  const columns="id,viewer_user_id,candidate_user_id,feature_schema_version,snapshot_at,features,created_at";
  const inserted=await supabaseAdmin.from("aura_pair_feature_snapshots").insert(record).select(columns).single();
  if(!inserted.error)return inserted.data;
  if(inserted.error.code!=="23505")throw inserted.error;
  const existing=await supabaseAdmin.from("aura_pair_feature_snapshots").select(columns).eq("viewer_user_id",viewerUserId).eq("candidate_user_id",candidateUserId).eq("feature_schema_version",2).eq("snapshot_at",snapshotAt).single();
  if(existing.error)throw existing.error;
  return existing.data;
}
