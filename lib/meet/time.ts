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

export function formatMeetEndText(date: string, time: string, duration: MeetDuration, locale:string, copy:{endsAt:(time:string)=>string;endsOn:(date:string)=>string}) {
  const start = localMeetDateTime(date, time);
  const end = meetEndLocal(date, time, duration);
  if (!start || !end) return "";
  const endTime = new Intl.DateTimeFormat(locale,{hour:"2-digit",minute:"2-digit"}).format(end);
  if (start.toDateString() === end.toDateString()) return copy.endsAt(endTime);
  const endDate = new Intl.DateTimeFormat(locale,{day:"numeric",month:"long",hour:"2-digit",minute:"2-digit"}).format(end);
  return copy.endsOn(endDate);
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

function compactTimeLeft(milliseconds: number,locale:string) {
  const totalMinutes = Math.max(1, Math.ceil(milliseconds / 60000));
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  const format=(value:number,unit:Intl.NumberFormatOptions["unit"])=>new Intl.NumberFormat(locale,{style:"unit",unit,unitDisplay:"narrow"}).format(value);
  if (days > 0) return `${format(days,"day")}${hours > 0 ? ` ${format(hours,"hour")}` : ""}`;
  if (hours > 0) return `${format(hours,"hour")}${minutes > 0 ? ` ${format(minutes,"minute")}` : ""}`;
  return format(minutes,"minute");
}

export function meetCountdown(startsAt: string, expiresAt: string | null, locale:string, copy:{missing:string;startsIn:(time:string)=>string;endsIn:(time:string)=>string;ended:string}, now = Date.now()) {
  const start = new Date(startsAt).getTime();
  const end = expiresAt ? new Date(expiresAt).getTime() : Number.NaN;
  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    return { text: copy.missing, urgent: false, phase: "invalid" as const };
  }
  if (now < start) {
    return { text: copy.startsIn(compactTimeLeft(start-now,locale)), urgent: false, phase: "before" as const };
  }
  if (now < end) {
    const milliseconds = end - now;
    return { text: copy.endsIn(compactTimeLeft(milliseconds,locale)), urgent: milliseconds <= 10 * 60000, phase: "active" as const };
  }
  return { text: copy.ended, urgent: true, phase: "ended" as const };
}
