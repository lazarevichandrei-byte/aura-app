"use client";
import {useI18n} from "../I18nProvider";
import type {TranslationKey} from "../../lib/i18n/dictionary";

type Props = {
  value: {
    id: string;
    translationKey: string;
    icon: string;
  } | null;
  onClick: () => void;
};

export default function CategoryPicker({
  value,
  onClick,
}: Props) {
  const {t}=useI18n();
  return (
    <div
      onClick={onClick}
      style={{
        height: 58,
        borderRadius: 18,
        background: "var(--surface)",
        color:"var(--text-primary)",
        border:"1px solid var(--border-subtle)",
        padding: "0 18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        cursor: "pointer",
        boxShadow: "0 2px 8px rgba(0,0,0,.04)",
        transition: ".2s",
      }}
    >
      <div>

        <div
          style={{
            fontSize: 12,
            color: "var(--text-secondary)",
            marginBottom: 3,
          }}
        >
          {t("category.label")}
        </div>

        <div
          style={{
            fontWeight: 600,
            fontSize: 16,
          }}
        >
          {value
            ? `${value.icon} ${t(value.translationKey as TranslationKey)}`
            : t("category.choose")}
        </div>

      </div>

    </div>
  );
}
