import type {AuraScoreComponentV1,AuraScoreReasonCodeV1,AuraScoreReasonV1} from "./types";

export function addReason(reasons:AuraScoreReasonV1[],code:AuraScoreReasonCodeV1,component:AuraScoreComponentV1,contribution:number){
  reasons.push({code,component,contribution});
}
