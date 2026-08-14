export type MeetDuration = "30m" | "1h" | "2h" | "day";

const pad = (part: number) => String(part).padStart(2, "0");

export function localMeetDateTime(date: string, time: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return null;
  const [year, month, day] = date.split("-").map(Number);
  const [hours, minutes] = time.split(":").map(Number);
  const value = new Date(year, month - 1, day, hours, minutes, 0, 0);
  if (
    value.getFullYear() !== year || value.getMonth() !== month - 1 || value.getDate() !== day ||
    value.getHours() !== hours || value.getMinutes() !== minutes
  ) return null;
  return value;
}

export function localMeetDateTimeToIso(date: string, time: string) {
  return localMeetDateTime(date, time)?.toISOString() ?? null;
}

export function meetIsoToLocalInputs(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { date: "", time: "" };
  return {
    date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    time: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  };
}

export function localToday() {
  return meetIsoToLocalInputs(new Date().toISOString()).date;
}

export function calculateMeetExpiration(startsAt: string, duration: MeetDuration) {
  const start = new Date(startsAt);
  const expires = new Date(start);
  if (duration === "30m") expires.setMinutes(expires.getMinutes() + 30);
  if (duration === "1h") expires.setHours(expires.getHours() + 1);
  if (duration === "2h") expires.setHours(expires.getHours() + 2);
  if (duration === "day") expires.setHours(23, 59, 59, 999);
  return expires.toISOString();
}

export function meetEndLocal(date: string, time: string, duration: MeetDuration) {
  const start = localMeetDateTime(date, time);
  if (!start) return null;
  return new Date(calculateMeetExpiration(start.toISOString(), duration));
}

export function formatMeetEndText(date: string, time: string, duration: MeetDuration) {
  const start = localMeetDateTime(date, time);
  const end = meetEndLocal(date, time, duration);
  if (!start || !end) return "";
  const endTime = `${pad(end.getHours())}:${pad(end.getMinutes())}`;
  if (start.toDateString() === end.toDateString()) return `Закончится в ${endTime}`;
  const endDate = end.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
  return `Закончится ${endDate} в ${endTime}`;
}

export function nextMeetTimeSuggestion(now = new Date()) {
  const suggestion = new Date(now);
  suggestion.setSeconds(0, 0);
  suggestion.setMinutes(Math.ceil(suggestion.getMinutes() / 5) * 5);
  if (suggestion.getTime() < now.getTime() + 5 * 60000) {
    suggestion.setMinutes(suggestion.getMinutes() + 5);
  }
  return {
    date: `${suggestion.getFullYear()}-${pad(suggestion.getMonth() + 1)}-${pad(suggestion.getDate())}`,
    time: `${pad(suggestion.getHours())}:${pad(suggestion.getMinutes())}`,
  };
}

export function isMeetStartSafelyFuture(startsAt: string, bufferMinutes = 5) {
  const start = new Date(startsAt).getTime();
  return Number.isFinite(start) && start >= Date.now() + bufferMinutes * 60000;
}

function compactTimeLeft(milliseconds: number) {
  const totalMinutes = Math.max(1, Math.ceil(milliseconds / 60000));
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days} д${hours > 0 ? ` ${hours} ч` : ""}`;
  if (hours > 0) return `${hours} ч${minutes > 0 ? ` ${minutes} мин` : ""}`;
  return `${minutes} мин`;
}

export function meetCountdown(startsAt: string, expiresAt: string | null, now = Date.now()) {
  const start = new Date(startsAt).getTime();
  const end = expiresAt ? new Date(expiresAt).getTime() : Number.NaN;
  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    return { text: "Время не указано", urgent: false, phase: "invalid" as const };
  }
  if (now < start) {
    return { text: `До встречи: ${compactTimeLeft(start - now)}`, urgent: false, phase: "before" as const };
  }
  if (now < end) {
    const milliseconds = end - now;
    return { text: `До окончания: ${compactTimeLeft(milliseconds)}`, urgent: milliseconds <= 10 * 60000, phase: "active" as const };
  }
  return { text: "Встреча завершена", urgent: true, phase: "ended" as const };
}
