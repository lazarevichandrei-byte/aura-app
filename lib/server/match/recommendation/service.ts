import "server-only";

import {buildPairFeatures,buildUserFeatures} from "../features";
import {recordAuraBrainRuntimeEventV1} from "../health/runtime-events-v1";
import {buildAuraScoresForCandidatesV1,type AuraRankingDependencies} from "./execution-v1";
import {AURA_RANKING_V1,rankingDiagnosticsV1,rerankCandidatesV1} from "./rank-v1";
import type {AuraRankingMode,RankableCandidate} from "./types";

const AURA_RANKING_TIMEOUT_MS=1500;

export function auraRankingMode(value=process.env.AURA_RANKING_MODE):AuraRankingMode{return value==="enabled"?"enabled":"shadow";}

const timeout=async<T>(promise:Promise<T>,milliseconds:number)=>new Promise<T>((resolve,reject)=>{
  const timer=setTimeout(()=>reject(new Error("AURA_RANKING_TIMEOUT")),milliseconds);
  promise.then(value=>{clearTimeout(timer);resolve(value);},error=>{clearTimeout(timer);reject(error);});
});

export async function rankCandidatesWithAuraV1<T extends RankableCandidate>({viewerId,candidates,snapshotAt,mode=auraRankingMode(),dependencies}:{viewerId:string;candidates:readonly T[];snapshotAt:string;mode?:AuraRankingMode;dependencies?:AuraRankingDependencies}):Promise<T[]>{
  if(candidates.length===0)return [];
  const startedAt=performance.now();
  try{
    const scores=await timeout(buildAuraScoresForCandidatesV1(viewerId,candidates,snapshotAt,dependencies??{buildUserFeatures,buildPairFeatures}),AURA_RANKING_TIMEOUT_MS);
    const ranked=rerankCandidatesV1(candidates,scores);
    if(mode==="shadow")console.info("AURA_RANKING_SHADOW",rankingDiagnosticsV1(candidates,ranked,scores.length,0,performance.now()-startedAt));
    return mode==="enabled"?ranked:[...candidates];
  }catch(error){
    const isTimeout=error instanceof Error&&error.message==="AURA_RANKING_TIMEOUT";
    const errorCode=isTimeout?"AURA_RANKING_TIMEOUT":"AURA_RANKING_SCORING_FAILED";
    console.warn("AURA_RANKING_FALLBACK",{candidateCount:candidates.length,latencyBucket:rankingDiagnosticsV1(candidates,candidates,0,Math.min(candidates.length,AURA_RANKING_V1.MAX_CANDIDATES),performance.now()-startedAt).latencyBucket,errorCode:isTimeout?"timeout":"scoring_failed"});
    await recordAuraBrainRuntimeEventV1({
      component:"PRODUCTION_V2",
      stage:"RANK_BATCH",
      severity:"ERROR",
      code:errorCode,
      viewerUserId:viewerId,
      snapshotAt,
      retryable:false,
      metadata:{candidateCount:candidates.length,mode},
    });
    return [...candidates];
  }
}
