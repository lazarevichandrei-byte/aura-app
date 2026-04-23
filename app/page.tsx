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

      if (!user) return;

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

    init();
  }, []);

  return <div className="p-4">Loading...</div>;
}