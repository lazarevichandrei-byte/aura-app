import {scoreAuraMatchV1} from "./score-v1";
import type {AuraScoreV1,ScoreAuraMatchV1Input} from "./types";

export type AuraScoreV2=Omit<AuraScoreV1,"scoreVersion">&{scoreVersion:2};

const clamp=(value:number,min:number,max:number)=>Math.max(min,Math.min(max,value));

/**
 * Score V2 keeps the proven V1 baseline and adds bounded conversation-quality
 * signals. It is intentionally conservative while AURA remains in SHADOW.
 * Raw message text never enters the score snapshot; only aggregate features do.
 */
export function scoreAuraMatchV2(input:ScoreAuraMatchV1Input):AuraScoreV2{
  const base=scoreAuraMatchV1(input);
  const p=input.pairFeatures;

  let conversationReciprocity=0;
  let conversationEngagement=0;

  if(p.mutual_conversation){
    conversationReciprocity+=3;
    if(p.message_balance_ratio>=0.65)conversationReciprocity+=3;
    else if(p.message_balance_ratio>=0.35)conversationReciprocity+=1;
  }

  if(p.direct_message_count_30d>=6)conversationEngagement+=2;
  if(p.direct_message_count_30d>=20)conversationEngagement+=2;
  if(p.active_chat_days_30d>=2)conversationEngagement+=2;
  if(p.active_chat_days_30d>=5)conversationEngagement+=1;
  if(p.viewer_question_messages_30d>0&&p.candidate_question_messages_30d>0)conversationEngagement+=1;
  if(p.viewer_meet_intent_messages_30d>0||p.candidate_meet_intent_messages_30d>0)conversationEngagement+=1;

  // Penalize strongly one-sided established conversations, but never infer
  // sentiment or relationship quality from message text.
  let conversationPenalty=0;
  if(p.direct_message_count_30d>=10&&p.message_balance_ratio<0.15)conversationPenalty=3;

  const reciprocity=clamp(base.components.reciprocity+conversationReciprocity,0,20);
  const engagement=clamp(base.components.engagement+conversationEngagement,0,15);
  const components={...base.components,reciprocity,engagement};
  const delta=(reciprocity-base.components.reciprocity)+(engagement-base.components.engagement)-conversationPenalty;
  let totalScore=clamp(base.totalScore+delta,0,100);
  if(p.cooldown_active)totalScore=Math.min(totalScore,55);

  return {...base,scoreVersion:2,totalScore,components};
}
