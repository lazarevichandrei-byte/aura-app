export const AURA_TRAINING_EXAMPLE_SCHEMA_VERSION=1 as const;

export type AuraLearningOutcome={
  matched?:boolean;chat_started?:boolean;shared_meet_activity?:boolean;blocked?:boolean;reported?:boolean;
  messages_sent_by_viewer?:number;messages_sent_by_candidate?:number;
};

export type AuraTrainingExampleV1={
  schemaVersion:1;
  viewerUserId:string;
  candidateUserId:string;
  anchorAt:string;
  windowType:"24h"|"7d"|"30d";
  activeScore:number;
  shadowScore:number;
  featureSchemaVersion:number;
  pairFeatures:Record<string,unknown>;
  label:{quality:number;risk:number;conversationDepth:number};
};

const clamp01=(value:number)=>Math.max(0,Math.min(1,value));

export function buildAuraLearningLabelV1(outcome:AuraLearningOutcome){
  const quality=Number(Boolean(outcome.matched||outcome.chat_started||outcome.shared_meet_activity));
  const risk=Number(Boolean(outcome.blocked||outcome.reported));
  const messages=Math.max(0,Number(outcome.messages_sent_by_viewer??0))+Math.max(0,Number(outcome.messages_sent_by_candidate??0));
  const conversationDepth=clamp01(Math.log1p(messages)/Math.log(21));
  return {quality,risk,conversationDepth:Number(conversationDepth.toFixed(6))};
}

export function buildAuraTrainingExampleV1(input:Omit<AuraTrainingExampleV1,"schemaVersion"|"label">&{outcome:AuraLearningOutcome}):AuraTrainingExampleV1{
  return {schemaVersion:AURA_TRAINING_EXAMPLE_SCHEMA_VERSION,viewerUserId:input.viewerUserId,candidateUserId:input.candidateUserId,anchorAt:input.anchorAt,windowType:input.windowType,activeScore:input.activeScore,shadowScore:input.shadowScore,featureSchemaVersion:input.featureSchemaVersion,pairFeatures:input.pairFeatures,label:buildAuraLearningLabelV1(input.outcome)};
}
