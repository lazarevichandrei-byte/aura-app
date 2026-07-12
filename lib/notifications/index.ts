import { NotificationPayload } from "./types";
import { NotificationTemplates } from "./templates";
import { NotificationType } from "../constants/notificationTypes";

export async function sendNotification(
  payload: NotificationPayload
) {

  const template =
    NotificationTemplates[payload.type];

  if (!template) {
    throw new Error(
      "Unknown notification type"
    );
  }

  const title =
    payload.title || template.title;

  const text =
    payload.text || template.text;

  const button =
    payload.buttonText || template.button;

  const response = await fetch(
    "/api/notifications",
    {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({

        userId: payload.userId,

        type: payload.type,

        title,

        text,

        button

      })

    }
  );

  return await response.json();

}

export { NotificationType };