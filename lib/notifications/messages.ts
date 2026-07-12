import { sendNotification } from "./index";
import { NotificationType } from "../constants/notificationTypes";

export async function sendMessageNotification(
  userId: string,
  senderName: string,
  message: string
) {

  const preview =
    message.length > 80
      ? message.substring(0, 80) + "..."
      : message;

  return await sendNotification({

    userId,

    type: NotificationType.MESSAGE,

    title: "💬 Новое сообщение",

    text: `${senderName}:\n${preview}`,

    buttonText: "📨 Ответить"

  });

}