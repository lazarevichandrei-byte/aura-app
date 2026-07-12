export async function sendTelegramNotification(
  telegramId: number,
  text: string
) {

  try {

    const res = await fetch(
      "/api/telegram/send",
      {

        method: "POST",

        headers: {
          "Content-Type":"application/json"
        },

        body: JSON.stringify({

          telegramId,

          text

        })

      }
    );

    return await res.json();

  } catch (e) {

    console.error(
      "Telegram notification error:",
      e
    );

  }

}