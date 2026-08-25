import type {AuraRankingDiagnosticsV1,CandidateAuraScoreV1,RankableCandidate} from "./types";

export const AURA_RANKING_V1={
  MAX_CANDIDATES:20,
  RERANK_WINDOW_SIZE:5,
  EXISTING_ORDER_WEIGHT:0.65,
  AURA_SCORE_WEIGHT:0.35,
} as const;

export function rerankCandidatesV1<T extends RankableCandidate>(baseCandidates:readonly T[],scores:readonly CandidateAuraScoreV1[]):T[]{
  if(baseCandidates.length<=1)return [...baseCandidates];
  const boundedCount=Math.min(baseCandidates.length,AURA_RANKING_V1.MAX_CANDIDATES);
  const scoreByCandidate=new Map(scores.map(score=>[score.candidateId,score.totalScore]));
  if(baseCandidates.slice(0,boundedCount).some(candidate=>!scoreByCandidate.has(candidate.id)))return [...baseCandidates];
  const ranked:T[]=[];
  for(let start=0;start<boundedCount;start+=AURA_RANKING_V1.RERANK_WINDOW_SIZE){
    const window=baseCandidates.slice(start,Math.min(start+AURA_RANKING_V1.RERANK_WINDOW_SIZE,boundedCount));
    const denominator=Math.max(1,window.length-1);
    ranked.push(...window.map((candidate,index)=>({candidate,index,signal:AURA_RANKING_V1.EXISTING_ORDER_WEIGHT*((window.length-1-index)/denominator)*100+AURA_RANKING_V1.AURA_SCORE_WEIGHT*(scoreByCandidate.get(candidate.id)??0)}))
      .sort((left,right)=>right.signal-left.signal||left.index-right.index)
      .map(item=>item.candidate));
  }
  return [...ranked,...baseCandidates.slice(boundedCount)];
}

export function rankingDiagnosticsV1<T extends RankableCandidate>(base:readonly T[],ranked:readonly T[],scoredCount:number,failedCount:number,latencyMs:number):AuraRankingDiagnosticsV1{
  const position=new Map(ranked.map((candidate,index)=>[candidate.id,index]));
  const deltas=base.map((candidate,index)=>Math.abs((position.get(candidate.id)??index)-index));
  const latencyBucket=latencyMs<250?"lt_250ms":latencyMs<500?"250_500ms":latencyMs<1000?"500_1000ms":"1000ms_plus";
  return {candidateCount:base.length,scoredCount,failedCount,maxRankDelta:deltas.length?Math.max(...deltas):0,averageRankDelta:deltas.length?Number((deltas.reduce((sum,value)=>sum+value,0)/deltas.length).toFixed(2)):0,latencyBucket};
}
