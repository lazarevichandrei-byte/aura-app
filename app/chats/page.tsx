"use client";

import React,{
useEffect,
useMemo,
useState,
useRef
} from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { joinChatPresence } from "../../lib/presence";
import BottomNav from "../../components/BottomNav";
import AuraLoader from "../../components/AuraLoader";
import { createChatIfNotExists } from "../../lib/chat/api";
import { useCurrentUser } from "../../lib/useCurrentUser";
import MeetCategoryAvatar from "../../components/meet/MeetCategoryAvatar";

const MAX_LIST_PRESENCE_CHATS = 20;

const chatTimestamp = (chat: any) =>
  new Date(chat.last_message_at || chat.created_at || 0).getTime();

const sortChats = (items: any[]) =>
  [...items].sort((left, right) => chatTimestamp(right) - chatTimestamp(left));


const ChatCard = React.memo(
function ChatCard({
chat,
typing,
router,
index
}:any){

const [pressed,setPressed] =
useState(false);




return(

<div
onPointerDown={()=>{
setPressed(true);

router.prefetch(
`/chat/${chat.id}`
);
}}

onPointerUp={()=>
setPressed(false)
}

onPointerLeave={()=>
setPressed(false)
}

onClick={()=>{
router.push(
`/chat/${chat.id}`
);
}}

style={{
display:"flex",
alignItems:"center",
padding:"14px 14px",
marginBottom:8,

borderRadius:22,

background:
pressed
? "var(--surface-secondary)"
: chat.unread_count > 0
  ? "#F3F8FF"
  : "#fff",

boxShadow: chat.unread_count > 0
  ? "0 4px 14px rgba(47,128,255,.08)"
  : "0 1px 4px rgba(0,0,0,.03)",

transition:
"background .15s ease",

opacity: 1,

animation:
chat.unread_count > 0
  ? `chatAppear .28s ease ${index * 35}ms both, unreadChatGlow 1.6s ease-out ${index * 35}ms`
  : `chatAppear .28s ease ${index * 35}ms both`,

cursor:"pointer"
}}
>

{chat.is_meet_chat ? (
  <MeetCategoryAvatar category={chat.event_category} size={60} />
) : (
  chat.avatar ? (
    <img
      loading="lazy"
      decoding="async"
      src={chat.avatar}
      style={{
        width:60,
        height:60,
        borderRadius:"50%",
        objectFit:"cover"
      }}
    />
  ) : (
    <div style={{width:60,height:60,borderRadius:"50%",background:"var(--surface-secondary)",display:"grid",placeItems:"center",fontSize:26,flexShrink:0}}>👤</div>
  )
)}

<div style={{
flex:1,
marginLeft:14
}}>

<div style={{
  fontWeight: chat.unread_count ? 750 : 600,
  color: "var(--text-primary)",
  display: "flex",
  alignItems: "center",
  gap: 6,
}}>
  {chat.is_meet_chat && (
    <span
      style={{
        fontSize: 14,
        lineHeight: 1,
      }}
    >
      📍
    </span>
  )}

  <span>
    {chat.is_meet_chat
      ? chat.event_title || "Встреча"
      : chat.name || "Без имени"}
  </span>
</div>

{chat.is_meet_chat && (
  <div
    style={{
      fontSize: 11,
      fontWeight: 600,
      color: "var(--primary)",
      marginTop: 2,
    }}
  >
    Встреча
  </div>
)}

<div
  style={{
    fontSize: 13,
    color: typing ? "var(--primary)" : "var(--text-secondary)",
    marginTop: chat.is_meet_chat ? 3 : 2,
  }}
>
  {typing
    ? "печатает..."
    : chat.last_message || ""}
</div>

</div>

<div style={{
display:"flex",
flexDirection:"column",
alignItems:"flex-end",
gap:10
}}>

<div style={{
fontSize:14,
color:"var(--text-muted)"
}}>
{
chat.last_message_at
? new Date(
chat.last_message_at
).toLocaleTimeString(
"ru-RU",
{
hour:"2-digit",
minute:"2-digit"
}
)
:""
}
</div>

{chat.unread_count>0 &&(
<div style={{
minWidth:20,
height:20,
padding:"0 6px",
borderRadius:10,
background:"var(--primary)",
color:"var(--text-inverse)",
display:"flex",
alignItems:"center",
justifyContent:"center",
fontSize:11,
fontWeight:700
}}>
{chat.unread_count}
</div>
)}

{chat.is_meet_chat && chat.pending_request_count > 0 && (
  <div style={{
    minHeight: 20,
    padding: "2px 7px",
    borderRadius: 10,
    background: "#FFF1E8",
    color: "#D96B20",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 10,
    fontWeight: 700,
    whiteSpace: "nowrap",
  }}>
    Заявки · {chat.pending_request_count}
  </div>
)}

</div>

</div>

)

});


