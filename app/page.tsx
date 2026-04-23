"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const tg = (window as any).Telegram?.WebApp;
      const user = tg?.initDataUnsafe?.user;

      if (!user) {
        router.push("/profile");
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("telegram_id", user.id)
        .maybeSingle(); // ✅ ВАЖНО

      // ❗ если пользователя нет → data = null
      if (!data) {
        router.push("/profile");
        return;
      }

      // ❗ если есть → на home
      router.push("/home");
    };

    init();
  }, []);

  return <div style={{ padding: 20 }}>Loading...</div>;
}