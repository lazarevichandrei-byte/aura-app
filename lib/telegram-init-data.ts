export async function getTelegramInitData(waitMs = 1200) {
  if (typeof window === "undefined") return "";

  const read = () => {
    const value = (window as any)?.Telegram?.WebApp?.initData || "";
    if (value) sessionStorage.setItem("telegram_init_data", value);
    return value || sessionStorage.getItem("telegram_init_data") || "";
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
