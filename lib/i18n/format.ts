export function formatDateTime(
  value: Date | string | number,
  locale: string,
  options: Intl.DateTimeFormatOptions = {day:"numeric",month:"long",hour:"2-digit",minute:"2-digit"},
) {
  return new Intl.DateTimeFormat(locale, options).format(new Date(value));
}

export function formatNumber(value: number, locale: string, options?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat(locale, options).format(value);
}

export function formatRelativeTime(value: number, unit: Intl.RelativeTimeFormatUnit, locale: string) {
  return new Intl.RelativeTimeFormat(locale, {numeric:"auto"}).format(value, unit);
}

export function pluralCategory(value: number, locale: string) {
  return new Intl.PluralRules(locale).select(value);
}
