import { sendNotification } from "./index";
import { NotificationType } from "../constants/notificationTypes";

export async function sendMessageNotification(
  userId: string,
  senderName: string,
  message: string
) {

  return await sendNotification({

    userId,

    type: NotificationType.MESSAGE,

    text: `${senderName}:\n${message}`

  });

}