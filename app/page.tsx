"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const tg = (window as any).Telegram?.WebApp;
      const user = tg?.initDataUnsafe?.user;

      if (!user) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("telegram_id", user.id)
        .maybeSingle();

      if (!data) {
        // новый пользователь
        setLoading(false);
      } else {
        // уже есть профиль
        router.push("/home");
      }
    };

    init();
  }, []);

  const handleLogin = () => {
    router.push("/profile");
  };

  if (loading) {
    return <div style={{ padding: 20 }}>Loading...</div>;
  }

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
    </main>
  );
}

const styles: any = {
  container: {
    minHeight: "100vh",
    background: "#ffffff",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },

  center: {
    textAlign: "center",
  },

  logo: {
    fontSize: "42px",
    fontWeight: "500",
  },

  subtitle: {
    marginTop: "10px",
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
  },
};