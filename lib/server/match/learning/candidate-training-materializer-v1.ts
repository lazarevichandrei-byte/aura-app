import "server-only";
import {loadAuraTrainingExamplesV1} from "./dataset-v1";
import {evaluateAuraLearningCandidateOfflineV1} from "./offline-evaluation-v1";
import {persistAuraLearningCandidateVersionV1} from "./candidate-model-registry-v1";
import {backfillOutcomeLinkedAuraV3V1} from "./v3-backfill-v1";

export async function materializeAuraLearningCandidateV1(){
 const backfill=await backfillOutcomeLinkedAuraV3V1(100);
 const examples=await loadAuraTrainingExamplesV1("24h",2000);
 const evaluation=evaluateAuraLearningCandidateOfflineV1(examples);
 const model=await persistAuraLearningCandidateVersionV1("24h",evaluation);
 return {backfill,trainingExamples:examples.length,evaluation,modelId:model.id,status:model.status,policy:{runtime:"SHADOW_ONLY",productionRanking:"V2",automaticPromotion:false}};
}
