import { supabase } from "../supabase";

export async function createMeetEvent({
  creator_id,
  title,
  description,
  category,
  city,
  place,
  latitude,
  longitude,
  starts_at,
  max_people
}: {
  creator_id: string;
  title: string;
  description: string;
  category: string;
  city: string;
  place: string;
  latitude: number | null;
  longitude: number | null;
  starts_at: string;
  max_people: number;
}) {
  const { data, error } =
    await supabase
      .from("meet_events")
      .insert({
        creator_id,
        title,
        description,
        category,
        city,
        place,
        latitude,
        longitude,
        starts_at,
        max_people
      })
      .select()
      .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function loadMeetEvents() {
  const { data, error } =
    await supabase
      .from("meet_events")
      .select(`
        *,
        users(
          id,
          name,
          age,
          city,
          avatar_url,
          photos,
          is_online
        ),
        meet_participants(
          joined_at,
          users(
            id,
            name,
            avatar_url,
            photos
          )
        )
      `)
      .eq("is_active", true)
      .order("starts_at", {
        ascending: true
      });

  if (error) {
    throw error;
  }

  return data;
}

// 👇 ДОБАВИТЬ ОТСЮДА

export async function joinMeetEvent(
  eventId: string,
  userId: string
) {
  const { error } = await supabase
    .from("meet_participants")
    .insert({
      event_id: eventId,
      user_id: userId,
    });

  if (error) {
    throw error;
  }
}

export async function leaveMeetEvent(
  eventId: string,
  userId: string
) {
  const { error } = await supabase
    .from("meet_participants")
    .delete()
    .eq("event_id", eventId)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
  
}
export async function getMeetEvent(eventId: string) {
  const { data, error } = await supabase
    .from("meet_events")
    .select(`
      *,
      users(
        id,
        name,
        age,
        city,
        avatar_url
      )
    `)
    .eq("id", eventId)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateMeetEvent(
  eventId: string,
  values: {
  title: string;
  description: string;
  category: string;
  city: string;
  place: string;
  latitude: number | null;
  longitude: number | null;
  starts_at: string;
  max_people: number;
}
) {
  const { data, error } = await supabase
    .from("meet_events")
    .update(values)
    .eq("id", eventId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}
export async function deleteMeetEvent(
  eventId: string
) {
  // Сначала удаляем участников
  const { error: participantsError } = await supabase
    .from("meet_participants")
    .delete()
    .eq("event_id", eventId);

  if (participantsError) {
    throw participantsError;
  }

  // Затем удаляем саму встречу
  const { error } = await supabase
    .from("meet_events")
    .delete()
    .eq("id", eventId);

  if (error) {
    throw error;
  }
}

