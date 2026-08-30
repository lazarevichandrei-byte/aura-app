import type {AuraTrainingExampleV1} from "./training-example-v1";
import {scoreAuraLearningCandidateV1,toAuraLearningInferenceInputV1,trainAuraLearningCandidateV1} from "./candidate-v1";

const mean=(v:number[])=>v.length?v.reduce((a,b)=>a+b,0)/v.length:0;
const rate=(v:AuraTrainingExampleV1[],pick:(x:AuraTrainingExampleV1)=>boolean)=>v.length?v.filter(pick).length/v.length:0;
const rankMetrics=(rows:Array<{example:AuraTrainingExampleV1;score:number}>)=>{
 const ordered=[...rows].sort((a,b)=>b.score-a.score);const q=Math.max(1,Math.floor(ordered.length*.25));const top=ordered.slice(0,q).map(x=>x.example),bottom=ordered.slice(-q).map(x=>x.example);
 const quality=(x:AuraTrainingExampleV1)=>x.label.quality===1&&x.label.risk===0,risk=(x:AuraTrainingExampleV1)=>x.label.risk===1;
 return {topCount:top.length,bottomCount:bottom.length,topQualityRate:rate(top,quality),bottomQualityRate:rate(bottom,quality),qualityUplift:rate(top,quality)-rate(bottom,quality),topRiskRate:rate(top,risk)};
};
export function evaluateAuraLearningCandidateOfflineV1(examples:AuraTrainingExampleV1[]){
 const ordered=[...examples].sort((a,b)=>a.anchorAt.localeCompare(b.anchorAt));const cut=Math.max(1,Math.floor(ordered.length*.8));const train=ordered.slice(0,cut),test=ordered.slice(cut);const candidate=trainAuraLearningCandidateV1(train);
 const candidateRank=rankMetrics(test.map(example=>({example,score:scoreAuraLearningCandidateV1(toAuraLearningInferenceInputV1(example),candidate)})));const shadowRank=rankMetrics(test.map(example=>({example,score:example.shadowScore})));
 const qualityDelta=candidateRank.qualityUplift-shadowRank.qualityUplift,riskDelta=candidateRank.topRiskRate-shadowRank.topRiskRate;
 const gates={enoughData:candidate.eligible&&test.length>=20,quartilesSampled:candidateRank.topCount>=5&&candidateRank.bottomCount>=5,qualityNonInferior:qualityDelta>=-.03,riskNotWorse:riskDelta<=.01,boundedWeights:Object.values(candidate.weights).every(v=>Math.abs(v)<=.25)};
 return {candidate,split:{train:train.length,test:test.length,quality:test.filter(x=>x.label.quality===1&&x.label.risk===0).length,risk:test.filter(x=>x.label.risk===1).length},metrics:{candidateQualityUplift:candidateRank.qualityUplift,shadowQualityUplift:shadowRank.qualityUplift,qualityDelta,candidateTopRiskRate:candidateRank.topRiskRate,shadowTopRiskRate:shadowRank.topRiskRate,riskDelta,candidateTopQualityRate:candidateRank.topQualityRate,candidateBottomQualityRate:candidateRank.bottomQualityRate,shadowTopQualityRate:shadowRank.topQualityRate,shadowBottomQualityRate:shadowRank.bottomQualityRate},gates,verdict:Object.values(gates).every(Boolean)?"SHADOW_ELIGIBLE":"HOLD" as const};
}
