async function send(
  telegramId: number,
  text: string
) {

  try {

    const res = await fetch(
      "/api/telegram/send",
      {

        method:"POST",

        headers:{
          "Content-Type":"application/json"
        },

        body:JSON.stringify({

          telegramId,

          text

        })

      }
    );

    return await res.json();

  } catch(e){

    console.error(e);

  }

}

export function sendTelegramNotification(
  telegramId:number,
  text:string
){

  return send(
    telegramId,
    text
  );

}

export function sendLikeNotification(
  telegramId:number
){

  return send(

    telegramId,

`❤️ Вам поставили лайк

Откройте AURA, чтобы посмотреть кто 😉`

  );

}

export function sendMatchNotification(
  telegramId:number
){

  return send(

    telegramId,

`💙 У вас новое совпадение!

Теперь можно начать общение ✨`

  );

}

export function sendMessageNotification(

  telegramId:number,

  sender:string

){

  return send(

    telegramId,

`💬 Новое сообщение

${sender} написал вам.`

  );

}

export function sendNewsNotification(

  telegramId:number,

  text:string

){

  return send(

    telegramId,

`📢 Новости AURA

${text}`

  );

}