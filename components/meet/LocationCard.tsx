"use client";
import {useI18n} from "../I18nProvider";

type Props = {
  place: string;
  city: string;
  address?: string;
  onMapClick: () => void;
};

export default function LocationCard({
  place,
  city,
  address,
  onMapClick,
}: Props) {
  const {t}=useI18n();

  if (place) {

  return (

      <div
        onClick={() => {
          
          onMapClick();
        }}
        style={{
          background:"var(--surface)",
          color:"var(--text-primary)",
          border:"1px solid var(--border-subtle)",
          borderRadius:18,
          padding:16,
          cursor:"pointer",
          boxShadow:"0 4px 14px rgba(0,0,0,.05)"
        }}
      >

        <div
          style={{
            fontSize:13,
            color:"var(--text-secondary)"
          }}
        >
          📍 {t("map.meetLocation")}
        </div>

        <div
          style={{
            marginTop:8,
            fontSize:17,
            fontWeight:700
          }}
        >
          {place}
        </div>

        <div
          style={{
            marginTop:2,
            color:"var(--text-secondary)",
            fontSize:14
          }}
        >
          {address || city}
        </div>

      </div>

    );

  }

  return (

  <div
    onClick={onMapClick}
    style={{
      background: "var(--surface)",
      color:"var(--text-primary)",
      border:"1px solid var(--border-subtle)",
      borderRadius: 18,
      padding: 18,
      cursor: "pointer",
      boxShadow: "0 4px 14px rgba(0,0,0,.05)",
    }}
  >

    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >

      <div>

        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
          }}
        >
          🗺️ {t("map.open")}
        </div>

        <div
          style={{
            marginTop: 6,
            color: "var(--text-secondary)",
            fontSize: 14,
            lineHeight: 1.45,
          }}
        >
          {t("map.openHint")}
        </div>

      </div>

    </div>

  </div>

);

}
