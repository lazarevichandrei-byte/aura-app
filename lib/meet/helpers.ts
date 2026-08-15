export function formatMeetDate(date: string, locale: string) {

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
