"use client";

import { useRouter } from "next/navigation";

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

        <button
          onClick={() => router.back()}
          style={{
            border: "none",
            background: "transparent",
            fontSize: 16,
            marginBottom: 20
          }}
        >
          ← Назад
        </button>

        <h2>Настройки</h2>

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