"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "./lib/supabase";

export default function StartPage() {
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const tg = (window as any)?.Telegram?.WebApp;

      // если не в Telegram
      if (!tg) {
        router.replace("/profile");
        return;
      }

      tg.ready();
      tg.expand();

      const user = tg.initDataUnsafe?.user;

      // если нет пользователя
      if (!user?.id) {
        router.replace("/profile");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("telegram_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("SUPABASE ERROR:", error);
          router.replace("/profile");
          return;
        }

        if (data) {
          router.replace("/home");
        } else {
          router.replace("/profile");
        }
      } catch (e) {
        console.error("INIT ERROR:", e);
        router.replace("/profile");
      }
    };

    init();
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p>Загрузка...</p>
    </div>
  );
}