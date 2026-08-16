export async function getTelegramInitData(waitMs = 1200) {
  if (typeof window === "undefined") return "";

  const read = () => {
    const value = (window as any)?.Telegram?.WebApp?.initData || "";
    if (value) sessionStorage.setItem("telegram_init_data", value);
    if(value)return value;
    const cached=sessionStorage.getItem("telegram_init_data")||"";
    const currentTelegramId=(window as any)?.Telegram?.WebApp?.initDataUnsafe?.user?.id;
    if(!cached||!Number.isSafeInteger(currentTelegramId))return "";
    try{
      const cachedUser=JSON.parse(new URLSearchParams(cached).get("user")||"null");
      if(cachedUser?.id===currentTelegramId)return cached;
    }catch{}
    sessionStorage.removeItem("telegram_init_data");
    return "";
  };

  const existing = read();
  if (existing) return existing;

  const startedAt = Date.now();
  while (Date.now() - startedAt < waitMs) {
    await new Promise((resolve) => setTimeout(resolve, 50));
    const value = read();
    if (value) return value;
  }

  return "";
}
