"use client";

import React,{
useEffect,
useState,
useRef
} from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { joinChatPresence } from "../../lib/presence";
import BottomNav from "../../components/BottomNav";
import AuraLoader from "../../components/AuraLoader";


const ChatCard = React.memo(
function ChatCard({
chat,
typing,
router
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
? "#F2F4F7"
: "#fff",

boxShadow:
"0 1px 4px rgba(0,0,0,.03)",

transition:
"background .15s ease",

cursor:"pointer"
}}
>

<img
loading="lazy"
decoding="async"
src={chat.avatar || "/girl1.jpg"}
style={{
width:60,
height:60,
borderRadius:"50%",
objectFit:"cover"
}}
/>

<div style={{
flex:1,
marginLeft:14
}}>

<div style={{
fontWeight:
chat.unread_count
?700
:600
}}>
{chat.name || "Без имени"}
</div>

<div style={{
fontSize:13,
color: typing ? "#2F80FF" : "#8A8F9B",
marginTop:2
}}>
{typing ? "печатает..." : chat.last_message || ""}
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
color:"#A0A5B0"
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
background:"#2F80FF",
color:"#fff",
display:"flex",
alignItems:"center",
justifyContent:"center",
fontSize:11,
fontWeight:700
}}>
{chat.unread_count}
</div>
)}

</div>

</div>

)

});
export default function Chats(){


const router = useRouter();



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
const [myId,setMyId] = useState<string | null>(null);

const channelsRef = useRef<Record<string, any>>({});
useEffect(()=>{
  loadChats();
},[]);


useEffect(() => {
  if (!chats?.length) return;

  chats.forEach((chat) => {
    if (channelsRef.current[chat.id]) return;

    const channel = joinChatPresence(chat.id, "list");

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
        [chat.id]: isTyping,
      }));
    });

    channel.subscribe();

    channelsRef.current[chat.id] = channel;
  });

  return () => {
    Object.values(channelsRef.current).forEach((ch: any) => {
      ch.unsubscribe();
    });
    channelsRef.current = {};
  };
}, [chats]);



useEffect(()=>{

  async function loadMe(){

    const tg =
      (window as any)?.Telegram?.WebApp;

    if(!tg?.initData){
      return;
    }

    const res = await fetch(
      "/api/auth/telegram",
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

    if(!result?.ok || !result?.user){
      return;
    }

    setMyId(result.user.id);
    localStorage.setItem(
  "aura_user_id",
  result.user.id
);

  }

  loadMe();

},[]);


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

      return updated.sort((a:any,b:any)=>

        new Date(
          b.last_message_at || 0
        ).getTime()

        -

        new Date(
          a.last_message_at || 0
        ).getTime()

      );

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

useEffect(()=>{

  if(!myId) return;

  const channel = supabase
    .channel(`chats-${myId}`)
    .on(
      "postgres_changes",
      {
        event:"*",
        schema:"public",
        table:"chats"
      },
      ()=>{

        loadChats();

      }
    )
    .subscribe();

  return ()=>{

    supabase.removeChannel(channel);

  };

},[myId]);



const filteredChats =
chats.filter(chat=>
(chat?.name || "")
.toLowerCase()
.includes(
search.toLowerCase()
)
);

const sortedChats = [...filteredChats].sort((a, b) => {

  if ((b.liked_by ? 1 : 0) !== (a.liked_by ? 1 : 0)) {
    return (b.liked_by ? 1 : 0) - (a.liked_by ? 1 : 0);
  }

  const tA = new Date(a.last_message_at || 0).getTime();
  const tB = new Date(b.last_message_at || 0).getTime();

  return tB - tA;
});


async function createChatIfNotExists(userA: string, userB: string){

  const { data: existing } = 
  await supabase
  .from("chats")
  .select("id")
  .or(`and(user1_id.eq.${userA},user2_id.eq.${userB}),and(user1_id.eq.${userB},user2_id.eq.${userA})`)
  .maybeSingle();

  if (existing) return existing.id;

  const { data, error } = 
  await supabase
  .from("chats")
  .insert({
    user1_id: userA,
    user2_id: userB,
    last_message: "",
    liked_by: true,
    is_new_match: true
  })
  .select()
  .single();

  if(error){
    console.log("CREATE CHAT ERROR:", error);
    return null;
  }

  return data.id;
}




async function loadChats(){

  setLoading(true);

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

    setChats(result.chats || []);

  } finally {

    setLoading(false);

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
        padding: "56px 20px",
        textAlign: "center"
      }}
    >
      <div
        style={{
          fontSize: 52
        }}
      >
        💬
      </div>

      <div
        style={{
          marginTop: 18,
          fontSize: 20,
fontWeight: 700,
          color: "#1F2937"
        }}
      >
        Пока нет сообщений
      </div>

      <div
        style={{
          marginTop: 10,
          fontSize: 14,
          color: "#8A8F9B",
          lineHeight: 1.5
        }}
      >
        Начни знакомиться ❤️
      </div>

      <button
        onClick={() => router.push("/home")}
        style={{
          marginTop: 28,
          height: 48,
          padding: "0 26px",
          border: "none",
          borderRadius: 999,
          background: "#2F80FF",
          color: "#fff",
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

background:"#FCFCFE",

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
background:"#F4F4F8",
display:"flex",
alignItems:"center",
padding:"0 14px",
gap:8
}}
>

<span
style={{
fontSize:15,
color:"#A3A8B3"
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
            background: "#2F80FF",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            fontWeight: 700,
            border: "2px solid #fff",
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
              ? "2px solid #2F80FF"
              : "2px solid #E6EBF3",
          }}
        >
          <img
            src={chat.avatar || "/girl1.jpg"}
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />

          <div
            style={{
              position: "absolute",
              right: -1,
              bottom: 4,
              width: 14,
              height: 14,
              background: "#47C73B",
              border: "2px solid #fff",
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
        color: "#8A8F9B",
        marginBottom: 10,
      }}
    >
      Результаты
    </div>
  )}

  {sortedChats.length === 0 && !searching ? (
  <EmptyChats />
) : (
  sortedChats.map((chat) => (
    <ChatCard
      key={chat.id}
      chat={chat}
      typing={typingChats[chat.id]}
      router={router}
    />
  ))
)}

  {searching && !filteredChats.length && (
    <div
      style={{
        padding: "30px 0",
        textAlign: "center",
        fontSize: 14,
        color: "#9AA3AF",
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