import type {AuraPairFeaturesV1,AuraUserFeaturesV1,FeatureSnapshot} from "../features/types";
import {persistPairFeatureSnapshot,persistUserFeatureSnapshot} from "../features/snapshot";
import {buildConversationReadSignalsV1} from "../features/read-signals";
import {persistPairFeatureSnapshotV2,persistUserFeatureSnapshotV2} from "../features/snapshot-v2";
import type {AuraPairFeaturesV2,FeatureSnapshotV2} from "../features/types-v2";
import {persistAuraScore} from "../score/persistence";
import {scoreAuraMatchV2} from "../score/score-v2";
import {scoreAuraMatchV3} from "../score/score-v3";
import {loadLatestEligibleAuraLearningCandidateV1} from "../learning/candidate-model-registry-v1";
import {scoreAuraLearningCandidateV1} from "../learning/candidate-v1";
import {persistAuraCandidateShadowV1} from "../learning/candidate-shadow-persistence-v1";
import type {AuraLearningInferenceInputV1} from "../learning/inference-input-v1";
import {recordAuraBrainRuntimeEventV1} from "../health/runtime-events-v1";
import {AURA_RANKING_V1} from "./rank-v1";
import type {CandidateAuraScoreV1,RankableCandidate} from "./types";

export type AuraRankingDependencies={
  buildUserFeatures:(userId:string,snapshotAt:string)=>Promise<FeatureSnapshot<AuraUserFeaturesV1>>;
  buildPairFeatures:(viewerId:string,candidateId:string,snapshotAt:string)=>Promise<FeatureSnapshot<AuraPairFeaturesV1>>;
};

const errorCode=(error:unknown)=>error instanceof Error?error.message:"UNKNOWN";

export async function buildAuraScoresForCandidatesV1<T extends RankableCandidate>(viewerId:string,candidates:readonly T[],snapshotAt:string,dependencies:AuraRankingDependencies):Promise<CandidateAuraScoreV1[]>{
  const boundedCandidates=candidates.slice(0,AURA_RANKING_V1.MAX_CANDIDATES);
  if(boundedCandidates.length===0)return [];

  const viewerSnapshot=await dependencies.buildUserFeatures(viewerId,snapshotAt);
  await persistUserFeatureSnapshot(viewerId,viewerSnapshot);

  let candidateModel:Awaited<ReturnType<typeof loadLatestEligibleAuraLearningCandidateV1>>=null;
  try{
    candidateModel=await loadLatestEligibleAuraLearningCandidateV1();
  }catch(error){
    const code=errorCode(error);
    console.warn("AURA_CANDIDATE_REGISTRY_UNAVAILABLE",{code});
    await recordAuraBrainRuntimeEventV1({
      component:"CANDIDATE_REGISTRY",
      stage:"LOAD_MODEL",
      severity:"WARN",
      code,
      viewerUserId:viewerId,
      snapshotAt,
      retryable:true,
    });
  }

  const settled=await Promise.allSettled(boundedCandidates.map(async candidate=>{
    const [candidateSnapshot,pairSnapshot]=await Promise.all([
      dependencies.buildUserFeatures(candidate.id,snapshotAt),
      dependencies.buildPairFeatures(viewerId,candidate.id,snapshotAt),
    ]);

    if(viewerSnapshot.snapshotAt!==snapshotAt||candidateSnapshot.snapshotAt!==snapshotAt||pairSnapshot.snapshotAt!==snapshotAt){
      throw new Error("SNAPSHOT_AT_MISMATCH");
    }

    await Promise.all([
      persistUserFeatureSnapshot(candidate.id,candidateSnapshot),
      persistPairFeatureSnapshot(viewerId,candidate.id,pairSnapshot),
    ]);

    // Production V2 is the required path. Shadow work below must not affect it.
    const score=scoreAuraMatchV2({
      viewerFeatures:viewerSnapshot.features,
      candidateFeatures:candidateSnapshot.features,
      pairFeatures:pairSnapshot.features,
      featureSchemaVersion:1,
      snapshotAt,
    });
    await persistAuraScore(viewerId,candidate.id,score);

    try{
      const readSignals=await buildConversationReadSignalsV1(viewerId,candidate.id,snapshotAt);
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

      if(candidateModel){
        try{
          const inferenceInput:AuraLearningInferenceInputV1={
            viewerUserId:viewerId,
            candidateUserId:candidate.id,
            snapshotAt,
            activeScore:score.totalScore,
            shadowScore:shadowScore.totalScore,
            featureSchemaVersion:2,
            pairFeatures:pairV2.features,
          };
          const candidateScore=Number(scoreAuraLearningCandidateV1(inferenceInput,candidateModel).toFixed(4));
          await persistAuraCandidateShadowV1({
            viewerUserId:viewerId,
            candidateUserId:candidate.id,
            snapshotAt,
            activeScore:score.totalScore,
            shadowScore:shadowScore.totalScore,
            candidateScore,
            featureSchemaVersion:2,
            candidate:candidateModel,
          });
        }catch(error){
          const code=errorCode(error);
          console.warn("AURA_CANDIDATE_SHADOW_SCORE_FAILED",{candidateId:candidate.id,code});
          await recordAuraBrainRuntimeEventV1({
            component:"CANDIDATE",
            stage:"SHADOW_INFERENCE",
            severity:"WARN",
            code,
            viewerUserId:viewerId,
            candidateUserId:candidate.id,
            snapshotAt,
            retryable:true,
          });
        }
      }
    }catch(error){
      const code=errorCode(error);
      console.warn("AURA_SHADOW_PIPELINE_FAILED",{candidateId:candidate.id,code});
      await recordAuraBrainRuntimeEventV1({
        component:"SHADOW_V3",
        stage:"READ_SIGNALS_AND_SCORE",
        severity:"WARN",
        code,
        viewerUserId:viewerId,
        candidateUserId:candidate.id,
        snapshotAt,
        retryable:true,
      });
    }

    return {candidateId:candidate.id,totalScore:score.totalScore};
  }));

  const scores:CandidateAuraScoreV1[]=[];
  for(let index=0;index<settled.length;index+=1){
    const result=settled[index];
    if(result.status==="fulfilled"){
      scores.push(result.value);
      continue;
    }
    const candidateId=boundedCandidates[index]?.id;
    const code=errorCode(result.reason);
    console.warn("AURA_CANDIDATE_PRODUCTION_SCORE_FAILED",{candidateId,code});
    await recordAuraBrainRuntimeEventV1({
      component:"PRODUCTION_V2",
      stage:"CANDIDATE_SCORE",
      severity:"ERROR",
      code,
      viewerUserId:viewerId,
      candidateUserId:candidateId??null,
      snapshotAt,
      retryable:false,
    });
  }

  return scores;
}
