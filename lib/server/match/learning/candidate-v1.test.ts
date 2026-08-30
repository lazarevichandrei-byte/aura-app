import {describe,expect,it} from "vitest";
import {trainAuraLearningCandidateV1} from "./candidate-v1";
import {evaluateAuraLearningCandidateOfflineV1} from "./offline-evaluation-v1";
import type {AuraTrainingExampleV1} from "./training-example-v1";
const ex=(i:number,quality:number,risk:number):AuraTrainingExampleV1=>({schemaVersion:1,viewerUserId:`v${i}`,candidateUserId:`c${i}`,anchorAt:new Date(Date.UTC(2026,0,1+i)).toISOString(),windowType:"24h",activeScore:50,shadowScore:quality?60:45,featureSchemaVersion:2,pairFeatures:{},label:{quality,risk,conversationDepth:quality?0.8:0.2}});
describe("Learning Candidate V1",()=>{
 it("is not eligible on a small dataset",()=>expect(trainAuraLearningCandidateV1(Array.from({length:20},(_,i)=>ex(i,i%2,0))).eligible).toBe(false));
 it("keeps learned weights bounded",()=>{const c=trainAuraLearningCandidateV1(Array.from({length:120},(_,i)=>ex(i,i%2,i%17===0?1:0)));expect(Object.values(c.weights).every(v=>Math.abs(v)<=0.25)).toBe(true);});
 it("requires offline gates before shadow eligibility",()=>{const r=evaluateAuraLearningCandidateOfflineV1(Array.from({length:140},(_,i)=>ex(i,i%2,i%19===0?1:0)));expect(["HOLD","SHADOW_ELIGIBLE"]).toContain(r.verdict);expect(r.gates.boundedWeights).toBe(true);});
});
