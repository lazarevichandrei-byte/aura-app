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

      // стиль под Telegram
      tg.setBackgroundColor("#ffffff");
      tg.setHeaderColor("#ffffff");

      document.body.style.background = "#ffffff";

      // 🔥 можно посмотреть пользователя
      console.log("TG USER:", tg.initDataUnsafe?.user);
    }
  }, []);

  const handleLogin = () => {
    console.log("CLICK LOGIN");

    const tg = (window as any).Telegram?.WebApp;

    // 👉 если НЕ в Telegram
    if (!tg) {
      console.log("NOT IN TELEGRAM");
      router.push("/profile");
      return;
    }

    // 👉 если в Telegram
    console.log("IN TELEGRAM:", tg.initDataUnsafe?.user);

    router.push("/profile");

    // fallback (если роутер не сработает)
    setTimeout(() => {
      window.location.href = "/profile";
    }, 200);
  };

  return (
    <main style={styles.container}>
      <div style={styles.center}>
        <h1 style={styles.logo}>Aura</h1>

        <p style={styles.subtitle}>
          Найди свою энергию 💙
        </p>

        <button style={styles.button} onClick={handleLogin}>
          ✈️ Войти через Telegram
        </button>
      </div>

      <div style={styles.footer}>
        <p>Продолжая, вы принимаете</p>
        <p style={styles.links}>
          Условия использования и Политику конфиденциальности
        </p>
      </div>
    </main>
  );
}

const styles: any = {
  container: {
    minHeight: "100vh",
    background: "#ffffff",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "20px",
    fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
  },

  center: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },

  logo: {
    fontSize: "42px",
    fontWeight: "600",
    color: "#000",
    marginBottom: "10px",
  },

  subtitle: {
    fontSize: "16px",
    color: "#6B7280",
    marginBottom: "40px",
  },

  button: {
    background: "linear-gradient(90deg,#2AABEE,#1E96E6)",
    color: "white",
    border: "none",
    borderRadius: "16px",
    height: "56px",
    padding: "0 24px",
    fontSize: "17px",
    fontWeight: "500",
    boxShadow: "0 8px 20px rgba(42,171,238,0.4)",
    cursor: "pointer",
    transition: "0.2s",
  },

  footer: {
    textAlign: "center",
    fontSize: "12px",
    color: "#9CA3AF",
  },

  links: {
    color: "#2AABEE",
    marginTop: "4px",
  },
};