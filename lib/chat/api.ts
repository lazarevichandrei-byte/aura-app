import { supabase } from "../supabase";

export async function createChatIfNotExists(
  userA: string,
  userB: string
) {
  const { data: existing } = await supabase
    .from("chats")
    .select("id")
    .or(
      `and(user1_id.eq.${userA},user2_id.eq.${userB}),and(user1_id.eq.${userB},user2_id.eq.${userA})`
    )
    .maybeSingle();

  if (existing) {
    return existing.id;
  }

  const { data, error } = await supabase
    .from("chats")
    .insert({
      user1_id: userA,
      user2_id: userB,
      last_message: "",
      liked_by: true,
      is_new_match: false,
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  return data.id;
}

export async function createMeetChatIfNotExists(
  eventId: string
) {
  const { data: existing, error: existingError } =
    await supabase
      .from("chats")
      .select("id")
      .eq("event_id", eventId)
      .maybeSingle();

  if (existingError) {
    console.error(
      "MEET CHAT CHECK ERROR:",
      existingError
    );

    return null;
  }

  if (existing) {
    return existing.id;
  }

  const { data, error } =
    await supabase
      .from("chats")
      .insert({
        event_id: eventId,

        user1_id: null,
        user2_id: null,

        last_message: "",
        liked_by: true,
        is_new_match: false,
        has_messages: false,
        unread_count: 0,
      })
      .select("id")
      .single();

  if (error) {
    console.error(
      "MEET CHAT CREATE ERROR:",
      error
    );

    return null;


    
  }

  return data.id;
}

export async function addUserToMeetChat(
  chatId: string,
  userId: string
) {
  const { data: existing, error: checkError } =
    await supabase
      .from("chat_participants")
      .select("id")
      .eq("chat_id", chatId)
      .eq("user_id", userId)
      .maybeSingle();

  if (checkError) {
    console.error(
      "MEET CHAT PARTICIPANT CHECK ERROR:",
      checkError
    );

    return false;
  }

  if (existing) {
    return true;
  }

  const { error } =
    await supabase
      .from("chat_participants")
      .insert({
        chat_id: chatId,
        user_id: userId,
      });

  if (error) {
    console.error(
      "MEET CHAT PARTICIPANT ADD ERROR:",
      error
    );

    return false;
  }

  return true;
}