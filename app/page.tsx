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

    // 👉 Переход на страницу профиля
    window.location.href = "/profile";
  };

  return (
    <main className="h-screen w-full bg-[#0B0B0F] text-white flex flex-col justify-between">

      {/* Центр */}
      <div className="flex flex-col items-center justify-center flex-1 px-6">

        {/* Лого */}
        <h1 className="text-5xl font-bold tracking-wide">
          Aura
        </h1>

        {/* Подзаголовок */}
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
            active:scale-95
            transition
          "
        >
          Войти через Telegram
        </button>

      </div>

      {/* Низ */}
      <div className="pb-6 px-6 text-center">
        <p className="text-xs text-gray-500">
          Продолжая, вы принимаете условия использования
        </p>
      </div>

    </main>
  );
}