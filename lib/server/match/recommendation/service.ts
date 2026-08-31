import "server-only";

import {buildPairFeatures,buildUserFeatures} from "../features";
import {recordAuraBrainRuntimeEventV1} from "../health/runtime-events-v1";
import {candidateCanaryDecisionV1} from "../learning/canary-v1";
import {persistAuraCandidateCanaryExposureV1} from "../learning/canary-safety-v1";
import {buildAuraScoresForCandidatesV1,type AuraRankingDependencies} from "./execution-v1";
import {AURA_RANKING_V1,rankingDiagnosticsV1,rerankCandidatesV1} from "./rank-v1";
import type {AuraRankingMode,RankableCandidate} from "./types";

const AURA_RANKING_TIMEOUT_MS=1500;

export function auraRankingMode(value=process.env.AURA_RANKING_MODE):AuraRankingMode{return value==="enabled"?"enabled":"shadow";}

const timeout=async<T>(promise:Promise<T>,milliseconds:number)=>new Promise<T>((resolve,reject)=>{
  const timer=setTimeout(()=>reject(new Error("AURA_RANKING_TIMEOUT")),milliseconds);
  promise.then(value=>{clearTimeout(timer);resolve(value);},error=>{clearTimeout(timer);reject(error);});
});

async function recordExposure(input:Parameters<typeof persistAuraCandidateCanaryExposureV1>[0]){
 try{await persistAuraCandidateCanaryExposureV1(input);}catch(error){console.warn("AURA_CANDIDATE_CANARY_TELEMETRY_FAILED",{code:error instanceof Error?error.message:"UNKNOWN"});}
}

export async function rankCandidatesWithAuraV1<T extends RankableCandidate>({viewerId,candidates,snapshotAt,mode=auraRankingMode(),dependencies}:{viewerId:string;candidates:readonly T[];snapshotAt:string;mode?:AuraRankingMode;dependencies?:AuraRankingDependencies}):Promise<T[]>{
  if(candidates.length===0)return [];
  const startedAt=performance.now();
  try{
    const scores=await timeout(buildAuraScoresForCandidatesV1(viewerId,candidates,snapshotAt,dependencies??{buildUserFeatures,buildPairFeatures}),AURA_RANKING_TIMEOUT_MS);
    const v2Ranked=rerankCandidatesV1(candidates,scores);
    if(mode==="shadow"){
      console.info("AURA_RANKING_SHADOW",rankingDiagnosticsV1(candidates,v2Ranked,scores.length,0,performance.now()-startedAt));
      return [...candidates];
    }

    let canary:{enabled:boolean;selected:boolean;percent:number;reason:string}={enabled:false,selected:false,percent:0,reason:"DISABLED"};
    try{canary=await candidateCanaryDecisionV1(viewerId);}catch(error){
      console.warn("AURA_CANDIDATE_CANARY_GATE_FAILED",{code:error instanceof Error?error.message:"UNKNOWN"});
    }

    const activeTopCandidateId=v2Ranked[0]?.id??null;
    if(canary.selected){
      const complete=scores.length>0&&scores.every(score=>typeof score.candidateScore==="number");
      if(complete){
        const candidateScores=scores.map(score=>({candidateId:score.candidateId,totalScore:score.candidateScore as number}));
        const ranked=rerankCandidatesV1(candidates,candidateScores);
        await recordExposure({viewerUserId:viewerId,snapshotAt,arm:"CANDIDATE",percent:canary.percent,candidateCount:candidates.length,scoredCount:candidateScores.length,topCandidateId:ranked[0]?.id??null,activeTopCandidateId,reason:canary.reason});
        console.info("AURA_CANDIDATE_CANARY_ACTIVE",{viewerId,percent:canary.percent,scoredCount:candidateScores.length});
        return ranked;
      }
      await recordExposure({viewerUserId:viewerId,snapshotAt,arm:"FALLBACK_V2",percent:canary.percent,candidateCount:candidates.length,scoredCount:scores.length,topCandidateId:activeTopCandidateId,activeTopCandidateId,reason:"INCOMPLETE_CANDIDATE_SCORE_COVERAGE"});
      console.warn("AURA_CANDIDATE_CANARY_FALLBACK_V2",{viewerId,reason:"INCOMPLETE_CANDIDATE_SCORE_COVERAGE",scoredCount:scores.length});
      return v2Ranked;
    }

    if(canary.enabled){
      await recordExposure({viewerUserId:viewerId,snapshotAt,arm:"CONTROL",percent:canary.percent,candidateCount:candidates.length,scoredCount:scores.length,topCandidateId:activeTopCandidateId,activeTopCandidateId,reason:canary.reason});
    }
    return v2Ranked;
  }catch(error){
    const isTimeout=error instanceof Error&&error.message==="AURA_RANKING_TIMEOUT";
    const errorCode=isTimeout?"AURA_RANKING_TIMEOUT":"AURA_RANKING_SCORING_FAILED";
    console.warn("AURA_RANKING_FALLBACK",{candidateCount:candidates.length,latencyBucket:rankingDiagnosticsV1(candidates,candidates,0,Math.min(candidates.length,AURA_RANKING_V1.MAX_CANDIDATES),performance.now()-startedAt).latencyBucket,errorCode:isTimeout?"timeout":"scoring_failed"});
    await recordAuraBrainRuntimeEventV1({component:"PRODUCTION_V2",stage:"RANK_BATCH",severity:"ERROR",code:errorCode,viewerUserId:viewerId,snapshotAt,retryable:false,metadata:{candidateCount:candidates.length,mode}});
    return [...candidates];
  }
}
