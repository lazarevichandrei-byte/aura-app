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