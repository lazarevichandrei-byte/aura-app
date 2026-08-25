export const AURA_ADMIN_TIMEFRAMES=["24h","7d","30d"] as const;
export type AuraAdminTimeframe=typeof AURA_ADMIN_TIMEFRAMES[number];
export type AuraAdminOutcomeWindow="24h"|"7d"|"30d";
export type AuraAdminHealth="healthy"|"stale"|"gap"|"empty";
export type AuraAdminRateRow={bucket:string;count:number;percent?:number;openRate:number;likeRate:number;passRate:number;matchRate:number;chatStartRate:number;meetActivityRate:number;blockRate:number;reportRate:number};
export type AuraAdminOverviewV1={
  generatedAt:string;timeframe:AuraAdminTimeframe;outcomeWindow:AuraAdminOutcomeWindow;
  ranking:{mode:"shadow"|"enabled";diagnosticsPersisted:false};
  events:{last1h:number;last24h:number;timeframeCount:number;latestReceivedAt:string|null;clientCount:number;serverCount:number;health:AuraAdminHealth};
  features:{userLast24h:number;pairLast24h:number;latestSnapshotAt:string|null;health:AuraAdminHealth};
  scores:{last24h:number;timeframeCount:number;latestSnapshotAt:string|null;health:AuraAdminHealth;distribution:{bucket:string;count:number;percent:number}[]};
  outcomes:{totalByWindow:Record<AuraAdminOutcomeWindow,number>;latestEvaluatedAt:string|null;nullScoreLinks:number;selectedCount:number;health:AuraAdminHealth};
  coverage:{windowType:AuraAdminOutcomeWindow;eligibleAnchors:number;materialized:number;missing:number;coverageRate:number}[];
  scoreOutcome:AuraAdminRateRow[];
};
