export function impact(
  style: "light" | "medium" | "heavy" = "light"
) {
  const tg = (window as any)?.Telegram?.WebApp;

  tg?.HapticFeedback?.impactOccurred(style);
}

export function success() {
  const tg = (window as any)?.Telegram?.WebApp;

  tg?.HapticFeedback?.notificationOccurred(
    "success"
  );
}

export function error() {
  const tg = (window as any)?.Telegram?.WebApp;

  tg?.HapticFeedback?.notificationOccurred(
    "error"
  );
}

export function warning() {
  const tg = (window as any)?.Telegram?.WebApp;

  tg?.HapticFeedback?.notificationOccurred(
    "warning"
  );
}

export function selection() {
  const tg = (window as any)?.Telegram?.WebApp;

  tg?.HapticFeedback?.selectionChanged();
}