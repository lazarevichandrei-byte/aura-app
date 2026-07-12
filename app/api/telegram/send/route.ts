import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {

  try {

    const { userId, text } = await req.json();

    const token =
      process.env.TELEGRAM_BOT_TOKEN;

    if (!token) {
      return NextResponse.json(
        { error: "No bot token" },
        { status: 500 }
      );
    }

    const { data: user } = await supabase
      .from("users")
      .select("telegram_id")
      .eq("id", userId)
      .single();

    if (!user?.telegram_id) {
      return NextResponse.json(
        { error: "Telegram ID not found" },
        { status: 404 }
      );
    }

    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chat_id: user.telegram_id,
          text
        })
      }
    );

    const result = await response.json();

    return NextResponse.json(result);

  } catch (e) {

    return NextResponse.json(
      { error: String(e) },
      { status: 500 }
    );

  }

}