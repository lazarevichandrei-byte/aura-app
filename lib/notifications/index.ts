import { NotificationPayload } from "./types";
import { NotificationTemplates } from "./templates";
import { getTelegramInitData } from "../telegram-init-data";

export async function sendNotification(
  payload: NotificationPayload
) {

  const initData = await getTelegramInitData();
  if(!initData) return {ok:false,skipped:true};

  const template =
    NotificationTemplates[payload.type];

  const response = await fetch(
    "/api/telegram/send",
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({

  userId: payload.userId,

  initData,

  type: payload.type,

  title:
    payload.title ??
    template.title,

  text:
    payload.text ??
    template.text,

  button:
    payload.buttonText ??
    template.button,

  chatId:payload.chatId
  ,entityId:payload.data?.entityId

})
    }
  );

  const result =
    await response.json();

  if (!response.ok) {

    throw new Error(
      JSON.stringify(result)
    );

  }

  return result;

}
