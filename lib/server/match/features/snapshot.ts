import "server-only";

import {supabaseAdmin} from "../../../supabase-admin";
import {isAuraPairFeaturesV1,isAuraUserFeaturesV1} from "./contracts";
import {normalizeSnapshotAt} from "./time";
import {FEATURE_SCHEMA_VERSION,type AuraPairFeaturesV1,type AuraUserFeaturesV1,type FeatureSnapshot} from "./types";

type PersistedUserSnapshot={id:string;user_id:string;feature_schema_version:number;snapshot_at:string;features:AuraUserFeaturesV1;created_at:string};
type PersistedPairSnapshot={id:string;viewer_user_id:string;candidate_user_id:string;feature_schema_version:number;snapshot_at:string;features:AuraPairFeaturesV1;created_at:string};

export async function persistUserFeatureSnapshot(userId:string,snapshot:FeatureSnapshot<AuraUserFeaturesV1>):Promise<PersistedUserSnapshot>{
  const snapshotAt=normalizeSnapshotAt(snapshot.snapshotAt);
  if(snapshot.featureSchemaVersion!==FEATURE_SCHEMA_VERSION||!isAuraUserFeaturesV1(snapshot.features))throw new Error("INVALID_USER_FEATURE_CONTRACT");
  const inserted=await supabaseAdmin.from("aura_user_feature_snapshots").insert({user_id:userId,feature_schema_version:FEATURE_SCHEMA_VERSION,snapshot_at:snapshotAt,features:snapshot.features}).select("id,user_id,feature_schema_version,snapshot_at,features,created_at").single();
  if(!inserted.error)return inserted.data as PersistedUserSnapshot;
  if(inserted.error.code!=="23505")throw inserted.error;
  const existing=await supabaseAdmin.from("aura_user_feature_snapshots").select("id,user_id,feature_schema_version,snapshot_at,features,created_at").eq("user_id",userId).eq("feature_schema_version",FEATURE_SCHEMA_VERSION).eq("snapshot_at",snapshotAt).single();
  if(existing.error)throw existing.error;
  return existing.data as PersistedUserSnapshot;
}

export async function persistPairFeatureSnapshot(viewerUserId:string,candidateUserId:string,snapshot:FeatureSnapshot<AuraPairFeaturesV1>):Promise<PersistedPairSnapshot>{
  if(viewerUserId===candidateUserId)throw new Error("SELF_PAIR_NOT_ALLOWED");
  const snapshotAt=normalizeSnapshotAt(snapshot.snapshotAt);
  if(snapshot.featureSchemaVersion!==FEATURE_SCHEMA_VERSION||!isAuraPairFeaturesV1(snapshot.features))throw new Error("INVALID_PAIR_FEATURE_CONTRACT");
  const inserted=await supabaseAdmin.from("aura_pair_feature_snapshots").insert({viewer_user_id:viewerUserId,candidate_user_id:candidateUserId,feature_schema_version:FEATURE_SCHEMA_VERSION,snapshot_at:snapshotAt,features:snapshot.features}).select("id,viewer_user_id,candidate_user_id,feature_schema_version,snapshot_at,features,created_at").single();
  if(!inserted.error)return inserted.data as PersistedPairSnapshot;
  if(inserted.error.code!=="23505")throw inserted.error;
  const existing=await supabaseAdmin.from("aura_pair_feature_snapshots").select("id,viewer_user_id,candidate_user_id,feature_schema_version,snapshot_at,features,created_at").eq("viewer_user_id",viewerUserId).eq("candidate_user_id",candidateUserId).eq("feature_schema_version",FEATURE_SCHEMA_VERSION).eq("snapshot_at",snapshotAt).single();
  if(existing.error)throw existing.error;
  return existing.data as PersistedPairSnapshot;
}

