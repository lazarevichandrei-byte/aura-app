import { supabase } from "../supabase";

import {
  createMeetChatIfNotExists,
  addUserToMeetChat,
} from "../chat/api";

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
  const start = new Date(starts_at);

let expires = new Date(start);

switch (duration) {
  case "30m":
    expires.setMinutes(expires.getMinutes() + 30);
    break;

  case "1h":
    expires.setHours(expires.getHours() + 1);
    break;

  case "2h":
    expires.setHours(expires.getHours() + 2);
    break;

  case "day":
    expires.setHours(23, 59, 59, 999);
    break;
}

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
expires_at: expires.toISOString(),
max_people
      })
      .select()
      .single();

  if (error) {
  throw error;
}

const chatId =
  await createMeetChatIfNotExists(data.id);

if (!chatId) {
  throw new Error(
    "Не удалось создать чат встречи"
  );
}

const added =
  await addUserToMeetChat(
    chatId,
    creator_id
  );

if (!added) {
  throw new Error(
    "Не удалось добавить создателя встречи в чат"
  );
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
)
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

// 👇 ДОБАВИТЬ ОТСЮДА

export async function joinMeetEvent(
  eventId: string,
  userId: string
) {
  const { data: existing, error: checkError } = await supabase
    .from("meet_participants")
    .select("event_id")
    .eq("event_id", eventId)
    .eq("user_id", userId)
    .maybeSingle();

  if (checkError) {
    throw checkError;
  }

  if (existing) {
    return;
  }

 const { error } = await supabase
  .from("meet_participants")
  .insert({
    event_id: eventId,
    user_id: userId,
  });

if (error) {
  throw error;
}

const chatId =
  await createMeetChatIfNotExists(
    eventId
  );

if (!chatId) {
  throw new Error(
    "Не удалось получить чат встречи"
  );
}

const added =
  await addUserToMeetChat(
    chatId,
    userId
  );

if (!added) {
  throw new Error(
    "Не удалось добавить пользователя в чат встречи"
  );
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

const { data: chat } =
  await supabase
    .from("chats")
    .select("id")
    .eq("event_id", eventId)
    .maybeSingle();

if (chat) {
  const { error: chatError } =
    await supabase
      .from("chat_participants")
      .delete()
      .eq("chat_id", chat.id)
      .eq("user_id", userId);

  if (chatError) {
    throw chatError;
  }
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
  

  const participants = await supabase
  .from("meet_participants")
  .delete()
  .eq("event_id", eventId);



const event = await supabase
  .from("meet_events")
  .delete()
  .eq("id", eventId)
  .select();



if (participants.error) {
  throw participants.error;
}

if (event.error) {
  throw event.error;
}

return event.data;
  
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
  const { error } = await supabase
    .from("meet_join_requests")
    .insert({
      event_id: eventId,
      user_id: userId,
    });

  if (error) {
    throw error;
  }
}

export async function cancelJoinRequest(
  eventId: string,
  userId: string
) {
  const { error } = await supabase
    .from("meet_join_requests")
    .delete()
    .eq("event_id", eventId)
    .eq("user_id", userId)
    .eq("status", "pending");

  if (error) {
    throw error;
  }
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
  // Получаем заявку, чтобы узнать встречу и пользователя
  const { data: request, error: requestError } =
    await supabase
      .from("meet_join_requests")
      .select("id, event_id, user_id, status")
      .eq("id", requestId)
      .single();

  if (requestError) {
    throw requestError;
  }

  if (request.status !== "pending") {
    return request;
  }

  // Одобряем заявку
  const { data, error } =
    await supabase
      .from("meet_join_requests")
      .update({
        status: "approved",
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", requestId)
      .select()
      .single();

  if (error) {
    throw error;
  }

  // Добавляем пользователя в участников встречи
  const { data: existingParticipant, error: participantCheckError } =
    await supabase
      .from("meet_participants")
      .select("event_id")
      .eq("event_id", request.event_id)
      .eq("user_id", request.user_id)
      .maybeSingle();

  if (participantCheckError) {
    throw participantCheckError;
  }

  if (!existingParticipant) {
    const { error: participantError } =
      await supabase
        .from("meet_participants")
        .insert({
          event_id: request.event_id,
          user_id: request.user_id,
        });

    if (participantError) {
      throw participantError;
    }
  }

  // Получаем или создаём чат встречи
  const chatId =
    await createMeetChatIfNotExists(
      request.event_id
    );

  if (!chatId) {
    throw new Error(
      "Не удалось получить чат встречи"
    );
  }

  // Добавляем пользователя в чат встречи
  const added =
    await addUserToMeetChat(
      chatId,
      request.user_id
    );

  if (!added) {
    throw new Error(
      "Не удалось добавить пользователя в чат встречи"
    );
  }

  return data;
}

export async function rejectJoinRequest(
  requestId: string
) {
  const { data, error } = await supabase
    .from("meet_join_requests")
    .update({
      status: "rejected",
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", requestId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}
