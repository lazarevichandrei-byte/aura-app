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

const chats = await Promise.all(

  (chatsRaw || []).map(async (chat) => {

    const otherUserId =
      chat.user1_id === user.id
        ? chat.user2_id
        : chat.user1_id;

    const { data: otherUser } =
      await supabaseAdmin
        .from("users")
        .select(`
  id,
  name,
  avatar_url
`)
        .eq("id", otherUserId)
        .single();

        console.log("CHAT:", chat.id);
console.log("OTHER USER ID:", otherUserId);
console.log("OTHER USER:", otherUser);

    return {
      ...chat,

      name:
        otherUser?.name || "Без имени",

      avatar:
  otherUser?.avatar_url || "/girl1.jpg"
    };

  })

);

        console.log("USER ID:", user.id);
console.log("CHATS:", chats);

    console.log("FINAL CHATS:", chats);
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
