"use client";

import { useEffect } from "react";

export default function Home() {

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;
    tg?.ready();
    tg?.expand();
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

    window.location.href = "/profile";
  };

  return (
    <main className="relative h-screen w-full text-white flex flex-col justify-center items-center px-6 bg-[#0B0B0F]">

      {/* 🔥 Glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-150px] left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-purple-600 opacity-20 blur-[120px] rounded-full" />
      </div>

      {/* Логотип */}
      <h1 className="text-5xl font-bold tracking-wide">
        Aura
      </h1>

      <p className="text-gray-400 mt-3 text-center">
        Найди свою энергию 💜
      </p>

      {/* Кнопка */}
      <button
        onClick={handleLogin}
        className="
          mt-12
          w-full max-w-sm
          h-14
          rounded-2xl
          bg-gradient-to-r from-purple-600 to-pink-500
          shadow-[0_0_30px_rgba(123,47,247,0.8)]
          text-white text-lg font-medium
          active:scale-95 transition
        "
      >
        Войти через Telegram
      </button>

    </main>
  );
}