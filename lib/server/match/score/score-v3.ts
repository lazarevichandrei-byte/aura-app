import {scoreAuraMatchV2} from "./score-v2";
import type {AuraScoreV1} from "./types";
import type {AuraPairFeaturesV2,AuraUserFeaturesV2} from "../features/types-v2";

export type AuraScoreV3=Omit<AuraScoreV1,"scoreVersion"|"featureSchemaVersion">&{
  scoreVersion:3;
  featureSchemaVersion:2;
  shadow:true;
};

const clamp=(value:number,min:number,max:number)=>Math.max(min,Math.min(max,value));

/**
 * Shadow Score V3. V2 remains the production ranking score.
 * V3 adds bounded read-receipt signals and is persisted only for comparison
 * against future outcomes. A read without a reply is never treated as a
 * standalone negative relationship signal.
 */
export function scoreAuraMatchV3({viewerFeatures,candidateFeatures,pairFeatures,snapshotAt}:{
  viewerFeatures:AuraUserFeaturesV2;
  candidateFeatures:AuraUserFeaturesV2;
  pairFeatures:AuraPairFeaturesV2;
  snapshotAt:string;
}):AuraScoreV3{
  const v2=scoreAuraMatchV2({
    viewerFeatures,
    candidateFeatures,
    pairFeatures,
    featureSchemaVersion:1,
    snapshotAt,
  });

  const p=pairFeatures;
  let readEngagement=0;
  let readPenalty=0;
  const established=p.direct_message_count_30d>=6;

  if(established){
    if(p.viewer_message_read_rate_30d>=0.8&&p.candidate_message_read_rate_30d>=0.8)readEngagement+=2;
    else if(p.viewer_message_read_rate_30d>=0.5&&p.candidate_message_read_rate_30d>=0.5)readEngagement+=1;

    // Only a small, symmetric stale-unread penalty after enough traffic exists.
    // This avoids interpreting one delayed read as rejection.
    if(p.viewer_sent_30d>=5&&p.candidate_sent_30d>=5&&p.viewer_unread_older_than_24h_30d>=3&&p.candidate_unread_older_than_24h_30d>=3)readPenalty=1;
  }

  const engagement=clamp(v2.components.engagement+readEngagement,0,15);
  const components={...v2.components,engagement};
  const delta=(engagement-v2.components.engagement)-readPenalty;
  let totalScore=clamp(v2.totalScore+delta,0,100);
  if(p.cooldown_active)totalScore=Math.min(totalScore,55);

  return {
    ...v2,
    scoreVersion:3,
    featureSchemaVersion:2,
    shadow:true,
    totalScore,
    components,
  };
}
