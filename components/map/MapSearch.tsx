"use client";
import {useI18n} from "../I18nProvider";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function MapSearch({
  value,
  onChange
}: Props) {
  const {t}=useI18n();

  return (

    <div
      style={{
        padding: "8px 16px 8px"
      }}
    >

      <div
        style={{
          height: 46,
          borderRadius: 16,
          background: "var(--surface-elevated)",
          color:"var(--text-primary)",
          border:"1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          padding: "0 14px",
          boxShadow: "0 6px 20px rgba(0,0,0,.06)"
        }}
      >

        <div
          style={{
            fontSize: 16,
            marginRight: 8
          }}
        >
          🔍
        </div>

        <input
          value={value}
          onChange={(e)=>onChange(e.target.value)}
          placeholder={t("map.searchPlaceholder")}
          style={{
            flex: 1,
            background: "transparent",
            fontSize: 14
          }}
        />

      </div>

    </div>

  );

}
