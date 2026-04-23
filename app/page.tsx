"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const tg = (window as any).Telegram?.WebApp;

        if (tg) {
          tg.ready();
          tg.expand();
          tg.setBackgroundColor("#ffffff");
          tg.setHeaderColor("#ffffff");

          document.body.style.background = "#ffffff";
        }

        const user = tg?.initDataUnsafe?.user;

        // ❗ если нет Telegram → показываем экран
        if (!user) {
          setLoading(false);
          return;
        }

        const { data } = await supabase
          .from("users")
          .select("*")
          .eq("telegram_id", user.id)
          .maybeSingle();

        // ✅ если есть → home
        if (data) {
          router.replace("/home");
          return;
        }

        // ✅ если новый → показываем кнопку
        setLoading(false);
      } catch (e) {
        console.log("INIT ERROR:", e);
        setLoading(false);
      }
    };

    init();
  }, []);

  const handleLogin = () => {
    router.push("/profile");
  };

  // 🔹 ЗАГРУЗКА (но не вечная)
  if (loading) {
    return (
      <main style={styles.container}>
        <div style={styles.center}>
          <h1 style={styles.logo}>Aura</h1>
          <p style={styles.subtitle}>Загрузка...</p>
        </div>
      </main>
    );
  }

  // 🔹 ОСНОВНОЙ ЭКРАН
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
    fontWeight: "500",
    color: "#000",
    marginBottom: "10px",
  },

  subtitle: {
    fontSize: "16px",
    color: "#666",
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
  },

  footer: {
    textAlign: "center",
    fontSize: "12px",
    color: "#999",
  },

  links: {
    color: "#2AABEE",
    marginTop: "4px",
  },
};