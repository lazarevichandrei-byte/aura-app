export type ConversationReadMessageRow={
  sender_id:string;
  created_at:string;
  is_read:boolean|null;
  read_at:string|null;
};

export type AuraConversationReadSignalsV1={
  viewer_sent_30d:number;
  candidate_sent_30d:number;
  viewer_messages_read_by_candidate_30d:number;
  candidate_messages_read_by_viewer_30d:number;
  viewer_message_read_rate_30d:number;
  candidate_message_read_rate_30d:number;
  viewer_median_read_seconds_30d:number|null;
  candidate_median_read_seconds_30d:number|null;
  viewer_unread_older_than_24h_30d:number;
  candidate_unread_older_than_24h_30d:number;
};

export const DAY_MS=24*60*60*1000;
const clamp01=(value:number)=>Math.max(0,Math.min(1,value));
const round4=(value:number)=>Math.round(value*10000)/10000;
const median=(values:number[])=>{
  if(values.length===0)return null;
  const sorted=[...values].sort((a,b)=>a-b);
  const middle=Math.floor(sorted.length/2);
  return sorted.length%2?sorted[middle]:(sorted[middle-1]+sorted[middle])/2;
};

export function aggregateConversationReadSignalsV1(
  rows:readonly ConversationReadMessageRow[],
  viewerUserId:string,
  candidateUserId:string,
  snapshotAt:string
):AuraConversationReadSignalsV1{
  const snapshotMs=new Date(snapshotAt).getTime();
  if(!Number.isFinite(snapshotMs))throw new Error("INVALID_SNAPSHOT_AT");

  const bySender=(senderId:string)=>rows.filter(row=>row.sender_id===senderId);
  const viewer=bySender(viewerUserId);
  const candidate=bySender(candidateUserId);

  const readCount=(senderRows:readonly ConversationReadMessageRow[])=>senderRows.filter(row=>Boolean(row.is_read)).length;
  const readLatencies=(senderRows:readonly ConversationReadMessageRow[])=>senderRows.flatMap(row=>{
    if(!row.is_read||!row.read_at)return [];
    const sentMs=new Date(row.created_at).getTime();
    const readMs=new Date(row.read_at).getTime();
    if(!Number.isFinite(sentMs)||!Number.isFinite(readMs)||readMs<sentMs)return [];
    return [(readMs-sentMs)/1000];
  });
  const staleUnread=(senderRows:readonly ConversationReadMessageRow[])=>senderRows.filter(row=>{
    if(row.is_read)return false;
    const sentMs=new Date(row.created_at).getTime();
    return Number.isFinite(sentMs)&&snapshotMs-sentMs>=DAY_MS;
  }).length;

  const viewerRead=readCount(viewer);
  const candidateRead=readCount(candidate);
  const viewerLatency=median(readLatencies(viewer));
  const candidateLatency=median(readLatencies(candidate));

  return {
    viewer_sent_30d:viewer.length,
    candidate_sent_30d:candidate.length,
    viewer_messages_read_by_candidate_30d:viewerRead,
    candidate_messages_read_by_viewer_30d:candidateRead,
    viewer_message_read_rate_30d:viewer.length?round4(clamp01(viewerRead/viewer.length)):0,
    candidate_message_read_rate_30d:candidate.length?round4(clamp01(candidateRead/candidate.length)):0,
    viewer_median_read_seconds_30d:viewerLatency===null?null:Math.round(viewerLatency),
    candidate_median_read_seconds_30d:candidateLatency===null?null:Math.round(candidateLatency),
    viewer_unread_older_than_24h_30d:staleUnread(viewer),
    candidate_unread_older_than_24h_30d:staleUnread(candidate),
  };
}
