import {addReason} from "./reasons";
import type {AuraScoreReasonV1,AuraScoreV1,ScoreAuraMatchV1Input} from "./types";
import {ACTIVITY_FRESHNESS_POINTS_V1,AURA_SCORE_V1_WEIGHTS as W,DWELL_POINTS_V1,IMPRESSION_FRESHNESS_POINTS_V1} from "./weights-v1";

const clamp=(value:number,min:number,max:number)=>Math.max(min,Math.min(max,value));
const countPoints=(count:number,step:number,max:number)=>Math.min(max,count*step);

function userEngagement(user:ScoreAuraMatchV1Input["viewerFeatures"]){
  const active30=user.active_days_30d===0?0:user.active_days_30d<=2?1:user.active_days_30d<=7?2:3;
  const active7=user.active_days_7d>=2?1:0;
  const chat=user.chats_started_30d>0||user.messages_sent_30d>0?1:0;
  const meet=user.meet_created_30d+user.meet_join_requests_30d+user.meet_join_accepted_30d+user.meet_participations_30d>0?1:0;
  return Math.min(W.engagement.PER_USER_MAX,active30+active7+chat+meet);
}

export function scoreAuraMatchV1(input:ScoreAuraMatchV1Input):AuraScoreV1{
  if(input.featureSchemaVersion!==1)throw new Error("UNSUPPORTED_FEATURE_SCHEMA_VERSION");
  if(typeof input.snapshotAt!=="string"||input.snapshotAt.length===0)throw new Error("INVALID_SNAPSHOT_AT");
  const p=input.pairFeatures;
  const reasons:AuraScoreReasonV1[]=[];

  let compatibility=0;
  if(p.same_city===true){compatibility+=W.compatibility.SAME_CITY;addReason(reasons,"SAME_CITY","compatibility",W.compatibility.SAME_CITY);}
  const age=p.age_difference;
  const agePoints=age===null?0:age<=2?W.compatibility.AGE_0_2:age<=5?W.compatibility.AGE_3_5:age<=10?W.compatibility.AGE_6_10:0;
  if(agePoints){compatibility+=agePoints;addReason(reasons,age!==null&&age<=2?"AGE_CLOSE":"AGE_COMPATIBLE","compatibility",agePoints);}
  compatibility=clamp(compatibility,0,W.compatibility.MAX);

  let interest=0;
  if(p.prior_like_from_viewer){interest+=W.interest.VIEWER_LIKE;addReason(reasons,"VIEWER_LIKED","interest",W.interest.VIEWER_LIKE);}
  const impressionPoints=Math.min(W.interest.IMPRESSIONS_MAX,p.impressions_30d>0?1+(p.impressions_7d>1?1:0):0);
  if(impressionPoints){interest+=impressionPoints;addReason(reasons,"PROFILE_IMPRESSIONS","interest",impressionPoints);}
  const openPoints=Math.min(W.interest.OPENS_MAX,p.opens_30d*2)+(p.opens_7d>0?W.interest.RECENT_OPENS_BONUS:0);
  if(openPoints){interest+=openPoints;addReason(reasons,p.opens_30d>=2?"REPEATED_PROFILE_OPEN":"PROFILE_OPENS","interest",openPoints);}
  const returnPoints=Math.min(W.interest.RETURNS_MAX,p.return_to_profile_30d*2);
  if(returnPoints){interest+=returnPoints;addReason(reasons,"RETURNED_TO_PROFILE","interest",returnPoints);}
  const dwellPoints=DWELL_POINTS_V1[p.max_dwell_bucket_30d];
  if(dwellPoints){interest+=dwellPoints;addReason(reasons,"LONG_DWELL","interest",dwellPoints);}
  interest=clamp(interest,0,W.interest.MAX);

  let reciprocity=0;
  if(p.prior_like_from_candidate){reciprocity+=W.reciprocity.CANDIDATE_LIKE;addReason(reasons,"CANDIDATE_LIKED","reciprocity",W.reciprocity.CANDIDATE_LIKE);}
  if(p.prior_like_from_viewer&&p.prior_like_from_candidate){reciprocity+=W.reciprocity.MUTUAL_LIKE_BONUS;addReason(reasons,"MUTUAL_LIKE","reciprocity",W.reciprocity.MUTUAL_LIKE_BONUS);}
  const sharedMeetPoints=Math.min(W.reciprocity.SHARED_MEETS_MAX,p.shared_meet_count_90d*2);
  const directionalMeetPoints=Math.min(W.reciprocity.DIRECTIONAL_MEET_MAX,Number(p.viewer_joined_candidate_meet_90d)+Number(p.candidate_joined_viewer_meet_90d));
  if(sharedMeetPoints+directionalMeetPoints){reciprocity+=sharedMeetPoints+directionalMeetPoints;addReason(reasons,"SHARED_MEET_ACTIVITY","reciprocity",sharedMeetPoints+directionalMeetPoints);}
  reciprocity=clamp(reciprocity,0,W.reciprocity.MAX);

  const viewerEngagement=userEngagement(input.viewerFeatures);
  const candidateEngagement=userEngagement(input.candidateFeatures);
  const bothActive=viewerEngagement>=3&&candidateEngagement>=3?W.engagement.BOTH_ACTIVE_BONUS:0;
  const engagement=clamp(viewerEngagement+candidateEngagement+bothActive,0,W.engagement.MAX);
  if(bothActive)addReason(reasons,"BOTH_ACTIVE","engagement",bothActive);

  const impressionFreshness=IMPRESSION_FRESHNESS_POINTS_V1[p.recent_impression_age_bucket];
  const viewerFreshness=ACTIVITY_FRESHNESS_POINTS_V1[input.viewerFeatures.last_activity_age_bucket];
  const candidateFreshness=ACTIVITY_FRESHNESS_POINTS_V1[input.candidateFeatures.last_activity_age_bucket];
  const freshness=clamp(impressionFreshness+viewerFreshness+candidateFreshness,0,W.freshness.MAX);
  if(impressionFreshness)addReason(reasons,"RECENT_INTERACTION","freshness",impressionFreshness);
  if(freshness===0)addReason(reasons,"LOW_RECENT_ACTIVITY","freshness",0);

  const blockPenalty=countPoints(input.viewerFeatures.blocks_created_90d,1,W.safety.PER_USER_BLOCK_MAX)+countPoints(input.candidateFeatures.blocks_created_90d,1,W.safety.PER_USER_BLOCK_MAX);
  const reportPenalty=countPoints(input.viewerFeatures.reports_created_90d,1,W.safety.PER_USER_REPORT_CREATED_MAX)+countPoints(input.candidateFeatures.reports_created_90d,1,W.safety.PER_USER_REPORT_CREATED_MAX);
  const safety=blockPenalty+reportPenalty===0?0:clamp(-(blockPenalty+reportPenalty),W.safety.MIN,0);
  if(blockPenalty)addReason(reasons,"CREATED_BLOCK_ACTIVITY","safety",-blockPenalty);
  if(reportPenalty)addReason(reasons,"CREATED_REPORT_ACTIVITY","safety",-reportPenalty);

  if(p.cooldown_active)addReason(reasons,"COOLDOWN_ACTIVE","reciprocity",0);
  if(p.prior_match)addReason(reasons,"PRIOR_MATCH","reciprocity",0);
  if(p.has_existing_direct_chat)addReason(reasons,"EXISTING_CHAT","engagement",0);
  if(p.prior_reject)addReason(reasons,"PREVIOUS_REJECT","reciprocity",0);
  const components={compatibility,interest,reciprocity,engagement,freshness,safety};
  let totalScore=clamp(W.BASE_SCORE+Object.values(components).reduce((sum,value)=>sum+value,0),W.TOTAL_MIN,W.TOTAL_MAX);
  if(p.cooldown_active)totalScore=Math.min(totalScore,W.COOLDOWN_CAP);
  return {scoreVersion:1,featureSchemaVersion:1,snapshotAt:input.snapshotAt,totalScore,components,reasons,flags:{cooldownActive:p.cooldown_active,priorMatch:p.prior_match,existingChat:p.has_existing_direct_chat,currentCycleStatus:p.current_cycle_status}};
}