<style>{`
@keyframes chatAppear{
from{
opacity:0;
transform:translateY(16px);
}
to{
opacity:1;
transform:translateY(0);
}
}
@keyframes unreadChatGlow{
0%{box-shadow:0 0 0 rgba(47,128,255,0)}
35%{box-shadow:0 5px 18px rgba(47,128,255,.15)}
100%{box-shadow:0 4px 14px rgba(47,128,255,.08)}
}
`}</style>


export default function Chats(){


const router = useRouter();
const { user: currentUser } = useCurrentUser();



const [chats,setChats] =
useState<any[]>([]);

const [loading,setLoading] =
useState(true);
const matches = chats.filter(c => c.is_new_match);

const [search,setSearch] =
useState("");
const searching =
search.trim().length > 0;

const reloadTimer =
useRef<any>(null);
const [typingChats,setTypingChats] =
useState<any>({});

const myId = currentUser?.id ?? null;

useEffect(() => {
  const nearestExpiration = chats.reduce<number | null>((nearest, chat) => {
    if (!chat.is_meet_chat || !chat.event_expires_at) return nearest;
    const expiresAt = new Date(chat.event_expires_at).getTime();
    if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) return nearest;
    return nearest === null || expiresAt < nearest ? expiresAt : nearest;
  }, null);
  if (nearestExpiration === null) return;

  const timer = window.setTimeout(() => {
    const now = Date.now();
    setChats((current) => current.filter(
      (chat) => !chat.is_meet_chat || !chat.event_expires_at || new Date(chat.event_expires_at).getTime() > now
    ));
  }, Math.max(0, nearestExpiration - Date.now() + 50));

  return () => window.clearTimeout(timer);
}, [chats]);

const channelsRef = useRef<Record<string, any>>({});
useEffect(()=>{
  loadChats();
},[]);


const presenceChatIds = useMemo(
  () => chats.slice(0, MAX_LIST_PRESENCE_CHATS).map((chat) => chat.id).sort(),
  [chats]
);
const presenceKey = presenceChatIds.join("|");
useEffect(() => {
  if (!presenceChatIds.length) return;

  presenceChatIds.forEach((chatId) => {
    if (channelsRef.current[chatId]) return;

    const channel = joinChatPresence(chatId, "list");

    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState();

      let isTyping = false;

      Object.values(state).forEach((list: any) => {
        list.forEach((p: any) => {
          if (p.typing) {
            isTyping = true;
          }
        });
      });

      setTypingChats((prev: any) => ({
        ...prev,
        [chatId]: isTyping,
      }));
    });

    channel.subscribe();

    channelsRef.current[chatId] = channel;
  });

  return () => {
    Object.values(channelsRef.current).forEach((ch: any) => {
      ch.unsubscribe();
    });
    channelsRef.current = {};
  };
}, [presenceKey]);

useEffect(() => {
  if (!myId) return;
  const handleMessage = (event:Event) => {
        const message = (event as CustomEvent<any>).detail;
        if(!message) return;
        setChats((current) => sortChats(current.map((chat) =>
          chat.id === message.chat_id
            ? {
                ...chat,
                last_message: message.body || "",
                last_message_at: message.created_at,
                unread_count: message.sender_id === myId
                  ? chat.unread_count || 0
                  : chat.last_message_at === message.created_at
                    ? chat.unread_count || 0
                    : (chat.unread_count || 0) + 1,
              }
            : chat
        )));
  };
  window.addEventListener("aura-chat-message",handleMessage);

  return () => {
    window.removeEventListener("aura-chat-message",handleMessage);
  };
}, [myId]);


useEffect(() => {

  const handler = (e:any) => {

    const detail = e.detail;

    if(!detail) return;

    setChats(prev => {

      const updated = prev.map((chat:any)=>{

        if(chat.id !== detail.chatId){
          return chat;
        }

        return {
          ...chat,
          last_message: detail.message,
          last_message_at: new Date().toISOString()
        };

      });

      return sortChats(updated);

    });

  };

  window.addEventListener(
    "chat-updated",
    handler
  );

  return () => {

    window.removeEventListener(
      "chat-updated",
      handler
    );

  };

}, []);

useEffect(() => {
  const handleReadStateUpdated = (event:Event) => {
    const detail = (event as CustomEvent<{chatId?:string}>).detail;
    if(!detail?.chatId) return;
    setChats((current)=>current.map((chat)=>
      chat.id === detail.chatId
        ? {...chat,unread_count:0}
        : chat
    ));
  };
  window.addEventListener("chat-read-state-updated",handleReadStateUpdated);
  return ()=>window.removeEventListener("chat-read-state-updated",handleReadStateUpdated);
},[]);

