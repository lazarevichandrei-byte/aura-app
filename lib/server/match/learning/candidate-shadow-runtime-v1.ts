import type {AuraTrainingExampleV1} from "./training-example-v1";
import {evaluateAuraLearningCandidateOfflineV1} from "./offline-evaluation-v1";
import {scoreAuraLearningCandidateV1,type AuraLearningCandidateV1} from "./candidate-v1";

export type AuraCandidateShadowRuntimeV1={
 enabled:boolean;reason:"OFFLINE_GATES_PASSED"|"OFFLINE_GATES_FAILED";
 candidate:AuraLearningCandidateV1;
 score:(example:AuraTrainingExampleV1)=>number;
};

export type AuraCandidateShadowRunResultV1=
 | {executed:false;score:null;reason:"OFFLINE_GATES_PASSED"|"OFFLINE_GATES_FAILED"}
 | {executed:true;score:number;reason:"SHADOW_ONLY"};

export function createAuraCandidateShadowRuntimeV1(examples:AuraTrainingExampleV1[]):AuraCandidateShadowRuntimeV1{
 const evaluation=evaluateAuraLearningCandidateOfflineV1(examples);
 const enabled=evaluation.verdict==="SHADOW_ELIGIBLE";
 return {enabled,reason:enabled?"OFFLINE_GATES_PASSED":"OFFLINE_GATES_FAILED",candidate:evaluation.candidate,score:(example)=>scoreAuraLearningCandidateV1(example,evaluation.candidate)};
}

export function runAuraCandidateShadowV1(runtime:AuraCandidateShadowRuntimeV1,example:AuraTrainingExampleV1):AuraCandidateShadowRunResultV1{
 if(!runtime.enabled)return {executed:false,score:null,reason:runtime.reason};
 return {executed:true,score:Number(runtime.score(example).toFixed(4)),reason:"SHADOW_ONLY"};
}
