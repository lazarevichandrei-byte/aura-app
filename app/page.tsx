"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "./lib/supabase";

export default function StartPage() {
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const tg = (window as any).Telegram?.WebApp;

      // если вдруг не через Telegram — отправляем на профиль
      if (!tg) {
        router.replace("/profile");
        return;
      }

      tg.ready();
      tg.expand();

      const user = tg.initDataUnsafe?.user;

      // если Telegram не передал пользователя
      if (!user || !user.id) {
        router.replace("/profile");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("telegram_id", user.id)
          .maybeSingle(); // 👈 безопаснее чем single()

        if (error) {
          console.error("SUPABASE ERROR:", error);
          router.replace("/profile");
          return;
        }

        // 👉 есть профиль → свайпы
        if (data) {
          router.replace("/home");
        } 
        // 👉 нет профиля → создать
        else {
          router.replace("/profile");
        }

      } catch (e) {
        console.error("INIT ERROR:", e);
        router.replace("/profile");
      }
    };

    init();
  }, []);

  return (
    <div style={{ padding: 20, textAlign: "center" }}>
      <p>Загрузка...</p>
    </div>
  );
}