useEffect(()=>{

  if(!myId) return;

  const channel = supabase
    .channel(`chats-${myId}`)
    .on(
      "postgres_changes",
      {
        event:"*",
        schema:"public",
        table:"chats",
        filter:`user1_id=eq.${myId}`,
      },
      () => {
        window.clearTimeout(reloadTimer.current);
        reloadTimer.current = window.setTimeout(
          () => loadChats(false),
          250
        );
      }
    )
    .on(
      "postgres_changes",
      {
        event:"*",
        schema:"public",
        table:"chats",
        filter:`user2_id=eq.${myId}`,
      },
      () => {
        window.clearTimeout(reloadTimer.current);
        reloadTimer.current = window.setTimeout(
          () => loadChats(false),
          250
        );
      }
    )
    .subscribe((status) => {
      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        window.clearTimeout(reloadTimer.current);
        reloadTimer.current = window.setTimeout(() => loadChats(false), 250);
      }
    });

  return ()=>{

    supabase.removeChannel(channel);
    window.clearTimeout(reloadTimer.current);

  };

},[myId]);

useEffect(()=>{
  if(!myId) return;

  const channel = supabase
    .channel(`chat-memberships-${myId}`)
    .on(
      "postgres_changes",
      {
        event:"*",
        schema:"public",
        table:"chat_participants",
        filter:`user_id=eq.${myId}`,
      },
      ()=>{
        window.clearTimeout(reloadTimer.current);
        reloadTimer.current = window.setTimeout(()=>loadChats(false),150);
      }
    )
    .subscribe((status)=>{
      if(status === "SUBSCRIBED" || status === "CHANNEL_ERROR" || status === "TIMED_OUT"){
        window.clearTimeout(reloadTimer.current);
        reloadTimer.current = window.setTimeout(()=>loadChats(false),150);
      }
    });

  return ()=>{
    void supabase.removeChannel(channel);
    window.clearTimeout(reloadTimer.current);
  };
},[myId]);

useEffect(()=>{
  const reconcile = ()=>{
    if(!document.hidden) void loadChats(false);
  };
  document.addEventListener("visibilitychange",reconcile);
  window.addEventListener("online",reconcile);
  return ()=>{
    document.removeEventListener("visibilitychange",reconcile);
    window.removeEventListener("online",reconcile);
  };
},[]);

const creatorMeetEventIds = useMemo(
  () => chats
    .filter((chat) => chat.is_meet_chat && chat.is_meet_creator && chat.event_id)
    .map((chat) => chat.event_id)
    .sort(),
  [chats]
);
const creatorMeetEventsKey = creatorMeetEventIds.join("|");

useEffect(() => {
  if (!myId || !creatorMeetEventIds.length) return;

  let channel = supabase.channel(`chat-list-meet-requests-${myId}`);
  const reload = () => {
    window.clearTimeout(reloadTimer.current);
    reloadTimer.current = window.setTimeout(() => loadChats(false), 250);
  };
  creatorMeetEventIds.forEach((eventId) => {
    channel = channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "meet_join_requests",
        filter: `event_id=eq.${eventId}`,
      },
      reload
    );
  });
  channel.subscribe();

  return () => {
    void supabase.removeChannel(channel);
    window.clearTimeout(reloadTimer.current);
  };
}, [creatorMeetEventsKey, myId]);



const filteredChats =
chats.filter(chat=>
(chat?.name || "")
.toLowerCase()
.includes(
search.toLowerCase()
)
);

const sortedChats = sortChats(filteredChats);







async function loadChats(showLoader = true){

  if (showLoader) {
    setLoading(true);
  }

  try{

    const tg =
      (window as any)?.Telegram?.WebApp;

    if(!tg?.initData){
      return;
    }

    const res = await fetch(
      "/api/chats",
      {
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          initData: tg.initData
        })
      }
    );

    const result = await res.json();

    if(!result?.ok){
      return;
    }

  setChats(sortChats(result.chats || []));



  } finally {

    if (showLoader) {
      setLoading(false);
    }

  }

}


function EmptyChats() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 20px",
        textAlign: "center"
      }}
    >
      <div
        style={{
          fontSize: 30
        }}
      >
        💬
      </div>

      <div
        style={{
          marginTop: 10,
fontSize: 16,
fontWeight: 600,
          color: "var(--text-primary)"
        }}
      >
        Пока нет сообщений
      </div>

      <div
        style={{
          marginTop: 4,
fontSize: 12,
          color: "var(--text-secondary)",
          lineHeight: 1.5
        }}
      >
        Начни знакомиться ❤️
      </div>

      <button
        onClick={() => router.push("/home")}
        style={{
          marginTop: 16,
          height: 42,
          padding: "0 20px",
          border: "none",
          borderRadius: 999,
          background: "var(--primary)",
          color: "var(--text-inverse)",
          fontWeight: 600,
          cursor: "pointer"
        }}
      >
        Начать знакомиться
      </button>
    </div>
  );
}

