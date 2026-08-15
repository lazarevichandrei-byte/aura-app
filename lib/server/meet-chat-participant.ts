import { supabaseAdmin } from "../supabase-admin";

export async function ensureMeetChatParticipant(chatId: string, userId: string) {
  const { data, error } = await supabaseAdmin.rpc(
    "ensure_meet_chat_participant",
    {
      p_chat_id: chatId,
      p_user_id: userId,
    }
  );

  if (error) throw error;

  const result = Array.isArray(data) ? data[0] : data;
  if (!result) throw new Error("MEET_CHAT_PARTICIPANT_ENSURE_FAILED");

  return {
    participantAdded: Boolean(result.participant_added),
    readStateInitialized: Boolean(result.read_state_initialized),
  };
}
