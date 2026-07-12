import { sendNotification } from "./index";
import { NotificationType } from "../constants/notificationTypes";

export async function sendNewsNotification(
  userId: string,
  title?: string,
  text?: string
) {

  return await sendNotification({

    userId,

    type: NotificationType.NEWS,

    title,

    text

  });

}