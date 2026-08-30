export type AuraLearningInferenceInputV1={
  viewerUserId:string;
  candidateUserId:string;
  snapshotAt:string;
  activeScore:number;
  shadowScore:number;
  featureSchemaVersion:2;
  pairFeatures:object;
};

const finite=(value:unknown,fallback=0)=>typeof value==="number"&&Number.isFinite(value)?value:fallback;
const clamp01=(value:number)=>Math.max(0,Math.min(1,value));

// Inference features must be observable at recommendation time. Never derive them from outcomes.
export function conversationDepthProxyV1(pairFeatures:object){
  const messages=Math.max(0,finite((pairFeatures as {direct_message_count_30d?:unknown}).direct_message_count_30d));
  return clamp01(Math.log1p(messages)/Math.log(21));
}
