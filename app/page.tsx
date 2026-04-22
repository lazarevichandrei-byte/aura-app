"use client";

import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;

    if (tg) {
      tg.ready();
      tg.expand();
      tg.setBackgroundColor("#05050A");
      tg.setHeaderColor("#05050A");

      document.body.style.background = "#05050A";
    }
  }, []);

  const handleLogin = () => {
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
        background: "#05050A",
        color: "white",
      }}
    >
      {/* 🔥 ФОН С ГЛОУ */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: "300px",
            height: "300px",
            background: "radial-gradient(circle, #7B2FF7, transparent)",
            filter: "blur(120px)",
            top: "-50px",
            left: "-50px",
            opacity: 0.6,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: "300px",
            height: "300px",
            background: "radial-gradient(circle, #F107A3, transparent)",
            filter: "blur(120px)",
            bottom: "-50px",
            right: "-50px",
            opacity: 0.6,
          }}
        />
      </div>

      {/* 🔥 ЛОГО + НАЗВАНИЕ */}
      <div style={{ zIndex: 1, textAlign: "center", marginTop: "80px" }}>
        <div
          style={{
            fontSize: "80px",
            fontWeight: "bold",
            background: "linear-gradient(90deg, #7B2FF7, #F107A3)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          A
        </div>

        <div
          style={{
            fontSize: "40px",
            letterSpacing: "10px",
            marginTop: "10px",
            background: "linear-gradient(90deg, #7B2FF7, #F107A3)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          AURA
        </div>
      </div>

      {/* 🔥 КНОПКА */}
      <button
        onClick={handleLogin}
        style={{
          zIndex: 1,
          width: "100%",
          maxWidth: "400px",
          height: "60px",
          borderRadius: "30px",
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          fontSize: "18px",
          fontWeight: "500",
          color: "white",
          background: "linear-gradient(90deg, #7B2FF7, #F107A3)",
          boxShadow: "0 0 40px rgba(123,47,247,0.6)",
        }}
      >
        ✈️ Войти через Telegram
      </button>
    </main>
  );
}