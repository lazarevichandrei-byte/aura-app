"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function Page() {
  const router = useRouter();

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

        // ❗ если Telegram не дал пользователя
        if (!user) {
          console.log("No Telegram user");
          return;
        }

        // 🔍 проверяем есть ли пользователь в базе
        const { data } = await supabase
          .from("users")
          .select("*")
          .eq("telegram_id", user.id)
          .maybeSingle();

        // ✅ если нет → профиль
        if (!data) {
          router.replace("/profile");
          return;
        }

        // ✅ если есть → home
        router.replace("/home");
      } catch (e) {
        console.log("INIT ERROR:", e);
      }
    };

    init();
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.center}>
        <h1 style={styles.logo}>Aura</h1>
        <p style={styles.subtitle}>Загрузка...</p>
      </div>
    </div>
  );
}

const styles: any = {
  container: {
    minHeight: "100vh",
    background: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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
    color: "#666",
  },
};