import "server-only";
import {supabaseAdmin} from "../../../supabase-admin";

type CanaryArm="CONTROL"|"CANDIDATE"|"FALLBACK_V2";
type ExposureRow={viewer_user_id:string;snapshot_at:string;arm:CanaryArm;top_candidate_id:string|null;created_at:string};
type OutcomeRow={viewer_user_id:string;candidate_user_id:string;anchor_at:string;outcomes:Record<string,unknown>};

const HOUR=60*60*1000;
const STATE_CACHE_MS=30_000;
const EVAL_CACHE_MS=60_000;
let stateCache:{at:number;status:"ACTIVE"|"KILLED";reason:string|null}|null=null;
let evalCache:{at:number;result:AuraCanarySafetyEvaluationV1}|null=null;
const bool=(value:unknown)=>value===true;
const exposureKey=(viewer:string,candidate:string)=>`${viewer}:${candidate}`;

export type AuraCanarySafetyEvaluationV1={version:1;evaluatedAt:string;verdict:"SAFE"|"INSUFFICIENT_DATA"|"KILL";reason:string|null;operational:{lastHour:number;fallbacks:number;fallbackRate:number};outcomes:{candidateN:number;controlN:number;candidateQualityRate:number;controlQualityRate:number;candidateRiskRate:number;controlRiskRate:number}};

export async function loadAuraCandidateCanaryStateV1(){const now=Date.now();if(stateCache&&now-stateCache.at<STATE_CACHE_MS)return stateCache;const {data,error}=await supabaseAdmin.from("aura_candidate_canary_state").select("status,reason").eq("id",true).single();if(error)throw error;const status=data.status==="KILLED"?"KILLED" as const:"ACTIVE" as const;stateCache={at:now,status,reason:data.reason??null};return stateCache;}
export async function persistAuraCandidateCanaryExposureV1(input:{viewerUserId:string;snapshotAt:string;arm:CanaryArm;percent:number;candidateCount:number;scoredCount:number;topCandidateId?:string|null;activeTopCandidateId?:string|null;reason?:string|null;metadata?:Record<string,unknown>}){const {error}=await supabaseAdmin.from("aura_candidate_canary_exposures").upsert({viewer_user_id:input.viewerUserId,snapshot_at:input.snapshotAt,arm:input.arm,canary_percent:input.percent,candidate_count:input.candidateCount,scored_count:input.scoredCount,top_candidate_id:input.topCandidateId??null,active_top_candidate_id:input.activeTopCandidateId??null,reason:input.reason??null,metadata:input.metadata??{}},{onConflict:"viewer_user_id,snapshot_at"});if(error)throw error;}

async function killCanary(reason:string,metrics:AuraCanarySafetyEvaluationV1){
 const now=new Date().toISOString();
 const {data:current,error:stateError}=await supabaseAdmin.from("aura_candidate_canary_state").select("status").eq("id",true).single();if(stateError)throw stateError;
 if(current.status==="KILLED"){stateCache={at:Date.now(),status:"KILLED",reason};return;}
 const {error}=await supabaseAdmin.from("aura_candidate_canary_state").update({status:"KILLED",killed_at:now,reason,metrics,updated_at:now}).eq("id",true);if(error)throw error;
 const {error:incidentError}=await supabaseAdmin.from("aura_candidate_canary_incidents").insert({occurred_at:now,event_type:"KILLED",reason,metrics,metadata:{source:"CANARY_SAFETY_V1"}});if(incidentError)console.error("AURA_CANARY_INCIDENT_WRITE_ERROR",{code:incidentError.message});
 stateCache={at:Date.now(),status:"KILLED",reason};
}

