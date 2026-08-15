export function formatMeetDate(date: string, locale = "en-US") {

  return new Date(date).toLocaleDateString(
    locale,
    {
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit"
    }
  );

}
