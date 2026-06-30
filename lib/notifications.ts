import { supabase } from "./supabase";

export async function loadNotificationSettings() {

    const tg =
        (window as any)?.Telegram?.WebApp;

    const telegramId =
        tg?.initDataUnsafe?.user?.id;

    if (!telegramId) return null;

    const { data } =
        await supabase
            .from("users")
            .select(`
                notifications_enabled,
                notify_messages,
                notify_matches,
                notify_vibration,
                notify_silent
            `)
            .eq("telegram_id", telegramId)
            .single();

    return data;

}

export async function notifyMessage(
    title: string,
    body: string
) {

    const settings =
        await loadNotificationSettings();

    if (!settings) return;

    if (!settings.notifications_enabled) return;

    if (!settings.notify_messages) return;

    console.log("MESSAGE:", title, body);

}

export async function notifyMatch(
    title: string,
    body: string
) {

    const settings =
        await loadNotificationSettings();

    if (!settings) return;

    if (!settings.notifications_enabled) return;

    if (!settings.notify_matches) return;

    console.log("MATCH:", title, body);

}