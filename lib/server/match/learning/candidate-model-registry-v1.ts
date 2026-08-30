import "server-only";
import {supabaseAdmin} from "../../../supabase-admin";
import type {AuraLearningCandidateV1} from "./candidate-v1";

type Evaluation={candidate:AuraLearningCandidateV1;verdict:string;gates:Record<string,boolean>;split:Record<string,number>;metrics:Record<string,number>};
export async function persistAuraLearningCandidateVersionV1(windowType:"24h"|"7d"|"30d",evaluation:Evaluation,trainedAt=new Date().toISOString()){
 const status=evaluation.verdict==="SHADOW_ELIGIBLE"?"SHADOW_ELIGIBLE":"HOLD";
 const {data,error}=await supabaseAdmin.from("aura_learning_candidate_versions").insert({candidate_version:evaluation.candidate.version,training_schema_version:1,feature_schema_version:2,window_type:windowType,status,sample_size:evaluation.candidate.sampleSize,weights:evaluation.candidate.weights,diagnostics:evaluation.candidate.diagnostics,evaluation:{verdict:evaluation.verdict,gates:evaluation.gates,split:evaluation.split,metrics:evaluation.metrics},trained_at:trainedAt}).select("*").single();if(error)throw error;return data;
}
export async function loadLatestEligibleAuraLearningCandidateV1(){
 const {data,error}=await supabaseAdmin.from("aura_learning_candidate_versions").select("candidate_version,sample_size,weights,diagnostics,trained_at,window_type,status").eq("candidate_version",1).eq("feature_schema_version",2).eq("status","SHADOW_ELIGIBLE").order("trained_at",{ascending:false}).limit(1).maybeSingle();if(error)throw error;if(!data)return null;
 return {version:1 as const,sampleSize:data.sample_size,eligible:true,weights:data.weights as AuraLearningCandidateV1["weights"],diagnostics:data.diagnostics as AuraLearningCandidateV1["diagnostics"],trainedAt:data.trained_at,windowType:data.window_type};
}
