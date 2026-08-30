import {supabaseAdmin} from "../../../supabase-admin";
import {
  DAY_MS,
  aggregateConversationReadSignalsV1,
  type AuraConversationReadSignalsV1,
  type ConversationReadMessageRow,
} from "./read-signals-core";

export {aggregateConversationReadSignalsV1} from "./read-signals-core";
export type {AuraConversationReadSignalsV1,ConversationReadMessageRow} from "./read-signals-core";

export async function buildConversationReadSignalsV1(
  viewerUserId:string,
  candidateUserId:string,
  snapshotAt:string
):Promise<AuraConversationReadSignalsV1>{
  const empty=aggregateConversationReadSignalsV1([],viewerUserId,candidateUserId,snapshotAt);
  const {data:chat,error:chatError}=await supabaseAdmin
    .from("chats")
    .select("id")
    .is("event_id",null)
    .or(`and(user1_id.eq.${viewerUserId},user2_id.eq.${candidateUserId}),and(user1_id.eq.${candidateUserId},user2_id.eq.${viewerUserId})`)
    .maybeSingle();
  if(chatError)throw chatError;
  if(!chat)return empty;

  const snapshotMs=new Date(snapshotAt).getTime();
  if(!Number.isFinite(snapshotMs))throw new Error("INVALID_SNAPSHOT_AT");
  const from=new Date(snapshotMs-30*DAY_MS).toISOString();
  const {data,error}=await supabaseAdmin
    .from("messages")
    .select("sender_id,created_at,is_read,read_at")
    .eq("chat_id",chat.id)
    .gte("created_at",from)
    .lte("created_at",snapshotAt)
    .order("created_at",{ascending:true})
    .limit(2000);
  if(error)throw error;

  return aggregateConversationReadSignalsV1(
    (data??[]) as ConversationReadMessageRow[],
    viewerUserId,
    candidateUserId,
    snapshotAt
  );
}
