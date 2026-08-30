import type {AuraTrainingExampleV1} from "./training-example-v1";
import {scoreAuraLearningCandidateV1,toAuraLearningInferenceInputV1,trainAuraLearningCandidateV1} from "./candidate-v1";

const mean=(v:number[])=>v.length?v.reduce((a,b)=>a+b,0)/v.length:0;
export function evaluateAuraLearningCandidateOfflineV1(examples:AuraTrainingExampleV1[]){
 const ordered=[...examples].sort((a,b)=>a.anchorAt.localeCompare(b.anchorAt));
 const cut=Math.max(1,Math.floor(ordered.length*0.8));
 const train=ordered.slice(0,cut),test=ordered.slice(cut);
 const candidate=trainAuraLearningCandidateV1(train);
 const quality=test.filter(x=>x.label.quality===1&&x.label.risk===0);
 const risk=test.filter(x=>x.label.risk===1);
 const score=(x:AuraTrainingExampleV1)=>scoreAuraLearningCandidateV1(toAuraLearningInferenceInputV1(x),candidate);
 const candidateQuality=mean(quality.map(score));
 const shadowQuality=mean(quality.map(x=>x.shadowScore));
 const candidateRisk=mean(risk.map(score));
 const shadowRisk=mean(risk.map(x=>x.shadowScore));
 const qualityDelta=candidateQuality-shadowQuality;
 const riskDelta=candidateRisk-shadowRisk;
 const gates={enoughData:candidate.eligible&&test.length>=20,qualityNonInferior:quality.length>=5&&qualityDelta>=-0.5,riskNotWorse:risk.length===0||riskDelta<=0.5,boundedWeights:Object.values(candidate.weights).every(v=>Math.abs(v)<=0.25)};
 return {candidate,split:{train:train.length,test:test.length,quality:quality.length,risk:risk.length},metrics:{candidateQuality,shadowQuality,qualityDelta,candidateRisk,shadowRisk,riskDelta},gates,verdict:Object.values(gates).every(Boolean)?"SHADOW_ELIGIBLE":"HOLD" as const};
}
