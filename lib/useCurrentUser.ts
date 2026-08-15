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
const SNAPSHOT_KEY="aura-current-user-snapshot";

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
    mark("INITDATA_AVAILABLE");

    const { data, error } = await supabase
      .from("users")
      .select("id,telegram_id,name,avatar_url,onboarding_completed")
      .eq("telegram_id", telegramUser.id)
      .maybeSingle();

    if (error) throw error;
    cachedUser = data;
    if(data) localStorage.setItem(SNAPSHOT_KEY,JSON.stringify({telegram_id:data.telegram_id,name:data.name,avatar_url:data.avatar_url,onboarding_completed:data.onboarding_completed}));
    return data;
  })().finally(() => {
    mark("USER_BOOTSTRAP_END");
    currentUserRequest = null;
  });

  return currentUserRequest;
}

export function readCurrentUserSnapshot(){
  if(typeof window==="undefined") return null;
  try{
    const value=JSON.parse(localStorage.getItem(SNAPSHOT_KEY)||"null");
    const telegramId=(window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id;
    return value?.telegram_id===telegramId?value:null;
  }catch{return null;}
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
