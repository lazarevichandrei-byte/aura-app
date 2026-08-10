export function localMeetDateTimeToIso(date: string, time: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return null;
  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);
  const value = new Date(year, month - 1, day, hours, minutes, 0, 0);
  if (
    value.getFullYear() !== year || value.getMonth() !== month - 1 || value.getDate() !== day ||
    value.getHours() !== hours || value.getMinutes() !== minutes
  ) return null;
  return value.toISOString();
}

export function meetIsoToLocalInputs(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { date: "", time: "" };
  const pad = (part: number) => String(part).padStart(2, "0");
  return {
    date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    time: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  };
}

export function localToday() {
  return meetIsoToLocalInputs(new Date().toISOString()).date;
}

export function calculateMeetExpiration(startsAt: string, duration: "30m" | "1h" | "2h" | "day") {
  const start = new Date(startsAt);
  const expires = new Date(start);
  if (duration === "30m") expires.setMinutes(expires.getMinutes() + 30);
  if (duration === "1h") expires.setHours(expires.getHours() + 1);
  if (duration === "2h") expires.setHours(expires.getHours() + 2);
  if (duration === "day") expires.setHours(23, 59, 59, 999);
  return expires.toISOString();
}
