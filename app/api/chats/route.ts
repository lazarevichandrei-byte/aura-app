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

    const { data: chatsRaw } =
  await supabaseAdmin
    .from("chats")
    .select("*")
    .or(
      `user1_id.eq.${user.id},user2_id.eq.${user.id}`
    )
    .order(
      "last_message_at",
      { ascending:false }
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

    const otherUserId =
      chat.user1_id === user.id
        ? chat.user2_id
        : chat.user1_id;

    const otherUser = usersById.get(otherUserId);

    return {
      ...chat,

      name:
        otherUser?.name || "Без имени",

      avatar:
  otherUser?.avatar_url || "/girl1.jpg"
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
