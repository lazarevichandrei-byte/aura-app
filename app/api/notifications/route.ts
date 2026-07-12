import { NextResponse } from "next/server";

export async function POST(req: Request) {

  try {

    const {

      userId,

      title,

      text,

      button

    } = await req.json();

    const response = await fetch(

      `${process.env.NEXT_PUBLIC_APP_URL}/api/telegram/send`,

      {

        method: "POST",

        headers: {

          "Content-Type":"application/json"

        },

        body: JSON.stringify({

          userId,

          title,

          text,

          button

        })

      }

    );

    const result =
      await response.json();

    return NextResponse.json(result);

  } catch(e){

    return NextResponse.json(

      {

        error:String(e)

      },

      {

        status:500

      }

    );

  }

}