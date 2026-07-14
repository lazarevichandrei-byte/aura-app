import { NotificationPayload } from "./types";
import { NotificationTemplates } from "./templates";

export async function sendNotification(
  payload: NotificationPayload
) {

  console.log("SEND NOTIFICATION:", payload);

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

  console.log("FETCH STATUS:", response.status);

  const result =
    await response.json();

  console.log("FETCH RESULT:", result);

  if (!response.ok) {

    throw new Error(
      JSON.stringify(result)
    );

  }

  return result;

}