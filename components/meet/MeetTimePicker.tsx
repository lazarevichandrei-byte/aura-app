"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {useI18n} from "../I18nProvider";

type Props = {
  open: boolean;
  value: string;
  onClose: () => void;
  onChange: (value: string) => void;
};

const HOURS = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, "0"));
const MINUTES = Array.from({ length: 12 }, (_, index) => String(index * 5).padStart(2, "0"));
const ITEM_HEIGHT = 46;

export default function MeetTimePicker({ open, value, onClose, onChange }: Props) {
  const {t}=useI18n();
  const [rendered, setRendered] = useState(open);
  const [closing, setClosing] = useState(false);
  const [hour, setHour] = useState("12");
  const [minute, setMinute] = useState("00");
  const hoursRef = useRef<HTMLDivElement>(null);
  const minutesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setRendered(true);
      setClosing(false);
      return;
    }
    if (!rendered) return;
    setClosing(true);
    const timer = window.setTimeout(() => {
      setRendered(false);
      setClosing(false);
    }, 240);
    return () => window.clearTimeout(timer);
  }, [open, rendered]);

  useEffect(() => {
    if (!open) return;
    const [nextHour = "12", rawMinute = "00"] = value.split(":");
    const roundedMinute = String(Math.min(55, Math.round(Number(rawMinute) / 5) * 5)).padStart(2, "0");
    setHour(nextHour);
    setMinute(roundedMinute);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => {
      hoursRef.current?.scrollTo({ top: HOURS.indexOf(nextHour) * ITEM_HEIGHT });
      minutesRef.current?.scrollTo({ top: MINUTES.indexOf(roundedMinute) * ITEM_HEIGHT });
    });
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open, value]);

  if (!rendered) return null;

  const wheel = (
    items: string[],
    selected: string,
    select: (value: string) => void,
    ref: React.RefObject<HTMLDivElement | null>
  ) => (
    <div
      ref={ref}
      onScroll={(event) => {
        const index = Math.max(0, Math.min(items.length - 1, Math.round(event.currentTarget.scrollTop / ITEM_HEIGHT)));
        select(items[index]);
      }}
      style={wheelStyle}
    >
      <div style={{ height: ITEM_HEIGHT * 2 }} />
      {items.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => {
            select(item);
            ref.current?.scrollTo({ top: items.indexOf(item) * ITEM_HEIGHT, behavior: "smooth" });
          }}
          style={{ ...wheelItemStyle, color: selected === item ? "var(--primary)" : "var(--text-secondary)", fontWeight: selected === item ? 750 : 500 }}
        >
          {item}
        </button>
      ))}
      <div style={{ height: ITEM_HEIGHT * 2 }} />
    </div>
  );

  if (typeof document === "undefined") return null;

  return createPortal(
    <div style={timeOverlayStyle} role="dialog" aria-modal="true" aria-label={t("meet.timeDialog")}>
      <style>{`@keyframes meetBackdropIn{from{opacity:0}to{opacity:1}}@keyframes meetBackdropOut{from{opacity:1}to{opacity:0}}@keyframes meetSheetIn{from{transform:translateY(100%)}to{transform:translateY(0)}}@keyframes meetSheetOut{from{transform:translateY(0)}to{transform:translateY(100%)}}`}</style>
      <button aria-label={t("common.close")} onClick={onClose} style={{...timeBackdropStyle,animation:closing?"meetBackdropOut .24s ease both":"meetBackdropIn .24s ease both"}} />
      <div style={{...timeSheetStyle,animation:closing?"meetSheetOut .24s ease-in both":"meetSheetIn .26s ease-out both"}}>
        <div style={timeHandleStyle} />
        <div style={{ fontSize: 20, fontWeight: 700 }}>{t("meet.timeDialog")}</div>
        <div style={pickerStyle}>
          <div style={selectionStyle} />
          {wheel(HOURS, hour, setHour, hoursRef)}
          <div style={{ fontSize: 24, fontWeight: 700, zIndex: 2 }}>:</div>
          {wheel(MINUTES, minute, setMinute, minutesRef)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <button type="button" onClick={onClose} style={cancelStyle}>{t("common.cancel")}</button>
          <button type="button" onClick={() => { onChange(`${hour}:${minute}`); onClose(); }} style={doneStyle}>{t("common.done")}</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

const timeOverlayStyle = { position: "fixed" as const, inset: 0, zIndex: 10000, display: "flex", alignItems: "flex-end" };
const timeBackdropStyle = { position: "absolute" as const, inset: 0, border: 0, background: "var(--overlay)" };
const timeSheetStyle = { position: "relative" as const, width: "100%", height: "min(58dvh, 500px)", boxSizing: "border-box" as const, borderRadius: "26px 26px 0 0", padding: "10px 20px calc(18px + env(safe-area-inset-bottom, 0px))", background: "var(--sheet-bg)", color:"var(--text-primary)" };
const timeHandleStyle = { width: 42, height: 4, borderRadius: 4, background: "var(--border)", margin: "0 auto 18px" };
const pickerStyle = { position: "relative" as const, height: ITEM_HEIGHT * 5, display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", gap: 8, margin: "18px 0" };
const selectionStyle = { position: "absolute" as const, left: 10, right: 10, top: ITEM_HEIGHT * 2, height: ITEM_HEIGHT, borderRadius: 14, background: "var(--primary-soft)", pointerEvents: "none" as const };
const wheelStyle = { height: ITEM_HEIGHT * 5, overflowY: "auto" as const, scrollSnapType: "y mandatory" as const, overscrollBehavior: "contain" as const, scrollbarWidth: "none" as const, zIndex: 1 };
const wheelItemStyle = { width: "100%", height: ITEM_HEIGHT, border: 0, background: "transparent", fontSize: 22, scrollSnapAlign: "center" as const };
const cancelStyle = { height: 50, border: 0, borderRadius: 15, background: "var(--surface-secondary)", color: "var(--text-primary)", fontWeight: 700, fontSize: 15 };
const doneStyle = { ...cancelStyle, background: "var(--primary)", color: "var(--text-inverse)" };
