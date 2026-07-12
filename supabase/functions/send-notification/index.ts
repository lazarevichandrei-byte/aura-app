import { serve } from "https://deno.land/std/http/server.ts";

serve(async (req) => {

  try {

    const {
      telegramId,
      text
    } = await req.json();

    const token =
      Deno.env.get("BOT_TOKEN");

    if (!token) {

      return new Response(

        JSON.stringify({
          error:"BOT_TOKEN not found"
        }),

        {
          status:500
        }

      );

    }

    const telegramRes =
      await fetch(

        `https://api.telegram.org/bot${token}/sendMessage`,

        {

          method:"POST",

          headers:{
            "Content-Type":"application/json"
          },

          body:JSON.stringify({

            chat_id:telegramId,

            text

          })

        }

      );

    const result =
      await telegramRes.json();

    return Response.json(result);

  } catch(e){

    return new Response(

      JSON.stringify(e),

      {
        status:500
      }

    );

  }

});