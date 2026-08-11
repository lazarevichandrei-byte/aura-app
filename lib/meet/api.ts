import { supabase } from "../supabase";
import { calculateMeetExpiration } from "./time";
import { getTelegramInitData } from "../telegram-init-data";

async function updateMeetMembership(action: string, values: Record<string, string>) {
  const initData = await getTelegramInitData();
  if (!initData) throw new Error("Не удалось подтвердить пользователя Telegram");

  const response = await fetch("/api/meet/membership", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ initData, action, ...values }),
  });
  const result = await response.json();
  if (!response.ok || !result.ok) throw new Error(result.error || "Операция не выполнена");
}

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
  duration,
  join_type,
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
  duration: "30m" | "1h" | "2h" | "day";
join_type: "open" | "approval";
max_people: number;
}) {
const expiresAt = calculateMeetExpiration(starts_at, duration);

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
duration,
join_type,
expires_at: expiresAt,
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
  is_online,
  last_seen,
  show_online,
  show_last_seen
),
meet_participants(
  joined_at,
  users(
    id,
    name,
    avatar_url,
    photos
  )
),
meet_join_requests(user_id,status)
      `)
      .eq("is_active", true)
.gt("expires_at", new Date().toISOString())
.order("starts_at", {
  ascending: true
});

  if (error) {
    throw error;
  }

  return data;
}

export async function loadMeetEventCard(eventId: string) {
  const { data, error } = await supabase
    .from("meet_events")
    .select(`
      *,
      users(id,name,age,city,avatar_url,photos,is_online,last_seen,show_online,show_last_seen),
      meet_participants(joined_at,users(id,name,avatar_url,photos)),
      meet_join_requests(user_id,status)
    `)
    .eq("id", eventId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// 👇 ДОБАВИТЬ ОТСЮДА

export async function joinMeetEvent(
  eventId: string,
  userId: string
) {
  await updateMeetMembership("join", { eventId, userId });
}

export async function leaveMeetEvent(
  eventId: string,
  userId: string
) {
  await updateMeetMembership("leave", { eventId, userId });
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
  avatar_url,
  photos,
  is_online,
  last_seen,
  show_online,
  show_last_seen
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
  duration?: "30m" | "1h" | "2h" | "day";
  max_people: number;
}
) {
  const duration = values.duration ?? "1h";
  const { data, error } = await supabase
    .from("meet_events")
    .update({
      ...values,
      expires_at: calculateMeetExpiration(values.starts_at, duration),
    })
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
  const initData = await getTelegramInitData();
  if (!initData) throw new Error("Не удалось подтвердить пользователя Telegram");
  const response = await fetch("/api/meet/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ initData, eventId }),
  });
  const result = await response.json();
  if (!response.ok || !result.ok) throw new Error(result.error || "DELETE_FAILED");
}

export async function removeMeetParticipant(
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

export async function getMeetParticipants(
  eventId: string
) {
  const { data, error } = await supabase
    .from("meet_participants")
    .select(`
      joined_at,
      users(
  id,
  name,
  age,
  city,
  avatar_url,
  photos,
  is_online,
  last_seen,
  show_online,
  show_last_seen
)
    `)
    .eq("event_id", eventId)
    .order("joined_at", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return data;
}


export async function sendJoinRequest(
  eventId: string,
  userId: string
) {
  await updateMeetMembership("request", { eventId, userId });
}

export async function cancelJoinRequest(
  eventId: string,
  userId: string
) {
  await updateMeetMembership("cancel-request", { eventId, userId });
}

export async function getJoinRequest(
  eventId: string,
  userId: string
) {
  const { data, error } = await supabase
    .from("meet_join_requests")
    .select("*")
    .eq("event_id", eventId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function loadMeetJoinRequests(
  eventId: string
) {
  const { data, error } = await supabase
    .from("meet_join_requests")
    .select(`
      *,
      users(
        id,
        name,
        age,
        city,
        avatar_url,
        photos,
        is_online,
        last_seen,
        show_online,
        show_last_seen
      )
    `)
    .eq("event_id", eventId)
    .eq("status", "pending")
.order("created_at", {
  ascending: true,
});

  if (error) {
    throw error;
  }

  return data;
}

export async function approveJoinRequest(
  requestId: string
) {
  await updateMeetMembership("approve", { requestId });
}

export async function rejectJoinRequest(
  requestId: string
) {
  await updateMeetMembership("reject", { requestId });
}
