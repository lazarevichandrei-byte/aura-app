import { NotificationPayload } from "./types";
import { NotificationTemplates } from "./templates";

export async function sendNotification(
  payload: NotificationPayload
) {

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

        title:
          payload.title ??
          template.title,

        text:
          payload.text ??
          template.text,

        button:
          payload.buttonText ??
          template.button

      })

    }
  );

  if (!response.ok) {

    throw new Error(
      "Notification send failed"
    );

  }

  return await response.json();

}