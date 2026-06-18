"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft2 } from "iconsax-react";

export default function SettingsPage() {
  const router = useRouter();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F5F7FB",
        padding: "20px"
      }}
    >
      <div
        style={{
          maxWidth: 420,
          margin: "0 auto"
        }}
      >

        <div
  style={{
    display: "flex",
    alignItems: "center",
    marginBottom: 24
  }}
>

  <div
    onClick={() => router.back()}
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      paddingRight: 10,
      cursor: "pointer"
    }}
  >
    <ArrowLeft2
      size="28"
      color="#2E7BFF"
      variant="Outline"
    />
  </div>

  <div
    style={{
      marginLeft: 14,
      fontSize: 24,
      fontWeight: 700
    }}
  >
    Настройки
  </div>

</div>

        <div style={itemStyle}>
          🎨 Тема
        </div>

        <div style={itemStyle}>
          🌍 Язык
        </div>

        <div style={itemStyle}>
          🚫 Чёрный список
        </div>

      </div>
    </div>
  );
}

const itemStyle = {
  background: "#fff",
  padding: "16px",
  borderRadius: 16,
  marginTop: 12,
  cursor: "pointer"
};