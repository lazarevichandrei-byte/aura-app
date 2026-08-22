import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabase-admin";
import { validateTelegramInitData } from "../../../lib/telegram-auth";
export const runtime = "nodejs";

export async function POST(req: Request){

  try{

    const body = await req.json();

    const initData = body?.initData;
    const action = typeof body?.action === "string" ? body.action : "load";
    const requestedChatId = typeof body?.chatId === "string" ? body.chatId : "";

    if(!initData){
      return NextResponse.json(
        { ok:false },
        { status:400 }
      );
    }

    const validation = validateTelegramInitData(initData);

if (validation.ok === false) {
  return NextResponse.json(
    {
      ok: false,
      error: validation.error,
    },
    {
      status:
        validation.error === "BOT_TOKEN_MISSING"
          ? 500
          : 403,
    }
  );
}

    const telegramId = validation.user.id;

    const { data:user } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq(
          "telegram_id",
          telegramId
        )
        .single();

    if(!user){

      return NextResponse.json(
        { ok:false },
        { status:404 }
      );

    }

    if(action==="hide"||action==="seen"){
      if(!requestedChatId)return NextResponse.json({ok:false,error:"MISSING_CHAT_ID"},{status:400});
      const {data:directChat,error:chatError}=await supabaseAdmin.from("chats").select("id,event_id,user1_id,user2_id").eq("id",requestedChatId).maybeSingle();
      if(chatError)throw chatError;
      if(!directChat||directChat.event_id||![directChat.user1_id,directChat.user2_id].includes(user.id))return NextResponse.json({ok:false,error:"CHAT_ACCESS_DENIED"},{status:403});
      const timestamp=new Date().toISOString();
      const stateResult=action==="hide"
        ? await supabaseAdmin.from("chat_user_state").upsert({chat_id:directChat.id,user_id:user.id,hidden_at:timestamp,updated_at:timestamp},{onConflict:"chat_id,user_id"})
        : await supabaseAdmin.from("chat_user_state").upsert({chat_id:directChat.id,user_id:user.id,hidden_at:null,match_seen_at:timestamp,updated_at:timestamp},{onConflict:"chat_id,user_id"});
      const stateError=stateResult.error;
      if(stateError)throw stateError;
      return NextResponse.json({ok:true});
    }
    if(action!=="load")return NextResponse.json({ok:false,error:"UNKNOWN_ACTION"},{status:400});

   const [{ data: personalChats }, { data: participantRows }] = await Promise.all([
     supabaseAdmin
       .from("chats")
       .select("id,event_id,user1_id,user2_id,last_message,last_message_at,created_at,unread_count,has_messages,liked_by,is_new_match")
       .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`),
     supabaseAdmin
       .from("chat_participants")
       .select("chat_id,chats!inner(id,event_id,user1_id,user2_id,last_message,last_message_at,created_at,unread_count,has_messages,liked_by,is_new_match)")
       .eq("user_id", user.id)
       .not("chats.event_id", "is", null),
   ]);

const meetChats = (participantRows || [])
  .map((row) => Array.isArray(row.chats) ? row.chats[0] : row.chats)
  .filter(Boolean);

const allChatsRaw = [
  ...(personalChats || []),
  ...(meetChats || [])
]
  .filter(
    (chat, index, array) =>
      array.findIndex(
        (item) => item.id === chat.id
      ) === index
  )
  .sort(
    (a, b) =>
      new Date(b.last_message_at || b.created_at || 0).getTime() -
      new Date(a.last_message_at || a.created_at || 0).getTime()
  );

    const allChatIds = allChatsRaw.map((chat) => chat.id);
    const {data:chatStateRows,error:chatStateError}=allChatIds.length
      ? await supabaseAdmin.from("chat_user_state").select("chat_id,hidden_at,new_match_at,match_seen_at").eq("user_id",user.id).in("chat_id",allChatIds)
      : {data:[],error:null};
    if(chatStateError)throw chatStateError;
    const stateByChat=new Map((chatStateRows??[]).map((state)=>[state.chat_id,state]));
    const chatsRaw=allChatsRaw.filter((chat)=>chat.event_id||!stateByChat.get(chat.id)?.hidden_at);
    const chatIds = chatsRaw.map((chat) => chat.id);
    const { data: personalizedUnreadRows, error: unreadError } = chatIds.length
      ? await supabaseAdmin.rpc("get_chat_unread_counts", {
          p_user_id: user.id,
          p_chat_ids: chatIds,
        })
      : { data: [], error: null };

    if (unreadError) {
      console.warn("CHATS UNREAD FALLBACK:", {
        currentUserId: user.id,
        code: unreadError.code,
        message: unreadError.message,
      });
    }

    const unreadRows = unreadError ? [] : personalizedUnreadRows || [];

    const unreadByChat = new Map<string, number>();
    for (const row of unreadRows || []) {
      unreadByChat.set(row.chat_id, Number(row.unread_count) || 0);
    }


  const meetEventIds = [
  ...new Set(
    (chatsRaw || [])
      .filter((chat) => chat.event_id)
      .map((chat) => chat.event_id)
  )
];

    const otherUserIds = [...new Set(
      (chatsRaw || []).map((chat) =>
        chat.user1_id === user.id ? chat.user2_id : chat.user1_id
      ).filter(Boolean)
    )];

    const [meetEventsResult, otherUsersResult] = await Promise.all([
      meetEventIds.length
        ? supabaseAdmin
            .from("meet_events")
            .select("id,title,category,creator_id,is_active,expires_at,starts_at,place")
            .in("id", meetEventIds)
        : Promise.resolve({ data: [] }),
      otherUserIds.length
        ? supabaseAdmin
            .from("users")
            .select("id,name,avatar_url")
            .in("id", otherUserIds)
        : Promise.resolve({ data: [] }),
    ]);
    const meetEvents = meetEventsResult.data;
    const otherUsers = otherUsersResult.data;

    const now = Date.now();
    const activeMeetEvents = (meetEvents || []).filter(
      (event) => event.is_active && new Date(event.expires_at).getTime() > now
    );
    const meetEventsById = new Map(
      activeMeetEvents.map(
        (event) => [event.id, event]
      )
    );

    const usersById = new Map(
      (otherUsers || []).map((otherUser) => [otherUser.id, otherUser])
    );

    const creatorEventIds = activeMeetEvents
      .filter((event) => event.creator_id === user.id)
      .map((event) => event.id);
    const { data: pendingRequestRows, error: pendingRequestError } = creatorEventIds.length
      ? await supabaseAdmin
          .from("meet_join_requests")
          .select("event_id")
          .in("event_id", creatorEventIds)
          .eq("status", "pending")
      : { data: [], error: null };
    if (pendingRequestError) throw pendingRequestError;
    const pendingRequestsByEvent = new Map<string, number>();
    for (const request of pendingRequestRows || []) {
      pendingRequestsByEvent.set(
        request.event_id,
        (pendingRequestsByEvent.get(request.event_id) ?? 0) + 1
      );
    }

    const chats = (chatsRaw || [])
      .filter((chat) => !chat.event_id || meetEventsById.has(chat.event_id))
      .map((chat) => {

  const isMeetChat =
    Boolean(chat.event_id);

  if (isMeetChat) {

    const event =
      meetEventsById.get(
        chat.event_id
      );

    return {
      ...chat,
      unread_count: unreadByChat.get(chat.id) ?? 0,

      is_meet_chat: true,

      event_id: chat.event_id,

      event_title:
        event?.title || "Встреча",

      event_category:
        event?.category || null,

      event_expires_at: event?.expires_at,

      event_starts_at: event?.starts_at,

      event_place: event?.place,

      name:
        event?.title || "Встреча",

      avatar: null,

      category_avatar:
        event?.category || "other",

      pending_request_count:
        event?.creator_id === user.id
          ? pendingRequestsByEvent.get(chat.event_id) ?? 0
          : 0,

      is_meet_creator: event?.creator_id === user.id
    };
  }

  const otherUserId =
    chat.user1_id === user.id
      ? chat.user2_id
      : chat.user1_id;

  const otherUser =
    usersById.get(otherUserId);

  return {
    ...chat,
    unread_count: unreadByChat.get(chat.id) ?? 0,
    is_new_match: Boolean(stateByChat.get(chat.id)?.new_match_at&&(!stateByChat.get(chat.id)?.match_seen_at||new Date(stateByChat.get(chat.id)!.new_match_at!).getTime()>new Date(stateByChat.get(chat.id)!.match_seen_at!).getTime())),

    is_meet_chat: false,

    name:
      otherUser?.name || "Без имени",

    avatar:
      otherUser?.avatar_url || null
  };

})
  .sort(
    (left, right) =>
      new Date(right.last_message_at || right.created_at || 0).getTime() -
      new Date(left.last_message_at || left.created_at || 0).getTime()
  );
    return NextResponse.json({
      ok:true,
      chats
    });

 }catch(e){

  console.log("CHATS ERROR:", e);

  return NextResponse.json(
    { ok:false },
    { status:500 }
  );

}

}
