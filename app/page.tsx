"use client";

import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;

    if (tg) {
      tg.ready();
      tg.expand();

      // фикс Telegram темы
      tg.setBackgroundColor("#0B0B0F");
      tg.setHeaderColor("#0B0B0F");

      document.body.style.background = "#0B0B0F";
    }
  }, []);

  const handleLogin = () => {
    const tg = (window as any).Telegram?.WebApp;

    if (!tg) {
      alert("Открой через Telegram");
      return;
    }

    const user = tg.initDataUnsafe?.user;

    if (!user) {
      alert("Нет данных от Telegram");
      return;
    }

    // переход на профиль
    window.location.href = "/profile";
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "24px",
        background: "#0B0B0F",
        color: "white",
      }}
    >
      {/* Заголовок */}
      <h1 style={{ fontSize: "48px", fontWeight: "bold" }}>
        Aura
      </h1>

      {/* Подзаголовок */}
      <p style={{ color: "#aaa", marginTop: "8px" }}>
        Найди свою энергию 💜
      </p>

      {/* КНОПКА */}
      <button
        onClick={handleLogin}
        style={{
          marginTop: "40px",
          width: "100%",
          maxWidth: "400px",
          height: "56px",
          borderRadius: "16px",
          background: "linear-gradient(90deg, #7B2FF7, #F107A3)",
          color: "white",
          fontSize: "18px",
          border: "none",
          boxShadow: "0 0 30px rgba(123,47,247,0.7)",
        }}
      >
        Войти через Telegram
      </button>
    </main>
  );
}