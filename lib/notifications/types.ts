import { NotificationType } from "../constants/notificationTypes";

export interface NotificationPayload {

  userId: string;

  type: NotificationType;

  title?: string;

text?: string;

  buttonText?: string;

  imageUrl?: string;

  senderName?: string;

  senderAvatar?: string;

  senderId?: string;

  chatId?: string;

  data?: Record<string, any>;

}