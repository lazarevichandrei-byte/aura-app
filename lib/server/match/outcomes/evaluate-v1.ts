import type {AuraOutcomeValuesV1,AuraOutcomeWindowV1} from "./types";

export type OutcomeEventV1={id:string;eventName:string;sourceType:"client"|"server";actorUserId:string;targetUserId:string|null;entityType:string|null;occurredAt:string;isDirectPairMessage?:boolean};
export type OutcomeScoreSnapshotV1={id:string;viewerUserId:string;candidateUserId:string;featureSchemaVersion:number;scoreVersion:number;snapshotAt:string};
export type EvaluatedOutcomeV1={windowEndsAt:string;outcomes:AuraOutcomeValuesV1;scoreSnapshotId:string|null};

const WINDOW_MS:Record<AuraOutcomeWindowV1,number>={"24h":24*60*60*1000,"7d":7*24*60*60*1000,"30d":30*24*60*60*1000};

export function evaluateAuraOutcomeV1({anchor,windowType,evaluatedAt,events,scoreSnapshots}:{anchor:OutcomeEventV1;windowType:AuraOutcomeWindowV1;evaluatedAt:string;events:readonly OutcomeEventV1[];scoreSnapshots:readonly OutcomeScoreSnapshotV1[]}):EvaluatedOutcomeV1{
  if(anchor.eventName!=="profile_impression"||anchor.sourceType!=="client"||anchor.entityType!=="user"||anchor.targetUserId===null)throw new Error("INVALID_OUTCOME_ANCHOR");
  const anchorTime=new Date(anchor.occurredAt).getTime();const windowEnd=anchorTime+WINDOW_MS[windowType];
  if(!Number.isFinite(anchorTime)||new Date(evaluatedAt).getTime()<windowEnd)throw new Error("WINDOW_NOT_COMPLETE");
  const viewer=anchor.actorUserId;const candidate=anchor.targetUserId;
  const inWindow=events.filter(event=>{const time=new Date(event.occurredAt).getTime();return time>anchorTime&&time<=windowEnd;});
  const directional=inWindow.filter(event=>(event.actorUserId===viewer&&event.targetUserId===candidate)||(event.actorUserId===candidate&&event.targetUserId===viewer));
  const has=(name:string,actor?:string)=>directional.some(event=>event.eventName===name&&(!actor||event.actorUserId===actor));
  const viewerJoined=has("meet_join_accepted",candidate);const candidateJoined=has("meet_join_accepted",viewer);
  const messages=inWindow.filter(event=>event.eventName==="message_sent_metadata"&&event.isDirectPairMessage&&(event.actorUserId===viewer||event.actorUserId===candidate));
  const linked=scoreSnapshots.filter(score=>score.viewerUserId===viewer&&score.candidateUserId===candidate&&score.featureSchemaVersion===1&&(score.scoreVersion===1||score.scoreVersion===2)&&new Date(score.snapshotAt).getTime()<=anchorTime).sort((left,right)=>{
    const timeDiff=new Date(right.snapshotAt).getTime()-new Date(left.snapshotAt).getTime();
    return timeDiff!==0?timeDiff:right.scoreVersion-left.scoreVersion;
  })[0];
  return {windowEndsAt:new Date(windowEnd).toISOString(),scoreSnapshotId:linked?.id??null,outcomes:{
    profile_opened:has("profile_open",viewer),return_to_profile:has("return_to_profile",viewer),liked:has("like",viewer),passed:has("pass",viewer),matched:has("match_created"),chat_started:has("chat_started"),messages_sent_by_viewer:messages.filter(event=>event.actorUserId===viewer).length,messages_sent_by_candidate:messages.filter(event=>event.actorUserId===candidate).length,shared_meet_activity:viewerJoined||candidateJoined,viewer_joined_candidate_meet:viewerJoined,candidate_joined_viewer_meet:candidateJoined,blocked:has("block",viewer),reported:has("report",viewer),
  }};
}
