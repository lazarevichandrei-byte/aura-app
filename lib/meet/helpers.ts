export function formatMeetDate(date: string) {

  return new Date(date).toLocaleDateString(
    "ru-RU",
    {
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit"
    }
  );

}