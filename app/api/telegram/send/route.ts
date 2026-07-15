import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {


  console.log("========== TELEGRAM API ==========");
  try {

    const {
      userId,
      title,
      text,
      button
    } = await req.json();

    console.log("BODY:", {
  userId,
  title,
  text,
  button
});

    const token =
      process.env.TELEGRAM_BOT_TOKEN;

    if (!token) {

      return NextResponse.json(
        {
          error: "No bot token"
        },
        {
          status: 500
        }
      );

    }

    const { data: user } =
    
      await supabase
        .from("users")
        .select("telegram_id")
        .eq("id", userId)
        .single();

    if (!user?.telegram_id) {

      return NextResponse.json(
        {
          error: "Telegram ID not found"
        },
        {
          status: 404
        }
      );

    }

    const message = title
      ? `${title}\n\n${text}`
      : text;

    const response = await fetch(

      `https://api.telegram.org/bot${token}/sendMessage`,

      {

        method: "POST",

        headers: {
          "Content-Type":"application/json"
        },

        body: JSON.stringify({

          chat_id: user.telegram_id,

          text: message,

          parse_mode: "Markdown",

          reply_markup: {

            inline_keyboard: [

              [

                {

                  text:
                    button ||
                    "🚀 Открыть AURA",

                  url: "https://t.me/Datingaurabot"

                }

              ]

            ]

          }

        })

      }

    );

    const result = await response.json();
    console.log("TELEGRAM RESULT:", result);

console.log("========== TELEGRAM ==========");
console.log("User ID:", userId);
console.log("Telegram ID:", user.telegram_id);
console.log("Response:", result);
console.log("==============================");

return NextResponse.json(result);

  } catch(e){

    return NextResponse.json(

      {
        error: String(e)
      },

      {
        status:500
      }

    );

  }

}