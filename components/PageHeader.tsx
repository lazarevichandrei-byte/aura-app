"use client";

import { ArrowLeft2 } from "iconsax-react";

type Props = {
  title: string;
  onBack: () => void;
};

export default function PageHeader({ title, onBack }: Props) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        minHeight: 40,
        marginBottom: 24,
      }}
    >
      <button
        type="button"
        aria-label="Назад"
        onClick={onBack}
        style={{
          width: 40,
          height: 40,
          display: "grid",
          placeItems: "center",
          borderRadius: "50%",
          background: "#fff",
          color: "#2F80FF",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        <ArrowLeft2 size="24" color="currentColor" variant="Outline" />
      </button>

      <h1
        style={{
          margin: 0,
          color: "#1F2937",
          fontSize: 24,
          fontWeight: 700,
          letterSpacing: "-0.3px",
        }}
      >
        {title}
      </h1>
    </header>
  );
}
