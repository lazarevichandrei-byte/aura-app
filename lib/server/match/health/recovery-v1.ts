import "server-only";
import {buildPairFeatures,buildUserFeatures} from "../features";
import {buildConversationReadSignalsV1} from "../features/read-signals";
import {persistPairFeatureSnapshotV2,persistUserFeatureSnapshotV2} from "../features/snapshot-v2";
import type {AuraPairFeaturesV2,FeatureSnapshotV2} from "../features/types-v2";
import {scoreAuraMatchV2} from "../score/score-v2";
import {scoreAuraMatchV3} from "../score/score-v3";
import {persistAuraScore} from "../score/persistence";
import {loadLatestEligibleAuraLearningCandidateV1} from "../learning/candidate-model-registry-v1";
import {scoreAuraLearningCandidateV1} from "../learning/candidate-v1";
import {persistAuraCandidateShadowV1} from "../learning/candidate-shadow-persistence-v1";
import type {AuraLearningInferenceInputV1} from "../learning/inference-input-v1";
import {loadDueAuraBrainRetriesV1,rescheduleAuraBrainRuntimeEventV1,resolveAuraBrainRuntimeEventV1,type AuraBrainRetryRowV1} from "./runtime-events-v1";

const errorCode=(error:unknown)=>error instanceof Error?error.message:"UNKNOWN";

async function retryPairShadowV1(row:AuraBrainRetryRowV1){
  if(!row.viewerUserId||!row.candidateUserId||!row.snapshotAt)throw new Error("RETRY_CONTEXT_MISSING");
  const [viewerSnapshot,candidateSnapshot,pairSnapshot,readSignals]=await Promise.all([
    buildUserFeatures(row.viewerUserId,row.snapshotAt),
    buildUserFeatures(row.candidateUserId,row.snapshotAt),
    buildPairFeatures(row.viewerUserId,row.candidateUserId,row.snapshotAt),
    buildConversationReadSignalsV1(row.viewerUserId,row.candidateUserId,row.snapshotAt),
  ]);
  const pairV2:FeatureSnapshotV2<AuraPairFeaturesV2>={featureSchemaVersion:2,snapshotAt:row.snapshotAt,features:{...pairSnapshot.features,...readSignals}};
  const viewerV2={featureSchemaVersion:2 as const,snapshotAt:row.snapshotAt,features:viewerSnapshot.features};
  const candidateV2={featureSchemaVersion:2 as const,snapshotAt:row.snapshotAt,features:candidateSnapshot.features};
  const activeScore=scoreAuraMatchV2({viewerFeatures:viewerSnapshot.features,candidateFeatures:candidateSnapshot.features,pairFeatures:pairSnapshot.features,featureSchemaVersion:1,snapshotAt:row.snapshotAt});
  const shadowScore=scoreAuraMatchV3({viewerFeatures:viewerSnapshot.features,candidateFeatures:candidateSnapshot.features,pairFeatures:pairV2.features,snapshotAt:row.snapshotAt});

  await Promise.all([
    persistUserFeatureSnapshotV2(row.viewerUserId,viewerV2),
    persistUserFeatureSnapshotV2(row.candidateUserId,candidateV2),
    persistPairFeatureSnapshotV2(row.viewerUserId,row.candidateUserId,pairV2),
    persistAuraScore(row.viewerUserId,row.candidateUserId,shadowScore),
  ]);

  const model=await loadLatestEligibleAuraLearningCandidateV1();
  if(model){
    const input:AuraLearningInferenceInputV1={viewerUserId:row.viewerUserId,candidateUserId:row.candidateUserId,snapshotAt:row.snapshotAt,activeScore:activeScore.totalScore,shadowScore:shadowScore.totalScore,featureSchemaVersion:2,pairFeatures:pairV2.features};
    const candidateScore=Number(scoreAuraLearningCandidateV1(input,model).toFixed(4));
    await persistAuraCandidateShadowV1({viewerUserId:row.viewerUserId,candidateUserId:row.candidateUserId,snapshotAt:row.snapshotAt,activeScore:activeScore.totalScore,shadowScore:shadowScore.totalScore,candidateScore,featureSchemaVersion:2,candidate:model});
  }
}

async function retryRegistryV1(){
  await loadLatestEligibleAuraLearningCandidateV1();
}

export async function recoverAuraBrainRuntimeV1(limit=25){
  const rows=await loadDueAuraBrainRetriesV1(limit);
  let resolved=0;
  let rescheduled=0;
  for(const row of rows){
    try{
      if(row.component==="CANDIDATE_REGISTRY")await retryRegistryV1();
      else if(row.component==="SHADOW_V3"||row.component==="CANDIDATE")await retryPairShadowV1(row);
      else throw new Error("UNSUPPORTED_RETRY_COMPONENT");
      await resolveAuraBrainRuntimeEventV1(row.id);
      resolved+=1;
    }catch(error){
      await rescheduleAuraBrainRuntimeEventV1(row.id,row.retryAttempts,errorCode(error));
      rescheduled+=1;
    }
  }
  return {processed:rows.length,resolved,rescheduled};
}
