import type {AuraPairFeaturesV1,AuraUserFeaturesV1,FeatureSnapshot} from "../features/types";
import {persistPairFeatureSnapshot,persistUserFeatureSnapshot} from "../features/snapshot";
import {buildConversationReadSignalsV1} from "../features/read-signals";
import {persistPairFeatureSnapshotV2,persistUserFeatureSnapshotV2} from "../features/snapshot-v2";
import type {AuraPairFeaturesV2,FeatureSnapshotV2} from "../features/types-v2";
import {persistAuraScore} from "../score/persistence";
import {scoreAuraMatchV2} from "../score/score-v2";
import {scoreAuraMatchV3} from "../score/score-v3";
import {loadAuraTrainingExamplesV1} from "../learning/dataset-v1";
import {createAuraCandidateShadowRuntimeV1,runAuraCandidateShadowV1} from "../learning/candidate-shadow-runtime-v1";
import {persistAuraCandidateShadowV1} from "../learning/candidate-shadow-persistence-v1";
import type {AuraLearningInferenceInputV1} from "../learning/inference-input-v1";
import {AURA_RANKING_V1} from "./rank-v1";
import type {CandidateAuraScoreV1,RankableCandidate} from "./types";

export type AuraRankingDependencies={
  buildUserFeatures:(userId:string,snapshotAt:string)=>Promise<FeatureSnapshot<AuraUserFeaturesV1>>;
  buildPairFeatures:(viewerId:string,candidateId:string,snapshotAt:string)=>Promise<FeatureSnapshot<AuraPairFeaturesV1>>;
};

export async function buildAuraScoresForCandidatesV1<T extends RankableCandidate>(viewerId:string,candidates:readonly T[],snapshotAt:string,dependencies:AuraRankingDependencies):Promise<CandidateAuraScoreV1[]>{
  const boundedCandidates=candidates.slice(0,AURA_RANKING_V1.MAX_CANDIDATES);
  if(boundedCandidates.length===0)return [];
  const viewerSnapshot=await dependencies.buildUserFeatures(viewerId,snapshotAt);
  await persistUserFeatureSnapshot(viewerId,viewerSnapshot);

  let candidateRuntime:ReturnType<typeof createAuraCandidateShadowRuntimeV1>|null=null;
  try{
    const trainingExamples=await loadAuraTrainingExamplesV1("24h",500);
    candidateRuntime=createAuraCandidateShadowRuntimeV1(trainingExamples);
  }catch(error){
    console.warn("AURA_CANDIDATE_SHADOW_RUNTIME_UNAVAILABLE",{code:error instanceof Error?error.message:"UNKNOWN"});
  }

  return Promise.all(boundedCandidates.map(async candidate=>{
    const [candidateSnapshot,pairSnapshot,readSignals]=await Promise.all([
      dependencies.buildUserFeatures(candidate.id,snapshotAt),
      dependencies.buildPairFeatures(viewerId,candidate.id,snapshotAt),
      buildConversationReadSignalsV1(viewerId,candidate.id,snapshotAt),
    ]);
    if(viewerSnapshot.snapshotAt!==snapshotAt||candidateSnapshot.snapshotAt!==snapshotAt||pairSnapshot.snapshotAt!==snapshotAt)throw new Error("SNAPSHOT_AT_MISMATCH");
    await Promise.all([
      persistUserFeatureSnapshot(candidate.id,candidateSnapshot),
      persistPairFeatureSnapshot(viewerId,candidate.id,pairSnapshot),
    ]);

    // Production score stays V2 until shadow models prove themselves on outcomes.
    const score=scoreAuraMatchV2({viewerFeatures:viewerSnapshot.features,candidateFeatures:candidateSnapshot.features,pairFeatures:pairSnapshot.features,featureSchemaVersion:1,snapshotAt});
    await persistAuraScore(viewerId,candidate.id,score);

    const pairV2:FeatureSnapshotV2<AuraPairFeaturesV2>={
      featureSchemaVersion:2,
      snapshotAt,
      features:{...pairSnapshot.features,...readSignals},
    };
    const viewerV2={featureSchemaVersion:2 as const,snapshotAt,features:viewerSnapshot.features};
    const candidateV2={featureSchemaVersion:2 as const,snapshotAt,features:candidateSnapshot.features};
    const shadowScore=scoreAuraMatchV3({
      viewerFeatures:viewerSnapshot.features,
      candidateFeatures:candidateSnapshot.features,
      pairFeatures:pairV2.features,
      snapshotAt,
    });

    await Promise.all([
      persistUserFeatureSnapshotV2(viewerId,viewerV2),
      persistUserFeatureSnapshotV2(candidate.id,candidateV2),
      persistPairFeatureSnapshotV2(viewerId,candidate.id,pairV2),
      persistAuraScore(viewerId,candidate.id,shadowScore),
    ]);

    if(candidateRuntime){
      try{
        const inferenceInput:AuraLearningInferenceInputV1={viewerUserId:viewerId,candidateUserId:candidate.id,snapshotAt,activeScore:score.totalScore,shadowScore:shadowScore.totalScore,featureSchemaVersion:2,pairFeatures:pairV2.features};
        const candidateResult=runAuraCandidateShadowV1(candidateRuntime,inferenceInput);
        if(candidateResult.executed&&candidateResult.score!==null){
          await persistAuraCandidateShadowV1({viewerUserId:viewerId,candidateUserId:candidate.id,snapshotAt,activeScore:score.totalScore,shadowScore:shadowScore.totalScore,candidateScore:candidateResult.score,featureSchemaVersion:2,candidate:candidateRuntime.candidate});
        }
      }catch(error){
        console.warn("AURA_CANDIDATE_SHADOW_SCORE_FAILED",{candidateId:candidate.id,code:error instanceof Error?error.message:"UNKNOWN"});
      }
    }

    return {candidateId:candidate.id,totalScore:score.totalScore};
  }));
}
