"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "../I18nProvider";

type Props = {
  open: boolean;
  value: string;
  min: string;
  onClose: () => void;
  onChange: (value: string) => void;
};

const pad = (value: number) => String(value).padStart(2, "0");
const toValue = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

function parseLocalDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return Number.isFinite(date.getTime()) ? date : null;
}

export default function MeetDatePicker({ open, value, min, onClose, onChange }: Props) {
  const { t, intlLocale } = useI18n();
  const minimumDate = useMemo(() => parseLocalDate(min) ?? new Date(), [min]);
  const selectedDate = useMemo(() => parseLocalDate(value), [value]);
  const [visibleMonth, setVisibleMonth] = useState(() => selectedDate ?? minimumDate);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [minimumDate, open]);

  const calendarDays = useMemo(() => {
    const first = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
    const gridStart = new Date(first);
    const mondayIndex = (first.getDay() + 6) % 7;
    gridStart.setDate(first.getDate() - mondayIndex);
    return Array.from({ length: 42 }, (_, index) => {
      const day = new Date(gridStart);
      day.setDate(gridStart.getDate() + index);
      return day;
    });
  }, [visibleMonth]);

  const weekDays = useMemo(() => {
    const monday = new Date(2024, 0, 1);
    return Array.from({ length: 7 }, (_, index) => {
      const day = new Date(monday);
      day.setDate(monday.getDate() + index);
      return new Intl.DateTimeFormat(intlLocale, { weekday: "short" }).format(day);
    });
  }, [intlLocale]);

  if (!open || typeof document === "undefined") return null;

  const previousMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1);
  const previousMonthAllowed = previousMonth.getFullYear() > minimumDate.getFullYear()
    || (previousMonth.getFullYear() === minimumDate.getFullYear() && previousMonth.getMonth() >= minimumDate.getMonth());

  return createPortal(
    <div style={overlayStyle} role="dialog" aria-modal="true" aria-label={t("meet.date")}>
      <button type="button" aria-label={t("common.close")} onClick={onClose} style={backdropStyle} />
      <div style={sheetStyle}>
        <div style={handleStyle} />
        <div style={monthHeaderStyle}>
          <button
            type="button"
            disabled={!previousMonthAllowed}
            onClick={() => setVisibleMonth(previousMonth)}
            style={navigationButtonStyle}
            aria-label={new Intl.DateTimeFormat(intlLocale, { month: "long", year: "numeric" }).format(previousMonth)}
          >
            ‹
          </button>
          <div style={{ fontSize: 18, fontWeight: 750 }}>
            {new Intl.DateTimeFormat(intlLocale, { month: "long", year: "numeric" }).format(visibleMonth)}
          </div>
          <button
            type="button"
            onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1))}
            style={navigationButtonStyle}
            aria-label={new Intl.DateTimeFormat(intlLocale, { month: "long", year: "numeric" }).format(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1))}
          >
            ›
          </button>
        </div>
        <div style={calendarGridStyle}>
          {weekDays.map((day) => <div key={day} style={weekDayStyle}>{day}</div>)}
          {calendarDays.map((day) => {
            const dayValue = toValue(day);
            const disabled = dayValue < min;
            const selected = dayValue === value;
            const outsideMonth = day.getMonth() !== visibleMonth.getMonth();
            return (
              <button
                key={dayValue}
                type="button"
                disabled={disabled}
                onClick={() => {
                  onChange(dayValue);
                  onClose();
                }}
                style={{
                  ...dayStyle,
                  background: selected ? "var(--brand-gradient)" : "transparent",
                  color: selected
                    ? "var(--text-inverse)"
                    : disabled
                      ? "var(--text-muted)"
                      : outsideMonth
                        ? "var(--text-secondary)"
                        : "var(--text-primary)",
                  opacity: disabled ? 0.42 : outsideMonth ? 0.62 : 1,
                }}
                aria-pressed={selected}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
        <button type="button" onClick={onClose} style={doneStyle}>{t("common.done")}</button>
      </div>
    </div>,
    document.body
  );
}

const overlayStyle = { position: "fixed" as const, inset: 0, zIndex: 10000, display: "flex", alignItems: "flex-end" };
const backdropStyle = { position: "absolute" as const, inset: 0, border: 0, background: "var(--overlay)" };
const sheetStyle = { position: "relative" as const, width: "100%", boxSizing: "border-box" as const, borderRadius: "26px 26px 0 0", padding: "10px 18px calc(18px + env(safe-area-inset-bottom, 0px))", background: "var(--sheet-bg)", color: "var(--text-primary)", boxShadow: "var(--shadow-md)" };
const handleStyle = { width: 42, height: 4, borderRadius: 4, background: "var(--border)", margin: "0 auto 14px" };
const monthHeaderStyle = { display: "grid", gridTemplateColumns: "44px 1fr 44px", alignItems: "center", textAlign: "center" as const, marginBottom: 12 };
const navigationButtonStyle = { width: 40, height: 40, borderRadius: "50%", background: "var(--surface-secondary)", color: "var(--text-primary)", fontSize: 28, lineHeight: 1 };
const calendarGridStyle = { display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 4 };
const weekDayStyle = { height: 28, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)", fontSize: 12, fontWeight: 650, textTransform: "capitalize" as const };
const dayStyle = { aspectRatio: "1", minHeight: 38, borderRadius: 13, fontSize: 15, fontWeight: 650 };
const doneStyle = { width: "100%", height: 50, marginTop: 14, borderRadius: 15, background: "var(--brand-gradient)", color: "var(--text-inverse)", fontWeight: 700, fontSize: 15 };
