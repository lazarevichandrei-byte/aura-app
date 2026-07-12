import { sendNotification } from "./index";
import { NotificationType } from "../constants/notificationTypes";

export async function sendMatchNotification(
  userId: string
) {

  return await sendNotification({

    userId,

    type: NotificationType.MATCH

  });

}