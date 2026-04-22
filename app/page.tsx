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

      tg.setBackgroundColor("#0B0B0F");
      tg.setHeaderColor("#0B0B0F");
    }
  }, []);

  const handleLogin = () => {
    const tg = (window as any).Telegram?.WebApp;

    if (!tg) {
      alert("Открой через Telegram");
      return;
    }

    const user = tg.initDataUnsafe?.user;

    if (!user) {
      alert("Нет данных");
      return;
    }

    // 🔥 ВОТ ЭТО ВАЖНО
    router.push("/profile");
  };

  return (
    <main>
      <button onClick={handleLogin}>
        Войти через Telegram
      </button>
    </main>
  );
}