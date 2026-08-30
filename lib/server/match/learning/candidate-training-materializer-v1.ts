import "server-only";
import {loadAuraTrainingExamplesV1} from "./dataset-v1";
import {evaluateAuraLearningCandidateOfflineV1} from "./offline-evaluation-v1";
import {persistAuraLearningCandidateVersionV1} from "./candidate-model-registry-v1";

export async function materializeAuraLearningCandidateV1(){
 const examples=await loadAuraTrainingExamplesV1("24h",2000);
 const evaluation=evaluateAuraLearningCandidateOfflineV1(examples);
 const model=await persistAuraLearningCandidateVersionV1("24h",evaluation);
 return {trainingExamples:examples.length,evaluation,modelId:model.id,status:model.status,policy:{runtime:"SHADOW_ONLY",productionRanking:"V2",automaticPromotion:false}};
}
