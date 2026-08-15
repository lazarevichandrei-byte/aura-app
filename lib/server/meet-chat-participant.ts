import { supabaseAdmin } from "../supabase-admin";

export async function ensureMeetChatParticipant(chatId: string, userId: string) {
  const { data, error } = await supabaseAdmin.rpc(
    "ensure_meet_chat_participant",
    {
      p_chat_id: chatId,
      p_user_id: userId,
    }
  );

  if (error?.code === "PGRST202" || error?.code === "42883") {
    const { error: participantError } = await supabaseAdmin
      .from("chat_participants")
      .insert({ chat_id: chatId, user_id: userId });
    if (participantError && participantError.code !== "23505") {
      throw participantError;
    }

    const { data: latestMessage, error: latestMessageError } = await supabaseAdmin
      .from("messages")
      .select("id,created_at")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (latestMessageError) throw latestMessageError;

    const { error: readStateError } = await supabaseAdmin
      .from("chat_read_state")
      .upsert({
        chat_id: chatId,
        user_id: userId,
        last_read_at: latestMessage?.created_at || new Date().toISOString(),
        last_read_message_id: latestMessage?.id || null,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "chat_id,user_id",
        ignoreDuplicates: true,
      });
    if (readStateError && readStateError.code !== "PGRST205" && readStateError.code !== "42P01") {
      throw readStateError;
    }

    return {
      participantAdded: !participantError,
      readStateInitialized: !readStateError,
    };
  }

  if (error) throw error;

  const result = Array.isArray(data) ? data[0] : data;
  if (!result) throw new Error("MEET_CHAT_PARTICIPANT_ENSURE_FAILED");

  return {
    participantAdded: Boolean(result.participant_added),
    readStateInitialized: Boolean(result.read_state_initialized),
  };
}

export async function reserveMeetGuestSlot(eventId: string, userId: string) {
  const { data, error } = await supabaseAdmin.rpc("reserve_meet_guest_slot", {
    p_event_id: eventId,
    p_user_id: userId,
  });

  if (error) throw error;
  return Boolean(data);
}
