import type {AuraTrainingExampleV1} from "./training-example-v1";

export type AuraLearningCandidateV1={
 version:1;sampleSize:number;eligible:boolean;
 weights:{shadowDelta:number;qualityBias:number;riskPenalty:number;conversationDepth:number};
 diagnostics:{positiveRate:number;riskRate:number;meanShadowDelta:number};
};

const mean=(values:number[])=>values.length?values.reduce((a,b)=>a+b,0)/values.length:0;
const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));

export function trainAuraLearningCandidateV1(examples:AuraTrainingExampleV1[]):AuraLearningCandidateV1{
 const sampleSize=examples.length;
 const positiveRate=mean(examples.map(x=>x.label.quality));
 const riskRate=mean(examples.map(x=>x.label.risk));
 const meanShadowDelta=mean(examples.map(x=>x.shadowScore-x.activeScore));
 const positive=examples.filter(x=>x.label.quality===1&&x.label.risk===0);
 const negative=examples.filter(x=>x.label.quality===0||x.label.risk===1);
 const posDelta=mean(positive.map(x=>x.shadowScore-x.activeScore));
 const negDelta=mean(negative.map(x=>x.shadowScore-x.activeScore));
 const signal=posDelta-negDelta;
 return {
  version:1,sampleSize,eligible:sampleSize>=100&&positive.length>=20&&negative.length>=20,
  weights:{
   shadowDelta:Number(clamp(signal/20,-0.25,0.25).toFixed(4)),
   qualityBias:Number(clamp(positiveRate-0.5,-0.15,0.15).toFixed(4)),
   riskPenalty:Number(clamp(riskRate*0.5,0,0.25).toFixed(4)),
   conversationDepth:Number(clamp(mean(positive.map(x=>x.label.conversationDepth))-mean(negative.map(x=>x.label.conversationDepth)),-0.2,0.2).toFixed(4)),
  },
  diagnostics:{positiveRate:Number(positiveRate.toFixed(4)),riskRate:Number(riskRate.toFixed(4)),meanShadowDelta:Number(meanShadowDelta.toFixed(4))},
 };
}

export function scoreAuraLearningCandidateV1(example:AuraTrainingExampleV1,candidate:AuraLearningCandidateV1){
 const delta=example.shadowScore-example.activeScore;
 const adjustment=delta*candidate.weights.shadowDelta+candidate.weights.qualityBias*5+example.label.conversationDepth*candidate.weights.conversationDepth*5-example.label.risk*candidate.weights.riskPenalty*10;
 return clamp(example.shadowScore+adjustment,0,100);
}
