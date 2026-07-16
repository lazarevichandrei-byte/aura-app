import { supabase } from "../supabase";

export async function loadMeetEvents() {

  const { data, error } =
    await supabase
      .from("meet_events")
      .select("*")
      .eq("is_active", true)
      .order("starts_at");

  if (error) {

    throw error;

  }

  return data;

}