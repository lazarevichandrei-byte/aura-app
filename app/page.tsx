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
        }

        // ✅ ДОБАВЛЕНО: защита от отсутствия Telegram
        if (!tg || !tg.initDataUnsafe) {
          setLoading(false);
          return;
        }

        const user = tg.initDataUnsafe.user;

        if (!user) {
          setLoading(false);
          return;
        }

        const { data } = await supabase
  .from("users")
  .select("onboarding_completed")
  .eq("telegram_id", user.id)
  .maybeSingle();

if (data?.onboarding_completed) {
  window.location.href="/home";
  return;
}

if (data && data.onboarding_completed !== true) {
  window.location.href="/profile";
  return;
}

setLoading(false);

        setLoading(false);
      } catch (e) {
        console.log("INIT ERROR:", e);
        setLoading(false);
      }
    };

    init();
  }, []);

  const handleLogin = () => {
    // ✅ ИЗМЕНЕНО: вместо router.push
    window.location.href = "/profile";
  };

  if (loading) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.center}>
          <h1 style={styles.logo}>Aura</h1>
          <p style={styles.subtitle}>Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <main style={styles.wrapper}>
      {/* CENTER */}
      <div style={styles.center}>
        <h1 style={styles.logo}>Aura</h1>

        <p style={styles.subtitle}>
          Найди свою энергию 💙
        </p>

        <button style={styles.button} onClick={handleLogin}>
          ✈️ Войти через Telegram
        </button>
      </div>

      {/* FOOTER */}
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
  wrapper: {
    minHeight: "100dvh",
    background: "var(--app-bg)",
    color:"var(--text-primary)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "24px",
    fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
  },

  center: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  logo: {
    fontSize: "48px",
    fontWeight: "600",
    letterSpacing: "-1px",
    color: "var(--text-primary)",
  },

  subtitle: {
    fontSize: "16px",
    color: "var(--text-secondary)",
    marginTop: "8px",
    marginBottom: "48px",
  },

  button: {
    width: "100%",
    maxWidth: "320px",
    height: "56px",
    borderRadius: "18px",
    border: "none",
    fontSize: "17px",
    fontWeight: "600",
    color: "var(--text-inverse)",
    background: "var(--primary)",
    cursor: "pointer",
  },

  footer: {
    textAlign: "center",
    fontSize: "12px",
    color: "var(--text-muted)",
  },

  links: {
    marginTop: "4px",
    color: "var(--primary)",
  },
};
