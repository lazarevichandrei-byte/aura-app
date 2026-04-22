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

    document.body.style.background = "#0B0B0F";
  }, []);

  const handleLogin = () => {
    const tg = (window as any).Telegram?.WebApp;

    if (!tg) {
      alert("Открой через Telegram");
      return;
    }

    window.location.href = "/profile";
  };

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center text-white overflow-hidden px-6">

      {/* 🌌 ФОН */}
      <div className="absolute inset-0 bg-[#0B0B0F] -z-10" />

      {/* Glow слева */}
      <div className="absolute -left-40 top-1/2 w-[300px] h-[300px] bg-purple-600 opacity-30 blur-[120px] rounded-full" />

      {/* Glow справа */}
      <div className="absolute -right-40 bottom-20 w-[300px] h-[300px] bg-pink-500 opacity-30 blur-[120px] rounded-full" />

      {/* 💜 ЛОГО */}
      <h1 className="text-5xl font-semibold tracking-wide bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(168,85,247,0.6)]">
        Aura
      </h1>

      {/* Подзаголовок */}
      <p className="text-gray-400 mt-3 text-center">
        Найди свою энергию 💜
      </p>

      {/* 🚀 КНОПКА */}
      <button
        onClick={handleLogin}
        className="
          mt-10
          w-full max-w-[320px]
          h-14
          rounded-full
          bg-gradient-to-r from-purple-600 to-pink-500
          shadow-[0_0_30px_rgba(123,47,247,0.8)]
          flex items-center justify-center gap-3
          text-lg font-medium
          active:scale-95 transition
        "
      >
        {/* иконка */}
        <span className="text-xl">✈️</span>

        Войти через Telegram
      </button>

      {/* 📄 ТЕКСТ ВНИЗУ */}
      <p className="absolute bottom-6 text-xs text-gray-500 text-center px-6">
        Продолжая, вы принимаете <br />
        Условия использования и Политику конфиденциальности
      </p>

    </main>
  );
}