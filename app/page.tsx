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
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* 🔥 ГЛОУ ФОН */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <div
          style={{
            position: "absolute",
            width: "500px",
            height: "500px",
            background: "radial-gradient(circle, #7B2FF7, transparent)",
            filter: "blur(160px)",
            top: "-100px",
            left: "-100px",
            opacity: 0.6,
          }}
        />

        <div
          style={{
            position: "absolute",
            width: "500px",
            height: "500px",
            background: "radial-gradient(circle, #F107A3, transparent)",
            filter: "blur(160px)",
            bottom: "-100px",
            right: "-100px",
            opacity: 0.6,
          }}
        />
      </div>

      {/* 🔥 ЛОГО */}
      <div
        style={{
          zIndex: 1,
          textAlign: "center",
          marginTop: "100px",
        }}
      >
        <div
          style={{
            fontSize: "90px",
            fontWeight: "bold",
            background: "linear-gradient(90deg, #7B2FF7, #F107A3)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 0 40px rgba(123,47,247,0.6)",
          }}
        >
          A
        </div>

        <div
          style={{
            fontSize: "42px",
            letterSpacing: "12px",
            marginTop: "10px",
            background: "linear-gradient(90deg, #7B2FF7, #F107A3)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "0 0 25px rgba(241,7,163,0.6)",
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
          height: "64px",
          borderRadius: "40px",
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
          fontSize: "18px",
          fontWeight: "600",
          color: "white",
          background: "linear-gradient(90deg, #7B2FF7, #F107A3)",
          boxShadow:
            "0 10px 40px rgba(123,47,247,0.6), 0 0 20px rgba(241,7,163,0.5)",
          transform: "translateY(0)",
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
    </main>
  );
}