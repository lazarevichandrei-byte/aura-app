"use client";

import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export type CurrentUser = {
  id: string;
  telegram_id: number;
  name: string;
  avatar_url: string | null;
  onboarding_completed: boolean | null;
};

let cachedUser: CurrentUser | null | undefined;
let currentUserRequest: Promise<CurrentUser | null> | null = null;

function mark(name: string) {
  if (typeof performance !== "undefined") performance.mark(name);
}

export function loadCurrentUser() {
  if (cachedUser !== undefined) return Promise.resolve(cachedUser);
  if (currentUserRequest) return currentUserRequest;

  currentUserRequest = (async () => {
    mark("USER_BOOTSTRAP_START");
    const telegramUser = (window as any).Telegram?.WebApp?.initDataUnsafe?.user;
    if (!telegramUser) return null;

    const { data, error } = await supabase
      .from("users")
      .select("id,telegram_id,name,avatar_url,onboarding_completed")
      .eq("telegram_id", telegramUser.id)
      .maybeSingle();

    if (error) throw error;
    cachedUser = data;
    return data;
  })().finally(() => {
    mark("USER_BOOTSTRAP");
    currentUserRequest = null;
  });

  return currentUserRequest;
}

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        setUser(await loadCurrentUser());
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
