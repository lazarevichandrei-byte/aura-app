"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "./lib/supabase";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const tg = (window as any).Telegram?.WebApp;
      const user = tg?.initDataUnsafe?.user;

      if (!user) {
        router.push("/profile");
        return;
      }

      const telegram_id = user.id;

      // 🔥 проверяем есть ли пользователь
      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("telegram_id", telegram_id)
        .single();

      if (data) {
        // ✅ уже есть → свайпы
        router.push("/home");
      } else {
        // 🆕 первый раз → профиль
        router.push("/profile");
      }
    };

    checkUser();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      Загрузка...
    </div>
  );
}