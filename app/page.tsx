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
    <main className="relative h-screen w-full text-white flex flex-col justify-center items-center px-6 overflow-hidden">

      {/* фон */}
      <div className="absolute inset-0 bg-[#0B0B0F] -z-10" />

      {/* glow */}
      <div className="absolute top-[-150px] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-purple-600 opacity-20 blur-[140px] rounded-full -z-10" />

      <div className="mb-10 text-center">
        <h1 className="text-5xl font-bold">Aura</h1>
        <p className="text-gray-400 mt-2">
          Найди свою энергию 💜
        </p>
      </div>

      <button
        onClick={handleLogin}
        className="w-full max-w-sm h-14 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 shadow-[0_0_40px_rgba(123,47,247,0.8)] text-lg font-medium active:scale-95 transition"
      >
        Войти через Telegram
      </button>

      <p className="absolute bottom-6 text-xs text-gray-500 text-center px-6">
        Продолжая, вы принимаете условия использования
      </p>

    </main>
  );
}