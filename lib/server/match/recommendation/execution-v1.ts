import type {AuraPairFeaturesV1,AuraUserFeaturesV1,FeatureSnapshot} from "../features/types";
import {scoreAuraMatchV1} from "../score/score-v1";
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
  return Promise.all(boundedCandidates.map(async candidate=>{
    const [candidateSnapshot,pairSnapshot]=await Promise.all([
      dependencies.buildUserFeatures(candidate.id,snapshotAt),
      dependencies.buildPairFeatures(viewerId,candidate.id,snapshotAt),
    ]);
    if(viewerSnapshot.snapshotAt!==snapshotAt||candidateSnapshot.snapshotAt!==snapshotAt||pairSnapshot.snapshotAt!==snapshotAt)throw new Error("SNAPSHOT_AT_MISMATCH");
    const score=scoreAuraMatchV1({viewerFeatures:viewerSnapshot.features,candidateFeatures:candidateSnapshot.features,pairFeatures:pairSnapshot.features,featureSchemaVersion:1,snapshotAt});
    return {candidateId:candidate.id,totalScore:score.totalScore};
  }));
}