if (loading) {

  return (

    <AuraLoader
      compact
      text="Загрузка чатов..."
    />

  );

}

return(

    
<div
style={{
height:"100dvh",

overflowY:"auto",
WebkitOverflowScrolling:"touch",

background:"var(--app-bg)",
color:"var(--text-primary)",

padding:"8px 16px 130px",

maxWidth:"430px",
margin:"0 auto"
}}
>

  

{/* STORIES */}
<div
style={{
display:"flex",
alignItems:"center",
marginBottom:3
}}
>
<h1
style={{
margin:0,
fontSize:25,
fontWeight:700,
letterSpacing:"-.8px"
}}
>
Чаты
</h1>


</div>


{/* SEARCH */}
<div
style={{
marginTop:8,
height:42,
borderRadius:14,
background:"var(--input-bg)",
display:"flex",
alignItems:"center",
padding:"0 14px",
gap:8
}}
>

<span
style={{
fontSize:15,
color:"var(--text-muted)"
}}
>
⌕
</span>

<input
value={search}
onChange={(e)=>
setSearch(
e.target.value
)
}
placeholder="Поиск"

style={{
flex:1,
border:"none",
outline:"none",
background:"transparent",
fontSize:15
}}
/>

</div>



{/* STORIES */}
{/* STORIES */}
{!searching && (
  <div
    style={{
      display: "flex",
      gap: 14,
      overflowX: "auto",
      marginTop: 26,
      paddingBottom: 8,
    }}
  >
    {/* ЛАЙКИ */}
    <div style={{ textAlign: "center" }}>
      <div
        onClick={() => router.push("/likes")}
        style={{
          position: "relative",
          width: 68,
          height: 68,
          borderRadius: "50%",
          overflow: "hidden",
          border: "2px solid #2F80FF",
          cursor: "pointer",
        }}
      >
        <img
          src="/girl1.jpg"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "blur(8px)",
          }}
        />

        <div
          style={{
            position: "absolute",
            right: -4,
            top: -4,
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: "var(--primary)",
            color: "var(--text-inverse)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            fontWeight: 700,
            border: "2px solid var(--surface)",
          }}
        >
          12
        </div>
      </div>

      <div style={{ marginTop: 6, fontSize: 12, fontWeight: 600 }}>
        Тебя лайкнули
      </div>
    </div>

    {/* MATCHES */}
    {matches.map((chat) => (
      <div
        key={chat.id}
        onClick={async () => {
          if (!myId) return;

          setChats((prev) =>
  prev.map((c) =>
    c.id === chat.id
      ? {
          ...c,
          is_new_match: false,
          unread_count: 0
        }
      : c
  )
);

          const { data, error } = await supabase
  .from("chats")
  .update({
    is_new_match: false,
    unread_count: 0
  })
  .eq("id", chat.id)
  .select();

console.log("UPDATE RESULT:", data);
console.log("UPDATE ERROR:", error);

          router.push(`/chat/${chat.id}`);
        }}
        style={{
          textAlign: "center",
          cursor: "pointer",
        }}
      >
        <div
          style={{
            position: "relative",
            width: 68,
            height: 68,
            borderRadius: "50%",
            padding: 2.5,
            border: chat.is_new_match
              ? "2px solid var(--primary)"
              : "2px solid var(--border)",
          }}
        >
          {chat.avatar ? (
            <img
              src={chat.avatar}
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div style={{width:"100%",height:"100%",borderRadius:"50%",background:"var(--surface-secondary)",display:"grid",placeItems:"center",fontSize:28}}>👤</div>
          )}

          <div
            style={{
              position: "absolute",
              right: -1,
              bottom: 4,
              width: 14,
              height: 14,
              background: "#47C73B",
              border: "2px solid var(--surface)",
              borderRadius: "50%",
            }}
          />
        </div>

        <div style={{ fontSize: 13, marginTop: 6 }}>
          {chat.name || "Без имени"}
        </div>
      </div>
    ))}
  </div>
)}

{/* LIST */}
<div
  style={{
    marginTop: searching ? 12 : 24,
  }}
>
  {searching && (
    <div
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: "var(--text-secondary)",
        marginBottom: 10,
      }}
    >
      Результаты
    </div>
  )}

  {sortedChats.length === 0 && !searching ? (
  <EmptyChats />
) : (
  sortedChats.map((chat, index) => (
    <ChatCard
  key={chat.id}
  chat={chat}
  typing={typingChats[chat.id]}
  router={router}
  index={index}
/>
  ))
)}

  {searching && !filteredChats.length && (
    <div
      style={{
        padding: "30px 0",
        textAlign: "center",
        fontSize: 14,
        color: "var(--text-muted)",
      }}
    >
      Никого не найдено
    </div>
  )}
</div>

<BottomNav />

</div>
)
}
