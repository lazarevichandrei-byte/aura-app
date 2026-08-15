"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "../components/I18nProvider";
import LanguagePickerSheet from "../components/LanguagePickerSheet";
import {LOCALE_BY_CODE} from "../lib/i18n/locales";
import {loadCurrentUser} from "../lib/useCurrentUser";

export default function Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const {t,locale}=useI18n();
  const [languageOpen,setLanguageOpen]=useState(false);

  useEffect(() => {
    performance.mark("APP_START");
    performance.mark("FIRST_UI");
    const init = async () => {
      try {
        const tg = (window as any).Telegram?.WebApp;

        if (tg) {
          tg.ready();
          tg.expand();
          performance.mark("TELEGRAM_READY");
        }

        // ✅ ДОБАВЛЕНО: защита от отсутствия Telegram
        if (!tg || !tg.initDataUnsafe) {
          setLoading(false);
          return;
        }

        if (!tg.initDataUnsafe.user) {
          setLoading(false);
          return;
        }

        const data = await loadCurrentUser();

if (data?.onboarding_completed) {
  router.replace("/home");
  return;
}

if (data && data.onboarding_completed !== true) {
  router.replace("/profile");
  return;
}

setLoading(false);

      } catch (e) {
        console.log("INIT ERROR:", e);
        setLoading(false);
      }
    };

    init();
  }, [router]);

  const handleLogin = () => {
    router.push("/profile");
  };

  if (loading) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.center}>
          <h1 style={styles.logo}>Aura</h1>
          <p style={styles.subtitle}>{t("home.loading")}</p>
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
          {t("home.tagline")}
        </p>

        <button style={styles.button} onClick={handleLogin}>
          ✈️ {t("home.login")}
        </button>
      </div>

      {/* FOOTER */}
      <div style={styles.footer}>
        <button type="button" onClick={()=>setLanguageOpen(true)} style={styles.languageButton}>🌐 {LOCALE_BY_CODE.get(locale)?.nativeName || locale}</button>
        <p>{t("home.terms")}</p>
        <p style={styles.links}>
          {t("home.termsLinks")}
        </p>
      </div>
      <LanguagePickerSheet open={languageOpen} onClose={()=>setLanguageOpen(false)} />
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
  languageButton:{margin:"0 auto 16px",padding:"9px 14px",borderRadius:999,background:"var(--surface)",border:"1px solid var(--border)",color:"var(--text-primary)",fontWeight:600,cursor:"pointer"},
};
