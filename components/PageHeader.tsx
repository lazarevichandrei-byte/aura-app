"use client";

import { ArrowLeft2 } from "iconsax-react";
import {useI18n} from "./I18nProvider";

type Props = {
  title: string;
  onBack: () => void;
};

export default function PageHeader({ title, onBack }: Props) {
  const {t}=useI18n();
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
        aria-label={t("common.backAria")}
        onClick={onBack}
        style={{
          width: 40,
          height: 40,
          display: "grid",
          placeItems: "center",
          borderRadius: "50%",
          background: "var(--surface)",
          color: "var(--primary)",
          border:"1px solid var(--border-subtle)",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        <ArrowLeft2 size="24" color="currentColor" variant="Outline" />
      </button>

      <h1
        style={{
          margin: 0,
          color: "var(--text-primary)",
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
