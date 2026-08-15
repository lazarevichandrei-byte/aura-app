"use client";

import type { ReactNode } from "react";

type Props = {
  onLocation: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
};

export default function MapControls({ onLocation, onZoomIn, onZoomOut }: Props) {
  return (
    <div style={containerStyle}>
      <CircleButton onClick={onLocation} ariaLabel="Моя геолокация" separate>◎</CircleButton>
      <div style={zoomGroupStyle}>
        <CircleButton onClick={onZoomIn} ariaLabel="Приблизить карту">＋</CircleButton>
        <div style={dividerStyle} />
        <CircleButton onClick={onZoomOut} ariaLabel="Отдалить карту">－</CircleButton>
      </div>
    </div>
  );
}

function CircleButton({ children, onClick, ariaLabel, separate = false }: {
  children: ReactNode;
  onClick: () => void;
  ariaLabel: string;
  separate?: boolean;
}) {
  return (
    <button type="button" aria-label={ariaLabel} onClick={onClick} style={{ ...buttonStyle, borderRadius: separate ? 24 : 0 }}>
      {children}
    </button>
  );
}

const containerStyle = {
  position: "absolute" as const,
  right: 16,
  bottom: "calc(var(--aura-map-card-clearance, var(--aura-bottom-nav-height, 74px)) + 12px + env(safe-area-inset-bottom, 0px))",
  display: "flex",
  flexDirection: "column" as const,
  gap: 10,
  zIndex: 30,
  alignItems: "center",
};

const zoomGroupStyle = {
  overflow: "hidden",
  borderRadius: 24,
  background: "var(--nav-bg)",
  boxShadow: "var(--shadow-md)",
};

const buttonStyle = {
  width: 48,
  height: 48,
  border: "1px solid var(--border)",
  padding: 0,
  background: "var(--nav-bg)",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
  display: "grid",
  placeItems: "center",
  color: "var(--primary)",
  fontSize: 22,
  fontWeight: 700,
  cursor: "pointer",
  touchAction: "manipulation",
};

const dividerStyle = { height: 1, margin: "0 8px", background: "var(--border)" };
