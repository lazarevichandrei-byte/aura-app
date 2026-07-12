import { NotificationType } from "../constants/notificationTypes";

export const NotificationTemplates = {

  [NotificationType.LIKE]: {

    title: "❤️ Вам поставили лайк!",

    text:
      "Кто-то заинтересовался вашим профилем.\n\nОткройте AURA и узнайте кто 😉",

    button: "❤️ Посмотреть"

  },

  [NotificationType.MATCH]: {

    title: "💙 Новый MATCH!",

    text:
      "У вас взаимная симпатия ❤️\n\nСамое время начать общение.",

    button: "💬 Открыть чат"

  },

  [NotificationType.MESSAGE]: {

    title: "💬 Новое сообщение",

    text:
      "У вас новое сообщение в AURA.",

    button: "📨 Ответить"

  },

  [NotificationType.NEWS]: {

    title: "📢 Новости AURA",

    text:
      "Вышло новое обновление приложения.",

    button: "🚀 Открыть"

  },

  [NotificationType.SYSTEM]: {

    title: "🔔 AURA",

    text:
      "Новое системное уведомление.",

    button: "🚀 Открыть"

  }

} as const;