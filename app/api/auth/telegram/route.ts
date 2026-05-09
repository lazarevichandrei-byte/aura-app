import { NextResponse } from "next/server";
import * as crypto from "crypto";
import { supabaseAdmin } from "../../../../lib/supabase-admin";

export const runtime = "nodejs";

export async function POST(req: Request) {

  try {

    console.log("START AUTH ROUTE");

    console.log(
      "BOT TOKEN:",
      !!process.env.TELEGRAM_BOT_TOKEN
    );

    console.log(
      "SERVICE ROLE:",
      !!process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const body = await req.json();

    const initData = body?.initData;

    if (!initData) {
      return NextResponse.json(
        { ok:false, error:"NO_INIT_DATA" },
        { status:400 }
      );
    }

    const params =
      new URLSearchParams(initData);

    const userRaw =
      params.get("user");

    const hash =
      params.get("hash");

    if (!userRaw || !hash) {
      return NextResponse.json(
        { ok:false, error:"INVALID_DATA" },
        { status:400 }
      );
    }

    params.delete("hash");

    const dataCheckString =
      [...params.entries()]
      .sort(([a],[b]) =>
        a.localeCompare(b)
      )
      .map(([key,value]) =>
        `${key}=${value}`
      )
      .join("\n");

    const secretKey = crypto
      .createHash("sha256")
      .update(
        process.env.TELEGRAM_BOT_TOKEN!
      )
      .digest();

    const hmac = crypto
      .createHmac(
        "sha256",
        secretKey
      )
      .update(dataCheckString)
      .digest("hex");

    // if (hmac !== hash) {
//
//   return NextResponse.json(
//     { ok:false, error:"INVALID_HASH" },
//     { status:403 }
//   );
//
// }

    const telegramUser =
      JSON.parse(userRaw);

    const telegramId =
      telegramUser.id;

    const { data: existingUser } =
      await supabaseAdmin
        .from("users")
        .select("*")
        .eq(
          "telegram_id",
          telegramId
        )
        .single();

    if (existingUser) {

      return NextResponse.json({
        ok:true,
        user: existingUser
      });

    }

    const {
      data:newUser,
      error:newUserError
    } =
      await supabaseAdmin
        .from("users")
        .insert({
          telegram_id: telegramId,
          name:
            telegramUser.first_name ||
            "Telegram User"
        })
        .select()
        .single();

    if (newUserError || !newUser) {

      return NextResponse.json(
        {
          ok:false,
          error:"USER_CREATE_FAILED"
        },
        { status:500 }
      );

    }

    return NextResponse.json({
      ok:true,
      user:newUser
    });

  } catch (e) {

    console.log(
      "AUTH ERROR:",
      e
    );

    return NextResponse.json(
      { ok:false },
      { status:500 }
    );

  }

}