export const NotificationType = {

  LIKE: "like",

  MATCH: "match",

  MESSAGE: "message",

  NEWS: "news",

  SYSTEM: "system"

} as const;

export type NotificationType =
  typeof NotificationType[
    keyof typeof NotificationType
  ];