import { NextResponse } from "next/server";

export async function POST(req: Request) {

  try {

    const { telegramId, text } = await req.json();

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

    const response = await fetch(

      `https://api.telegram.org/bot${token}/sendMessage`,

      {
        method: "POST",

        headers: {
          "Content-Type":"application/json"
        },

        body: JSON.stringify({

          chat_id: telegramId,

          text

        })

      }

    );

    const result = await response.json();

    return NextResponse.json(result);

  } catch (e) {

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