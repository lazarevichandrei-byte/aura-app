"use client";

import { useEffect } from "react";

export default function Home() {
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
      alert("Нет данных от Telegram");
      return;
    }

    window.location.href = "/profile";
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
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* 💜 мягкий glow фон */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <div
          style={{
            position: "absolute",
            width: "300px",
            height: "300px",
            background: "rgba(123,47,247,0.25)",
            filter: "blur(120px)",
            top: "-80px",
            left: "-80px",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "300px",
            height: "300px",
            background: "rgba(241,7,163,0.25)",
            filter: "blur(120px)",
            bottom: "-80px",
            right: "-80px",
            borderRadius: "50%",
          }}
        />
      </div>

      {/* 🔥 центр */}
      <div
        style={{
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginTop: "120px",
        }}
      >
        {/* AURA градиент */}
        <h1
          style={{
            fontSize: "52px",
            fontWeight: "700",
            letterSpacing: "6px",
            background: "linear-gradient(90deg, #7B2FF7, #F107A3)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 0 25px rgba(123,47,247,0.4)",
          }}
        >
          AURA
        </h1>

        <p
          style={{
            color: "#aaa",
            marginTop: "12px",
            fontSize: "16px",
          }}
        >
          Найди свою энергию 💜
        </p>
      </div>

      {/* 🔥 кнопка */}
      <button
        onClick={handleLogin}
        style={{
          zIndex: 1,
          width: "100%",
          maxWidth: "400px",
          height: "58px",
          borderRadius: "20px",
          border: "none",
          background: "linear-gradient(90deg, #7B2FF7, #F107A3)",
          color: "white",
          fontSize: "17px",
          fontWeight: "500",
          boxShadow: "0 10px 30px rgba(123,47,247,0.5)",
          transition: "0.2s",
        }}
        onMouseDown={(e) =>
          (e.currentTarget.style.transform = "scale(0.97)")
        }
        onMouseUp={(e) =>
          (e.currentTarget.style.transform = "scale(1)")
        }
      >
        ✈️ Войти через Telegram
      </button>

      {/* низ */}
      <p
        style={{
          zIndex: 1,
          fontSize: "12px",
          color: "#666",
        }}
      >
        Продолжая, вы принимаете условия
      </p>
    </main>
  );
}