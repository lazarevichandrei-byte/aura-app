import "server-only";

import {buildPairFeatures,buildUserFeatures,persistPairFeatureSnapshot,persistUserFeatureSnapshot} from "../features";
import {normalizeSnapshotAt} from "../features/time";
import {persistAuraScoreV1} from "./persistence";
import {scoreAuraMatchV1} from "./score-v1";

export async function buildAndPersistAuraScoreV1(viewerId:string,candidateId:string,snapshotAt:string|Date){
  if(viewerId===candidateId)throw new Error("SELF_PAIR_NOT_ALLOWED");
  const normalizedSnapshotAt=normalizeSnapshotAt(snapshotAt);
  const [viewerSnapshot,candidateSnapshot,pairSnapshot]=await Promise.all([
    buildUserFeatures(viewerId,normalizedSnapshotAt),
    buildUserFeatures(candidateId,normalizedSnapshotAt),
    buildPairFeatures(viewerId,candidateId,normalizedSnapshotAt),
  ]);
  if(viewerSnapshot.snapshotAt!==normalizedSnapshotAt||candidateSnapshot.snapshotAt!==normalizedSnapshotAt||pairSnapshot.snapshotAt!==normalizedSnapshotAt)throw new Error("SNAPSHOT_AT_MISMATCH");
  await Promise.all([
    persistUserFeatureSnapshot(viewerId,viewerSnapshot),
    persistUserFeatureSnapshot(candidateId,candidateSnapshot),
    persistPairFeatureSnapshot(viewerId,candidateId,pairSnapshot),
  ]);
  const score=scoreAuraMatchV1({viewerFeatures:viewerSnapshot.features,candidateFeatures:candidateSnapshot.features,pairFeatures:pairSnapshot.features,featureSchemaVersion:1,snapshotAt:normalizedSnapshotAt});
  const persisted=await persistAuraScoreV1(viewerId,candidateId,score);
  return {score,persisted,features:{viewer:viewerSnapshot,candidate:candidateSnapshot,pair:pairSnapshot}};
}
