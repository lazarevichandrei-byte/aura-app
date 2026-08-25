export type AuraRankingMode="shadow"|"enabled";
export type RankableCandidate={id:string};
export type CandidateAuraScoreV1={candidateId:string;totalScore:number};

export type AuraRankingDiagnosticsV1={
  candidateCount:number;
  scoredCount:number;
  failedCount:number;
  maxRankDelta:number;
  averageRankDelta:number;
  latencyBucket:"lt_250ms"|"250_500ms"|"500_1000ms"|"1000ms_plus";
};
