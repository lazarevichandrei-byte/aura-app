"use client";

import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;

    if (tg) {
      tg.ready();
      tg.expand();
    }
  }, []);

  const handleLogin = () => {
    const tg = (window as any).Telegram?.WebApp;

    // 👉 если не в Telegram — всё равно пускаем дальше (для теста)
    window.location.href = "/profile";
  };

  return (
    <div style={styles.wrapper}>
      
      {/* glow */}
      <div style={styles.glowLeft}></div>
      <div style={styles.glowRight}></div>

      {/* контент */}
      <div style={styles.content}>
        <h1 style={styles.title}>Aura</h1>

        <p style={styles.subtitle}>
          Найди свою энергию 💜
        </p>

        <button onClick={handleLogin} style={styles.button}>
          ✈️ Войти через Telegram
        </button>
      </div>

      <p style={styles.footer}>
        Продолжая, вы принимаете условия использования
      </p>
    </div>
  );
}

const styles: any = {
  wrapper: {
    height: "100vh",
    background: "#0B0B0F",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    position: "relative",
    overflow: "hidden",
    fontFamily: "Arial",
  },

  content: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    zIndex: 2,
  },

  title: {
    fontSize: "48px",
    fontWeight: "bold",
    background: "linear-gradient(90deg,#a855f7,#ec4899)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    textShadow: "0 0 20px rgba(168,85,247,0.6)",
  },

  subtitle: {
    marginTop: "10px",
    color: "#aaa",
  },

  button: {
    marginTop: "40px",
    width: "280px",
    height: "56px",
    borderRadius: "30px",
    border: "none",
    fontSize: "18px",
    color: "white",
    cursor: "pointer",
    background: "linear-gradient(90deg,#7B2FF7,#F107A3)",
    boxShadow: "0 0 30px rgba(123,47,247,0.7)",
  },

  footer: {
    position: "absolute",
    bottom: "20px",
    fontSize: "12px",
    color: "#666",
    textAlign: "center",
    padding: "0 20px",
  },

  glowLeft: {
    position: "absolute",
    left: "-150px",
    top: "50%",
    width: "300px",
    height: "300px",
    background: "purple",
    filter: "blur(120px)",
    opacity: 0.3,
  },

  glowRight: {
    position: "absolute",
    right: "-150px",
    bottom: "100px",
    width: "300px",
    height: "300px",
    background: "pink",
    filter: "blur(120px)",
    opacity: 0.3,
  },
};