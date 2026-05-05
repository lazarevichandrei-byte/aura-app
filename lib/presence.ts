import { supabase } from "./supabase";

export const joinChatPresence = (chatId: string, userId: string) => {
  const channel = supabase.channel(`chat:${chatId}`, {
    config: {
      presence: {
        key: userId,
      },
    },
  });

  return channel;
};

export const trackOnline = (channel: any) => {
  channel.track({
    online: true,
    last_seen: new Date().toISOString(),
  });
};