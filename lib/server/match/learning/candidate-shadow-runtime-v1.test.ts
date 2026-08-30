import {describe,expect,it} from "vitest";
import {createAuraCandidateShadowRuntimeV1,runAuraCandidateShadowV1} from "./candidate-shadow-runtime-v1";
import {toAuraLearningInferenceInputV1} from "./candidate-v1";
import type {AuraTrainingExampleV1} from "./training-example-v1";
const ex=(i:number,q:number,r=0):AuraTrainingExampleV1=>({schemaVersion:1,viewerUserId:`v${i}`,candidateUserId:`c${i}`,anchorAt:new Date(Date.UTC(2026,0,1+i)).toISOString(),windowType:"24h",activeScore:50,shadowScore:q?60:45,featureSchemaVersion:2,pairFeatures:{direct_message_count_30d:q?12:1},label:{quality:q,risk:r,conversationDepth:q?0.8:0.2}});
describe("candidate shadow runtime v1",()=>{
 it("refuses execution when offline gates fail",()=>{const runtime=createAuraCandidateShadowRuntimeV1(Array.from({length:20},(_,i)=>ex(i,i%2)));const result=runAuraCandidateShadowV1(runtime,toAuraLearningInferenceInputV1(ex(99,1)));expect(runtime.enabled).toBe(false);expect(result.executed).toBe(false);});
 it("scores from inference data without outcome labels",()=>{const data=Array.from({length:160},(_,i)=>ex(i,i%2,i%31===0?1:0));const runtime=createAuraCandidateShadowRuntimeV1(data);const input=toAuraLearningInferenceInputV1(ex(999,1));expect("label" in input).toBe(false);const before=JSON.stringify(input);runAuraCandidateShadowV1(runtime,input);expect(JSON.stringify(input)).toBe(before);});
});
