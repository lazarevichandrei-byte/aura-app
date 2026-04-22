"use client";

import { useEffect } from "react";

export default function Home() {
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
      alert("Нет данных от Telegram");
      return;
    }

    // переход на профиль
    window.location.href = "/profile";
  };

  return (
    <main className="min-h-screen flex flex-col justify-center items-center px-6 bg-[#0B0B0F] text-white">

      {/* Заголовок */}
      <h1 className="text-5xl font-bold tracking-wide mb-4">
        Aura
      </h1>

      {/* Подзаголовок */}
      <p className="text-gray-400 text-center mb-10">
        Найди свою энергию 💜
      </p>

      {/* КНОПКА */}
      <button
        onClick={handleLogin}
        className="
          w-full max-w-sm h-14 rounded-2xl
          text-lg font-medium text-white

          !bg-gradient-to-r
          !from-purple-600
          !to-pink-500

          shadow-[0_0_30px_rgba(123,47,247,0.7)]

          active:scale-95
          transition
        "
      >
        Войти через Telegram
      </button>

    </main>
  );
}