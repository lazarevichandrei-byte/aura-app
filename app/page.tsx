"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;

    if (tg) {
      tg.ready();
      tg.expand();
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
      alert("Нет данных");
      return;
    }

    // 🔥 переход (правильный)
    router.push("/profile");
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "40px 20px",
        background: "#0B0B0F",
        color: "white",
      }}
    >
      <div style={{ marginTop: "120px", textAlign: "center" }}>
        <h1
          style={{
            fontSize: "56px",
            fontWeight: 700,
            letterSpacing: "10px",
            background: "linear-gradient(90deg, #7B2FF7, #F107A3)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          AURA
        </h1>

        <p style={{ color: "#aaa", marginTop: "10px" }}>
          Найди свою энергию 💜
        </p>
      </div>

      <button
        onClick={handleLogin}
        style={{
          width: "100%",
          maxWidth: "400px",
          height: "58px",
          borderRadius: "20px",
          border: "none",
          background: "linear-gradient(90deg, #7B2FF7, #F107A3)",
          color: "white",
          fontSize: "17px",
        }}
      >
        Войти через Telegram
      </button>

      <p style={{ fontSize: "12px", color: "#666" }}>
        Продолжая, вы принимаете условия
      </p>
    </main>
  );
}