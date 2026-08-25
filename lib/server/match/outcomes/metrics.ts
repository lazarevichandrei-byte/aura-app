import type {AuraOutcomeMetricsV1,AuraOutcomeValuesV1,AuraScoreBucketV1} from "./types";

const rate=(values:readonly AuraOutcomeValuesV1[],predicate:(value:AuraOutcomeValuesV1)=>boolean)=>values.length===0?0:predicateCount(values,predicate)/values.length;
const predicateCount=(values:readonly AuraOutcomeValuesV1[],predicate:(value:AuraOutcomeValuesV1)=>boolean)=>values.reduce((count,value)=>count+Number(predicate(value)),0);

export function aggregateAuraOutcomeMetricsV1(values:readonly AuraOutcomeValuesV1[]):AuraOutcomeMetricsV1{return {
  impression_count:values.length,
  open_rate:rate(values,value=>value.profile_opened),like_rate:rate(values,value=>value.liked),pass_rate:rate(values,value=>value.passed),match_rate:rate(values,value=>value.matched),chat_start_rate:rate(values,value=>value.chat_started),meet_activity_rate:rate(values,value=>value.shared_meet_activity),block_rate:rate(values,value=>value.blocked),report_rate:rate(values,value=>value.reported),
};}

export function auraScoreBucketV1(score:number):AuraScoreBucketV1{if(score<20)return "0-19";if(score<40)return "20-39";if(score<60)return "40-59";if(score<80)return "60-79";return "80-100";}

export function aggregateAuraOutcomesByScoreBucketV1(rows:readonly {totalScore:number;outcomes:AuraOutcomeValuesV1}[]):Partial<Record<AuraScoreBucketV1,AuraOutcomeMetricsV1>>{
  const grouped=new Map<AuraScoreBucketV1,AuraOutcomeValuesV1[]>();
  for(const row of rows){const bucket=auraScoreBucketV1(Math.max(0,Math.min(100,row.totalScore)));grouped.set(bucket,[...(grouped.get(bucket)??[]),row.outcomes]);}
  return Object.fromEntries([...grouped].map(([bucket,outcomes])=>[bucket,aggregateAuraOutcomeMetricsV1(outcomes)]));
}
