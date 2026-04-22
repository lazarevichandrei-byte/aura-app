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

  const testClick = () => {
    const tg = (window as any).Telegram?.WebApp;

    if (!tg) {
      alert("❌ НЕ через Telegram");
      return;
    }

    const user = tg.initDataUnsafe?.user;

    if (!user) {
      alert("⚠️ Telegram есть, но нет данных");
      return;
    }

    alert(`✅ Работает! Привет ${user.first_name}`);
  };

  return (
    <main className="h-screen flex items-center justify-center bg-black text-white">
      <button
        onClick={testClick}
        className="px-6 py-4 bg-purple-600 rounded-xl text-lg"
      >
        Проверить Telegram
      </button>
    </main>
  );
}