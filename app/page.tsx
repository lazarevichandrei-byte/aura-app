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
        }

        const user = tg?.initDataUnsafe?.user;

        // ❗ Если Telegram не дал пользователя — просто показываем кнопку
        if (!user) {
          setLoading(false);
          return;
        }

        // 🔍 Проверяем есть ли пользователь в базе
        const { data } = await supabase
          .from("users")
          .select("*")
          .eq("telegram_id", user.id)
          .maybeSingle();

        // ✅ Если пользователь есть → HOME
        if (data) {
          router.replace("/home");
          return;
        }

        // ✅ Если нет → показываем кнопку
        setLoading(false);
      } catch (e) {
        console.log("INIT ERROR:", e);
        setLoading(false); // ❗ чтобы не зависало
      }
    };

    init();
  }, []);

  const handleStart = () => {
    router.push("/profile");
  };

  // 🔹 экран загрузки (но не вечный)
  if (loading) {
    return (
      <div style={styles.loading}>
        <h1>Aura</h1>
        <p>Загрузка...</p>
      </div>
    );
  }

  // 🔹 главный экран
  return (
    <main style={styles.container}>
      <div style={styles.center}>
        <h1 style={styles.logo}>Aura</h1>

        <p style={styles.subtitle}>
          Найди свою энергию 💙
        </p>

        <button style={styles.button} onClick={handleStart}>
          ✈️ Начать
        </button>
      </div>
    </main>
  );
}

const styles: any = {
  loading: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "-apple-system, sans-serif",
  },

  container: {
    minHeight: "100vh",
    background: "#ffffff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "-apple-system, sans-serif",
  },

  center: {
    textAlign: "center",
  },

  logo: {
    fontSize: "42px",
    fontWeight: "500",
    marginBottom: "10px",
  },

  subtitle: {
    marginBottom: "40px",
    color: "#666",
  },

  button: {
    background: "linear-gradient(90deg,#2AABEE,#1E96E6)",
    color: "#fff",
    border: "none",
    borderRadius: "16px",
    height: "56px",
    padding: "0 24px",
    fontSize: "16px",
    cursor: "pointer",
  },
};