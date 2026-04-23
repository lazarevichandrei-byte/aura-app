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

      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("telegram_id", user.id)
        .single();

      if (data) {
        router.push("/home");
      } else {
        router.push("/profile");
      }
    };

    checkUser();
  }, []);

  return <div>Загрузка...</div>;
}