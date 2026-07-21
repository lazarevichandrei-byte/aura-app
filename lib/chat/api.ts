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