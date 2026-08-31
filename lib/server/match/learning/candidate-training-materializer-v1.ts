import "server-only";
import {loadAuraTrainingExamplesV1} from "./dataset-v1";
import {evaluateAuraLearningCandidateOfflineV1} from "./offline-evaluation-v1";
import {persistAuraLearningCandidateVersionV1} from "./candidate-model-registry-v1";
import {backfillOutcomeLinkedAuraV3V1} from "./v3-backfill-v1";

type WindowType="24h"|"7d"|"30d";
const WINDOWS:WindowType[]=["24h","7d","30d"];

export async function materializeAuraLearningCandidateV1(){
 const windows:Record<string,unknown>={};
 for(const windowType of WINDOWS){
  const backfill=await backfillOutcomeLinkedAuraV3V1(windowType,100);
  const examples=await loadAuraTrainingExamplesV1(windowType,2000);
  const evaluation=evaluateAuraLearningCandidateOfflineV1(examples);
  const model=await persistAuraLearningCandidateVersionV1(windowType,evaluation);
  windows[windowType]={backfill,trainingExamples:examples.length,evaluation,modelId:model.id,status:model.status};
 }
 return {windows,policy:{runtimeWindow:"24h",runtime:"SHADOW_ONLY",productionRanking:"V2",automaticPromotion:false,multiWindowEvidence:true}};
}
