import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabase-admin";
import { validateTelegramInitData } from "../../../lib/telegram-auth";
export const runtime = "nodejs";

export async function POST(req: Request){

  try{

    const body = await req.json();

    const initData = body?.initData;

    if(!initData){
      return NextResponse.json(
        { ok:false },
        { status:400 }
      );
    }

    const validation = validateTelegramInitData(initData);

    if (validation.ok === false) {
      return NextResponse.json(
        { ok: false, error: validation.error },
        { status: validation.error === "BOT_TOKEN_MISSING" ? 500 : 403 }
      );
    }

    const telegramId = validation.user.id;

    const { data:user } =
      await supabaseAdmin
        .from("users")
        .select("*")
        .eq(
          "telegram_id",
          telegramId
        )
        .single();

    if(!user){

      return NextResponse.json(
        { ok:false },
        { status:404 }
      );

    }

   const { data: personalChats } =
  await supabaseAdmin
    .from("chats")
    .select("*")
    .or(
      `user1_id.eq.${user.id},user2_id.eq.${user.id}`
    );

const { data: participantRows } =
  await supabaseAdmin
    .from("chat_participants")
    .select("chat_id")
    .eq("user_id", user.id);

const meetChatIds = [
  ...new Set(
    (participantRows || []).map(
      (row) => row.chat_id
    )
  )
];

const { data: meetChats } =
  meetChatIds.length
    ? await supabaseAdmin
        .from("chats")
        .select("*")
        .in("id", meetChatIds)
        .not("event_id", "is", null)
    : { data: [] };

const chatsRaw = [
  ...(personalChats || []),
  ...(meetChats || [])
]
  .filter(
    (chat, index, array) =>
      array.findIndex(
        (item) => item.id === chat.id
      ) === index
  )
  .sort(
    (a, b) =>
      new Date(
        b.last_message_at || 0
      ).getTime() -
      new Date(
        a.last_message_at || 0
      ).getTime()
  );


  const meetEventIds = [
  ...new Set(
    (chatsRaw || [])
      .filter((chat) => chat.event_id)
      .map((chat) => chat.event_id)
  )
];

const { data: meetEvents } =
  meetEventIds.length
    ? await supabaseAdmin
        .from("meet_events")
        .select(
          "id, title, category, city, place, starts_at"
        )
        .in("id", meetEventIds)
    : { data: [] };

const meetEventsById = new Map(
  (meetEvents || []).map(
    (event) => [event.id, event]
  )
);

    const otherUserIds = [...new Set(
      (chatsRaw || []).map((chat) =>
        chat.user1_id === user.id ? chat.user2_id : chat.user1_id
      )
    )];

    const { data: otherUsers } = otherUserIds.length
      ? await supabaseAdmin
          .from("users")
          .select("id, name, avatar_url")
          .in("id", otherUserIds)
      : { data: [] };

    const usersById = new Map(
      (otherUsers || []).map((otherUser) => [otherUser.id, otherUser])
    );

    const chats = (chatsRaw || []).map((chat) => {

  const isMeetChat =
    Boolean(chat.event_id);

  if (isMeetChat) {

    const event =
      meetEventsById.get(
        chat.event_id
      );

    return {
      ...chat,

      is_meet_chat: true,

      event_id: chat.event_id,

      event_title:
        event?.title || "Встреча",

      event_category:
        event?.category || null,

      event_city:
        event?.city || null,

      event_place:
        event?.place || null,

      event_starts_at:
        event?.starts_at || null,

      name:
        event?.title || "Встреча",

      avatar:
        "/girl1.jpg"
    };
  }

  const otherUserId =
    chat.user1_id === user.id
      ? chat.user2_id
      : chat.user1_id;

  const otherUser =
    usersById.get(otherUserId);

  return {
    ...chat,

    is_meet_chat: false,

    name:
      otherUser?.name || "Без имени",

    avatar:
      otherUser?.avatar_url ||
      "/girl1.jpg"
  };

});
    return NextResponse.json({
      ok:true,
      chats
    });

 }catch(e){

  console.log("CHATS ERROR:", e);

  return NextResponse.json(
    { ok:false },
    { status:500 }
  );

}

}