export async function evaluateAuraCandidateCanarySafetyV1(now=new Date(),persistKill=true):Promise<AuraCanarySafetyEvaluationV1>{
 const nowMs=now.getTime();if(evalCache&&nowMs-evalCache.at<EVAL_CACHE_MS)return evalCache.result;const hourAgo=new Date(nowMs-HOUR).toISOString();const outcomeLookback=new Date(nowMs-10*24*HOUR).toISOString();
 const [{data:recent,error:recentError},{data:exposures,error:exposureError},{data:outcomes,error:outcomeError}]=await Promise.all([supabaseAdmin.from("aura_candidate_canary_exposures").select("arm").gte("created_at",hourAgo).limit(5000),supabaseAdmin.from("aura_candidate_canary_exposures").select("viewer_user_id,snapshot_at,arm,top_candidate_id,created_at").in("arm",["CANDIDATE","CONTROL"]).not("top_candidate_id","is",null).gte("created_at",outcomeLookback).limit(5000),supabaseAdmin.from("aura_match_outcomes").select("viewer_user_id,candidate_user_id,anchor_at,outcomes").eq("window_type","24h").eq("is_window_complete",true).gte("evaluated_at",outcomeLookback).limit(5000)]);if(recentError)throw recentError;if(exposureError)throw exposureError;if(outcomeError)throw outcomeError;
 const recentRows=(recent??[]) as {arm:CanaryArm}[];const fallbackCount=recentRows.filter(row=>row.arm==="FALLBACK_V2").length;const fallbackRate=recentRows.length?fallbackCount/recentRows.length:0;const exposureRows=(exposures??[]) as ExposureRow[];const outcomeRows=(outcomes??[]) as OutcomeRow[];const outcomesByPair=new Map<string,OutcomeRow[]>();for(const row of outcomeRows){const key=exposureKey(row.viewer_user_id,row.candidate_user_id);const list=outcomesByPair.get(key)??[];list.push(row);outcomesByPair.set(key,list);}
 const stats={CANDIDATE:{n:0,quality:0,risk:0},CONTROL:{n:0,quality:0,risk:0}};for(const exposure of exposureRows){if(!exposure.top_candidate_id)continue;const list=outcomesByPair.get(exposureKey(exposure.viewer_user_id,exposure.top_candidate_id))??[];const start=new Date(exposure.snapshot_at).getTime();const match=list.find(row=>{const anchor=new Date(row.anchor_at).getTime();return anchor>=start&&anchor<=start+6*HOUR;});if(!match)continue;const bucket=stats[exposure.arm as "CANDIDATE"|"CONTROL"];bucket.n+=1;const o=match.outcomes??{};if(bool(o.matched)||bool(o.chat_started)||bool(o.shared_meet_activity))bucket.quality+=1;if(bool(o.blocked)||bool(o.reported))bucket.risk+=1;}
 const rate=(value:number,n:number)=>n?value/n:0;const candidateQuality=rate(stats.CANDIDATE.quality,stats.CANDIDATE.n);const controlQuality=rate(stats.CONTROL.quality,stats.CONTROL.n);const candidateRisk=rate(stats.CANDIDATE.risk,stats.CANDIDATE.n);const controlRisk=rate(stats.CONTROL.risk,stats.CONTROL.n);let verdict:AuraCanarySafetyEvaluationV1["verdict"]="INSUFFICIENT_DATA";let reason:string|null=null;if(recentRows.length>=20&&fallbackCount>=5&&fallbackRate>=0.2){verdict="KILL";reason="CANARY_FALLBACK_RATE";}else if(stats.CANDIDATE.n>=20&&stats.CONTROL.n>=20){if(candidateRisk-controlRisk>=0.02){verdict="KILL";reason="CANARY_RISK_REGRESSION";}else if(controlQuality-candidateQuality>=0.05){verdict="KILL";reason="CANARY_QUALITY_REGRESSION";}else verdict="SAFE";}
 const result:AuraCanarySafetyEvaluationV1={version:1,evaluatedAt:now.toISOString(),verdict,reason,operational:{lastHour:recentRows.length,fallbacks:fallbackCount,fallbackRate:Number(fallbackRate.toFixed(4))},outcomes:{candidateN:stats.CANDIDATE.n,controlN:stats.CONTROL.n,candidateQualityRate:Number(candidateQuality.toFixed(4)),controlQualityRate:Number(controlQuality.toFixed(4)),candidateRiskRate:Number(candidateRisk.toFixed(4)),controlRiskRate:Number(controlRisk.toFixed(4))}};evalCache={at:nowMs,result};if(verdict==="KILL"&&persistKill&&reason)await killCanary(reason,result);return result;
}
