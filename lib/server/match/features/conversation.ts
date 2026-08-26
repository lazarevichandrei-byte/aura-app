import "server-only";

import {supabaseAdmin} from "../../../supabase-admin";

export type AuraConversationFeaturesV1={
  direct_message_count_30d:number;
  viewer_message_count_30d:number;
  candidate_message_count_30d:number;
  viewer_avg_message_chars_30d:number;
  candidate_avg_message_chars_30d:number;
  viewer_median_message_chars_30d:number;
  candidate_median_message_chars_30d:number;
  viewer_long_messages_30d:number;
  candidate_long_messages_30d:number;
  viewer_short_messages_30d:number;
  candidate_short_messages_30d:number;
  viewer_question_messages_30d:number;
  candidate_question_messages_30d:number;
  viewer_meet_intent_messages_30d:number;
  candidate_meet_intent_messages_30d:number;
  viewer_median_reply_seconds_30d:number|null;
  candidate_median_reply_seconds_30d:number|null;
  active_chat_days_30d:number;
  conversation_span_days:number;
  longest_viewer_burst:number;
  longest_candidate_burst:number;
  message_balance_ratio:number;
  viewer_started_conversation:boolean;
  candidate_started_conversation:boolean;
  mutual_conversation:boolean;
};

type MessageRow={sender_id:string;body:string|null;created_at:string};

const median=(values:number[])=>{
  if(values.length===0)return null;
  const sorted=[...values].sort((a,b)=>a-b);
  const middle=Math.floor(sorted.length/2);
  return sorted.length%2?sorted[middle]:(sorted[middle-1]+sorted[middle])/2;
};
const avg=(values:number[])=>values.length?values.reduce((sum,value)=>sum+value,0)/values.length:0;
const round=(value:number)=>Math.round(value*100)/100;
const meetIntent=(text:string)=>/(встрет|увидет|кофе|кино|прогул|пойд[её]м|давай.*(?:встрет|кофе|кино|гуля)|meet\b|coffee|movie|walk|date\b)/iu.test(text);
const question=(text:string)=>/[?？]/u.test(text);

export async function buildConversationFeaturesV1(viewerUserId:string,candidateUserId:string,snapshotAt:string):Promise<AuraConversationFeaturesV1>{
  const empty:AuraConversationFeaturesV1={direct_message_count_30d:0,viewer_message_count_30d:0,candidate_message_count_30d:0,viewer_avg_message_chars_30d:0,candidate_avg_message_chars_30d:0,viewer_median_message_chars_30d:0,candidate_median_message_chars_30d:0,viewer_long_messages_30d:0,candidate_long_messages_30d:0,viewer_short_messages_30d:0,candidate_short_messages_30d:0,viewer_question_messages_30d:0,candidate_question_messages_30d:0,viewer_meet_intent_messages_30d:0,candidate_meet_intent_messages_30d:0,viewer_median_reply_seconds_30d:null,candidate_median_reply_seconds_30d:null,active_chat_days_30d:0,conversation_span_days:0,longest_viewer_burst:0,longest_candidate_burst:0,message_balance_ratio:0,viewer_started_conversation:false,candidate_started_conversation:false,mutual_conversation:false};
  const {data:chat,error:chatError}=await supabaseAdmin.from("chats").select("id,user1_id,user2_id,event_id").is("event_id",null).or(`and(user1_id.eq.${viewerUserId},user2_id.eq.${candidateUserId}),and(user1_id.eq.${candidateUserId},user2_id.eq.${viewerUserId})`).maybeSingle();
  if(chatError)throw chatError;
  if(!chat)return empty;
  const snapshotMs=new Date(snapshotAt).getTime();
  const from=new Date(snapshotMs-30*24*60*60*1000).toISOString();
  const {data,error}=await supabaseAdmin.from("messages").select("sender_id,body,created_at").eq("chat_id",chat.id).gte("created_at",from).lte("created_at",snapshotAt).eq("message_type","text").order("created_at",{ascending:true}).limit(1000);
  if(error)throw error;
  const messages=(data??[]) as MessageRow[];
  if(messages.length===0)return empty;
  const viewer=messages.filter(message=>message.sender_id===viewerUserId);
  const candidate=messages.filter(message=>message.sender_id===candidateUserId);
  const lengths=(rows:MessageRow[])=>rows.map(row=>(row.body??"").trim().length);
  const viewerLengths=lengths(viewer),candidateLengths=lengths(candidate);
  const viewerReply:number[]=[],candidateReply:number[]=[];
  let viewerBurst=0,candidateBurst=0,currentSender="",currentBurst=0;
  for(let index=0;index<messages.length;index++){
    const current=messages[index];
    if(current.sender_id===currentSender)currentBurst++;else{currentSender=current.sender_id;currentBurst=1;}
    if(current.sender_id===viewerUserId)viewerBurst=Math.max(viewerBurst,currentBurst);else if(current.sender_id===candidateUserId)candidateBurst=Math.max(candidateBurst,currentBurst);
    if(index===0)continue;
    const previous=messages[index-1];
    if(previous.sender_id===current.sender_id)continue;
    const seconds=Math.max(0,(new Date(current.created_at).getTime()-new Date(previous.created_at).getTime())/1000);
    if(current.sender_id===viewerUserId)viewerReply.push(seconds);else if(current.sender_id===candidateUserId)candidateReply.push(seconds);
  }
  const days=new Set(messages.map(message=>message.created_at.slice(0,10)));
  const firstMs=new Date(messages[0].created_at).getTime(),lastMs=new Date(messages[messages.length-1].created_at).getTime();
  const minCount=Math.min(viewer.length,candidate.length),maxCount=Math.max(viewer.length,candidate.length);
  return {
    direct_message_count_30d:messages.length,viewer_message_count_30d:viewer.length,candidate_message_count_30d:candidate.length,
    viewer_avg_message_chars_30d:round(avg(viewerLengths)),candidate_avg_message_chars_30d:round(avg(candidateLengths)),viewer_median_message_chars_30d:round(median(viewerLengths)??0),candidate_median_message_chars_30d:round(median(candidateLengths)??0),
    viewer_long_messages_30d:viewerLengths.filter(value=>value>=120).length,candidate_long_messages_30d:candidateLengths.filter(value=>value>=120).length,viewer_short_messages_30d:viewerLengths.filter(value=>value>0&&value<=15).length,candidate_short_messages_30d:candidateLengths.filter(value=>value>0&&value<=15).length,
    viewer_question_messages_30d:viewer.filter(message=>question(message.body??"")).length,candidate_question_messages_30d:candidate.filter(message=>question(message.body??"")).length,viewer_meet_intent_messages_30d:viewer.filter(message=>meetIntent(message.body??"")).length,candidate_meet_intent_messages_30d:candidate.filter(message=>meetIntent(message.body??"")).length,
    viewer_median_reply_seconds_30d:median(viewerReply)===null?null:Math.round(median(viewerReply)!),candidate_median_reply_seconds_30d:median(candidateReply)===null?null:Math.round(median(candidateReply)!),active_chat_days_30d:days.size,conversation_span_days:Math.max(1,Math.ceil((lastMs-firstMs)/(24*60*60*1000))),longest_viewer_burst:viewerBurst,longest_candidate_burst:candidateBurst,message_balance_ratio:maxCount===0?0:round(minCount/maxCount),viewer_started_conversation:messages[0].sender_id===viewerUserId,candidate_started_conversation:messages[0].sender_id===candidateUserId,mutual_conversation:viewer.length>0&&candidate.length>0,
  };
}
