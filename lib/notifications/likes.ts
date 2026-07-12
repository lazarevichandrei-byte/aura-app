import { sendNotification } from "./index";
import { NotificationType } from "../constants/notificationTypes";

export async function sendLikeNotification(
  userId: string
) {

  return await sendNotification({

    userId,

    type: NotificationType.LIKE

  });

}