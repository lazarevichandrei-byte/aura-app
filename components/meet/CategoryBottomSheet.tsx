"use client";

import { useEffect, useState } from "react";
import { MEET_CATEGORIES } from "../../lib/meet/categories";

type Props = {
  open: boolean;
  onClose: () => void;
  value: string;
  onSelect: (id: string) => void;
};

export default function CategoryBottomSheet({ open, onClose, value, onSelect }: Props) {
  const [rendered, setRendered] = useState(open);
  const [closing, setClosing] = useState(false);

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
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!rendered) return null;

  return (
    <div style={overlayStyle} role="dialog" aria-modal="true" aria-label="Выберите категорию">
      <style>{`@keyframes meetBackdropIn{from{opacity:0}to{opacity:1}}@keyframes meetBackdropOut{from{opacity:1}to{opacity:0}}@keyframes meetSheetIn{from{transform:translateY(100%)}to{transform:translateY(0)}}@keyframes meetSheetOut{from{transform:translateY(0)}to{transform:translateY(100%)}}`}</style>
      <button aria-label="Закрыть" onClick={onClose} style={{...backdropStyle,animation:closing?"meetBackdropOut .24s ease both":"meetBackdropIn .24s ease both"}} />
      <div style={{...sheetStyle,animation:closing?"meetSheetOut .24s ease-in both":"meetSheetIn .26s ease-out both"}}>
        <div style={handleStyle} />
        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 18 }}>
          Выберите категорию
        </div>
        <div style={gridStyle}>
          {MEET_CATEGORIES.map((item) => {
            const selected = value === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.id)}
                style={{
                  ...categoryStyle,
                  color: selected ? "#1D63D8" : "#20242C",
                  background: selected ? "#EAF2FF" : "#F7F8FA",
                  borderColor: selected ? "#2F80FF" : "transparent",
                }}
              >
                <span style={{ fontSize: 25, lineHeight: 1 }}>{item.icon}</span>
                <span style={{ fontSize: 12, fontWeight: selected ? 700 : 600 }}>
                  {item.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed" as const,
  inset: 0,
  zIndex: 10000,
  display: "flex",
  alignItems: "flex-end",
};

const backdropStyle = {
  position: "absolute" as const,
  inset: 0,
  border: 0,
  padding: 0,
  background: "rgba(15,23,42,.46)",
};

const sheetStyle = {
  position: "relative" as const,
  width: "100%",
  height: "min(68dvh, 620px)",
  boxSizing: "border-box" as const,
  borderRadius: "26px 26px 0 0",
  padding: "10px 18px calc(18px + env(safe-area-inset-bottom, 0px))",
  background: "#fff",
  overflow: "hidden",
};

const handleStyle = {
  width: 42,
  height: 4,
  borderRadius: 4,
  background: "#D7DCE4",
  margin: "0 auto 18px",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 9,
  maxHeight: "calc(100% - 55px)",
  overflowY: "auto" as const,
  overscrollBehavior: "contain" as const,
  paddingBottom: 8,
};

const categoryStyle = {
  minHeight: 76,
  border: "1px solid transparent",
  borderRadius: 16,
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  cursor: "pointer",
};
