import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "../../../lib/supabase-admin";

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

    const params =
      new URLSearchParams(initData);

    const userRaw =
      params.get("user");

    const hash =
      params.get("hash");

    if(!userRaw || !hash){
      return NextResponse.json(
        { ok:false },
        { status:400 }
      );
    }

    params.delete("hash");

    const dataCheckString =
      [...params.entries()]
      .sort(([a],[b])=>
        a.localeCompare(b)
      )
      .map(([key,value])=>
        `${key}=${value}`
      )
      .join("\n");

    const secretKey = crypto
      .createHash("sha256")
      .update(
        process.env
        .TELEGRAM_BOT_TOKEN!
      )
      .digest();

    const hmac = crypto
      .createHmac(
        "sha256",
        secretKey
      )
      .update(dataCheckString)
      .digest("hex");

    if(hmac !== hash){

      return NextResponse.json(
        { ok:false },
        { status:403 }
      );

    }

    const telegramUser =
      JSON.parse(userRaw);

    const telegramId =
      telegramUser.id;

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

    const { data: chats } =
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

        console.log("USER ID:", user.id);
console.log("CHATS:", chats);

    return NextResponse.json({
      ok:true,
      chats
    });

  }catch(e){

    return NextResponse.json(
      { ok:false },
      { status:500 }
    );

  }

}