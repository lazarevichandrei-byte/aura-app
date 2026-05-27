"use client";

import React,{
useEffect,
useState,
useRef
} from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
// import { joinChatPresence } from "../../lib/presence";
// import BottomNav from "../../components/BottomNav";



export default function Chats(){


const router = useRouter();



const [chats,setChats] =
useState<any[]>([]);
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

  async function loadMe(){

  const tg =
    (window as any)?.Telegram?.WebApp;

  console.log(
    "TG OBJECT FULL:",
    JSON.stringify(
      tg,
      null,
      2
    )
  );

  console.log(
    "INIT DATA:",
    tg?.initData
  );

  console.log(
    "INIT DATA LENGTH:",
    tg?.initData?.length
  );

  console.log(
    "INIT DATA UNSAFE:",
    tg?.initDataUnsafe
  );

  console.log(
    "USER:",
    tg?.initDataUnsafe?.user
  );

  if(!tg?.initData){

    console.log(
      "NO TELEGRAM INIT DATA"
    );

    return;

  }

  console.log(
    "INIT DATA OK"
  );


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

    console.log(
  "RESULT:",
  result
);

console.log(
  "CHATS:",
  result?.chats
);
   
    console.log(result.chats);

    if(!result?.ok || !result?.user){
      return;
    }

    setMyId(result.user.id);

localStorage.setItem(
  "aura_user_id",
  result.user.id
);

console.log(
  "CALL LOAD CHATS AFTER AUTH"
);

loadChats(result.user.id);

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




async function loadChats(forcedUserId?: string){

  console.log(
    "LOAD CHATS FUNCTION START"
  );

  const tg =
    (window as any).Telegram?.WebApp;

setTimeout(() => {

  console.log(
    "DELAYED INIT DATA:",
    tg?.initData
  );

  console.log(
    "DELAYED USER:",
    tg?.initDataUnsafe?.user
  );

}, 2000);

if(!tg?.initData){

  console.log(
    "NO TELEGRAM INIT DATA"
  );

  const debugUserId =
  forcedUserId ||
  localStorage.getItem(
    "aura_user_id"
  );

  if(!debugUserId){
    return;
  }

  const res = await fetch(
    "/api/chats",
    {
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body: JSON.stringify({
        userId: debugUserId
      })
    }
  );

  const result = await res.json();

  console.log(
    "DEBUG CHATS:",
    result
  );

  if(result?.ok){
    setChats(result.chats || []);
  }

  return;
}

console.log(
  "INIT DATA OK"
);

console.log(
  "FETCH CHATS"
);

  const res = await fetch(
    "/api/chats",
    {
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body: JSON.stringify({
  initData: tg.initData
})
    }
  ); 

  const result = await res.json();

  console.log(
  "RESULT CHATS:",
  JSON.stringify(
    result,
    null,
    2
  )
);

  console.log("TG OBJECT:", tg);

console.log(
  "AUTH STATUS:",
  res.status
);

  if(!result?.ok){
    return;
  }


  console.log(
  "CHATS DATA:",
  JSON.stringify(
    result.chats,
    null,
    2
  )
);

  setChats(result.chats || []);

  console.log(
  "CHATS COUNT:",
  result.chats?.length
);

}

return (
  <div
    style={{
      padding: 40,
      background: "#fff",
      minHeight: "100vh",
      color: "#000",
      fontSize: 24,
      fontWeight: 700
    }}
  >
    CHATS PAGE TEST
  </div>
);
}
