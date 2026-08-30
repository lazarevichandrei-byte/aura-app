import {describe,expect,it} from "vitest";
import {buildAuraLearningLabelV1,buildAuraTrainingExampleV1} from "./training-example-v1";

describe("AURA learning example v1",()=>{
 it("creates quality and conversation labels without raw messages",()=>{
  const label=buildAuraLearningLabelV1({matched:true,chat_started:true,messages_sent_by_viewer:6,messages_sent_by_candidate:5});
  expect(label.quality).toBe(1);expect(label.risk).toBe(0);expect(label.conversationDepth).toBeGreaterThan(0);
 });
 it("keeps safety risk separate from quality",()=>{
  const example=buildAuraTrainingExampleV1({viewerUserId:"a",candidateUserId:"b",anchorAt:"2026-08-30T00:00:00Z",windowType:"24h",activeScore:60,shadowScore:65,featureSchemaVersion:2,pairFeatures:{message_balance_ratio:0.9},outcome:{matched:true,reported:true}});
  expect(example.label.quality).toBe(1);expect(example.label.risk).toBe(1);expect(example.pairFeatures).toEqual({message_balance_ratio:0.9});
 });
});
