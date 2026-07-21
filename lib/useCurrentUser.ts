"use client";

import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export type CurrentUser = {
  id: string;
  telegram_id: number;
  name: string;
  avatar_url: string | null;
};

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const tg = (window as any).Telegram?.WebApp;
        const telegramUser = tg?.initDataUnsafe?.user;

        if (!telegramUser) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("users")
          .select(`
            id,
            telegram_id,
            name,
            avatar_url
          `)
          .eq("telegram_id", telegramUser.id)
          .maybeSingle();

        if (error) throw error;

        setUser(data);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  return {
    user,
    loading,
  };
}