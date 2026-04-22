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
    window.location.href = "/profile";
  };

  return (
    <main className="h-screen w-full flex flex-col justify-between px-6 py-10 relative overflow-hidden bg-[#0B0B0F] text-white">

      {/* 💜 мягкий фон */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute w-[400px] h-[400px] bg-purple-600/20 blur-[120px] top-[-100px] left-[-100px] rounded-full" />
        <div className="absolute w-[400px] h-[400px] bg-pink-500/20 blur-[120px] bottom-[-100px] right-[-100px] rounded-full" />
      </div>

      {/* 🔥 контент */}
      <div className="flex flex-col items-center justify-center flex-1">

        <h1 className="text-5xl font-semibold tracking-wide">
          Aura
        </h1>

        <p className="text-gray-400 mt-3 text-center">
          Найди свою энергию 💜
        </p>

        <button
          onClick={handleLogin}
          className="
            mt-12
            w-full max-w-sm
            h-14
            rounded-2xl
            bg-gradient-to-r from-purple-600 to-pink-500
            text-white text-lg font-medium
            active:scale-95 transition
            shadow-[0_10px_30px_rgba(123,47,247,0.4)]
          "
        >
          Войти через Telegram
        </button>

      </div>

      {/* текст снизу */}
      <div className="text-center">
        <p className="text-xs text-gray-500">
          Продолжая, вы принимаете условия
        </p>
      </div>

    </main>
  );
}