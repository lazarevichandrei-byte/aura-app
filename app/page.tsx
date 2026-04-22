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

    // переход на профиль
    window.location.href = "/profile";
  };

  return (
    <main className="h-screen w-full bg-black text-white flex flex-col justify-center items-center px-6">

      <h1 className="text-4xl font-bold">Aura</h1>

      <button
        onClick={handleLogin}
        className="mt-10 w-full max-w-sm h-14 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500"
      >
        Войти через Telegram
      </button>

    </main>
  );
}