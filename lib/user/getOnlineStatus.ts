export function getOnlineStatus(user: {
  show_online?: boolean | null;
  show_last_seen?: boolean | null;
  last_seen?: string | null;
}) {
  if (
    user.show_online &&
    user.last_seen &&
    Date.now() - new Date(user.last_seen).getTime() < 30000
  ) {
    return {
      text: "Онлайн",
      color: "#10B981",
    };
  }

  if (
    user.show_last_seen &&
    user.last_seen
  ) {
    return {
      text: `Был ${new Date(user.last_seen).toLocaleTimeString(
        "ru-RU",
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      )}`,
      color: "#9CA3AF",
    };
  }

  return {
    text: "",
    color: "#9CA3AF",
  };
}