import crypto from "crypto";

const MAX_INIT_DATA_AGE_SECONDS = 24 * 60 * 60;

type TelegramUser = {
  id: number;
  first_name?: string;
};

type ValidationResult =
  | { ok: true; user: TelegramUser }
  | { ok: false; error: "BOT_TOKEN_MISSING" | "INVALID_INIT_DATA" | "EXPIRED_INIT_DATA" };

export function validateTelegramInitData(initData: string): ValidationResult {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    return { ok: false, error: "BOT_TOKEN_MISSING" };
  }

  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  const userRaw = params.get("user");
  const authDate = Number(params.get("auth_date"));

  if (!hash || !userRaw || !Number.isSafeInteger(authDate)) {
    return { ok: false, error: "INVALID_INIT_DATA" };
  }

  const currentTimestamp = Math.floor(Date.now() / 1000);

  if (
    authDate > currentTimestamp + 60 ||
    currentTimestamp - authDate > MAX_INIT_DATA_AGE_SECONDS
  ) {
    return { ok: false, error: "EXPIRED_INIT_DATA" };
  }

  params.delete("hash");

  const dataCheckString = [...params.entries()]
    .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();
  const expectedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest();
  const receivedHash = Buffer.from(hash, "hex");

  if (
    receivedHash.length !== expectedHash.length ||
    !crypto.timingSafeEqual(receivedHash, expectedHash)
  ) {
    return { ok: false, error: "INVALID_INIT_DATA" };
  }

  try {
    const user = JSON.parse(userRaw) as TelegramUser;

    if (!Number.isSafeInteger(user.id)) {
      return { ok: false, error: "INVALID_INIT_DATA" };
    }

    return { ok: true, user };
  } catch {
    return { ok: false, error: "INVALID_INIT_DATA" };
  }
}
