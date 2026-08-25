import {AURA_ADMIN_TIMEFRAMES,type AuraAdminOutcomeWindow,type AuraAdminOverviewV1,type AuraAdminTimeframe} from "./types";

export const parseAuraAdminTimeframe=(value:unknown):AuraAdminTimeframe=>AURA_ADMIN_TIMEFRAMES.includes(value as AuraAdminTimeframe)?value as AuraAdminTimeframe:"7d";
export const parseAuraAdminOutcomeWindow=(value:unknown):AuraAdminOutcomeWindow=>AURA_ADMIN_TIMEFRAMES.includes(value as AuraAdminOutcomeWindow)?value as AuraAdminOutcomeWindow:"24h";
const HEALTH=["healthy","stale","gap","empty"] as const;
const BUCKETS=["0-19","20-39","40-59","60-79","80-100"] as const;
const object=(value:unknown):value is Record<string,unknown>=>Boolean(value)&&typeof value==="object"&&!Array.isArray(value);
const exact=(value:Record<string,unknown>,keys:readonly string[])=>Object.keys(value).length===keys.length&&keys.every(key=>key in value);
const count=(value:unknown)=>typeof value==="number"&&Number.isInteger(value)&&value>=0;
const rate=(value:unknown)=>typeof value==="number"&&value>=0&&value<=1;
const nullableString=(value:unknown)=>value===null||typeof value==="string";

export function isAuraAdminOverviewV1(value:unknown):value is AuraAdminOverviewV1{
  if(!object(value)||!exact(value,["generatedAt","timeframe","outcomeWindow","ranking","events","features","scores","outcomes","coverage","scoreOutcome"])||typeof value.generatedAt!=="string"||!AURA_ADMIN_TIMEFRAMES.includes(value.timeframe as AuraAdminTimeframe)||!AURA_ADMIN_TIMEFRAMES.includes(value.outcomeWindow as AuraAdminOutcomeWindow))return false;
  if(!object(value.ranking)||!exact(value.ranking,["mode","diagnosticsPersisted"])||!["shadow","enabled"].includes(value.ranking.mode as string)||value.ranking.diagnosticsPersisted!==false)return false;
  if(!object(value.events)||!exact(value.events,["last1h","last24h","timeframeCount","latestReceivedAt","clientCount","serverCount","health"])||![value.events.last1h,value.events.last24h,value.events.timeframeCount,value.events.clientCount,value.events.serverCount].every(count)||!nullableString(value.events.latestReceivedAt)||!HEALTH.includes(value.events.health as never))return false;
  if(!object(value.features)||!exact(value.features,["userLast24h","pairLast24h","latestSnapshotAt","health"])||![value.features.userLast24h,value.features.pairLast24h].every(count)||!nullableString(value.features.latestSnapshotAt)||!HEALTH.includes(value.features.health as never))return false;
  if(!object(value.scores)||!exact(value.scores,["last24h","timeframeCount","latestSnapshotAt","health","distribution"])||![value.scores.last24h,value.scores.timeframeCount].every(count)||!nullableString(value.scores.latestSnapshotAt)||!HEALTH.includes(value.scores.health as never)||!Array.isArray(value.scores.distribution)||value.scores.distribution.length!==5)return false;
  if(!value.scores.distribution.every((item,index)=>object(item)&&exact(item,["bucket","count","percent"])&&item.bucket===BUCKETS[index]&&count(item.count)&&typeof item.percent==="number"&&item.percent>=0&&item.percent<=100))return false;
  if(!object(value.outcomes)||!exact(value.outcomes,["totalByWindow","latestEvaluatedAt","nullScoreLinks","selectedCount","health"])||!object(value.outcomes.totalByWindow))return false;
  const totalByWindow=value.outcomes.totalByWindow;
  if(!exact(totalByWindow,AURA_ADMIN_TIMEFRAMES)||!AURA_ADMIN_TIMEFRAMES.every(key=>count(totalByWindow[key]))||!nullableString(value.outcomes.latestEvaluatedAt)||!count(value.outcomes.nullScoreLinks)||!count(value.outcomes.selectedCount)||!HEALTH.includes(value.outcomes.health as never))return false;
  if(!Array.isArray(value.coverage)||value.coverage.length!==3||!value.coverage.every((item,index)=>object(item)&&exact(item,["windowType","eligibleAnchors","materialized","missing","coverageRate"])&&item.windowType===AURA_ADMIN_TIMEFRAMES[index]&&count(item.eligibleAnchors)&&count(item.materialized)&&count(item.missing)&&rate(item.coverageRate)))return false;
  return Array.isArray(value.scoreOutcome)&&value.scoreOutcome.length===5&&value.scoreOutcome.every((item,index)=>object(item)&&exact(item,["bucket","count","openRate","likeRate","passRate","matchRate","chatStartRate","meetActivityRate","blockRate","reportRate"])&&item.bucket===BUCKETS[index]&&count(item.count)&&[item.openRate,item.likeRate,item.passRate,item.matchRate,item.chatStartRate,item.meetActivityRate,item.blockRate,item.reportRate].every(rate));
}
