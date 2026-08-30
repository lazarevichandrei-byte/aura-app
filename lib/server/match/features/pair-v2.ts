import "server-only";

import {buildPairFeatures} from "./pair";
import {buildConversationReadSignalsV1} from "./read-signals";
import {isAuraPairFeaturesV2} from "./contracts-v2";
import {normalizeSnapshotAt} from "./time";
import {FEATURE_SCHEMA_VERSION_V2,type AuraPairFeaturesV2,type FeatureSnapshotV2} from "./types-v2";

export async function buildPairFeaturesV2(viewerUserId:string,candidateUserId:string,snapshotAt:string|Date):Promise<FeatureSnapshotV2<AuraPairFeaturesV2>>{
  if(viewerUserId===candidateUserId)throw new Error("SELF_PAIR_NOT_ALLOWED");
  const normalizedSnapshotAt=normalizeSnapshotAt(snapshotAt);
  const [base,readSignals]=await Promise.all([
    buildPairFeatures(viewerUserId,candidateUserId,normalizedSnapshotAt),
    buildConversationReadSignalsV1(viewerUserId,candidateUserId,normalizedSnapshotAt),
  ]);
  const features={...base.features,...readSignals};
  if(!isAuraPairFeaturesV2(features))throw new Error("INVALID_PAIR_FEATURE_V2_CONTRACT");
  return {featureSchemaVersion:FEATURE_SCHEMA_VERSION_V2,snapshotAt:normalizedSnapshotAt,features};
}
