"use client";

import {
useRouter,
usePathname
} from "next/navigation";

import {
useEffect,
useState
} from "react";

import { supabase }
from "../lib/supabase";
import { getTelegramInitData }
from "../lib/telegram-init-data";
import { useCurrentUser } from "../lib/useCurrentUser";
import {
  Home,
  MapPinned,
  MessageCircle,
  User
} from "lucide-react";

type Props = {
  hidden?: boolean;
};

export default function BottomNav({
  hidden = false,
}: Props){

const router = useRouter();
const pathname = usePathname();
const { user: currentUser } = useCurrentUser();

const [unread,setUnread] =
useState(
()=>{
if(
typeof window !==
"undefined"
){
return Number(
localStorage.getItem(
"navUnread"
) || 0
);
}
return 0;
}
);

useEffect(()=>{

router.prefetch("/chats");

loadUnread();

let channel =
supabase
.channel("nav-unread")
.on(
"postgres_changes",
{
event:"*",
schema:"public",
table:"chats"
},
()=>{
loadUnread();
}
);

if(currentUser?.id){
channel = channel.on(
  "postgres_changes",
  {
    event:"*",
    schema:"public",
    table:"chat_participants",
    filter:`user_id=eq.${currentUser.id}`
  },
  ()=>{loadUnread();}
);
}

channel.subscribe((status)=>{
if(status === "SUBSCRIBED" || status === "CHANNEL_ERROR" || status === "TIMED_OUT"){
loadUnread();
}
});

const handleReadStateUpdated = ()=>{
  void loadUnread();
};
window.addEventListener("chat-read-state-updated",handleReadStateUpdated);
const handleResume = ()=>{
  if(!document.hidden) void loadUnread();
};
document.addEventListener("visibilitychange",handleResume);
window.addEventListener("online",handleResume);

return ()=>{
window.removeEventListener("chat-read-state-updated",handleReadStateUpdated);
document.removeEventListener("visibilitychange",handleResume);
window.removeEventListener("online",handleResume);
supabase.removeChannel(
channel
);
};

},[currentUser?.id]);


async function loadUnread(){

const saveUnread = (value:number)=>{
  setUnread(value);
  localStorage.setItem("navUnread",String(value));
};

const initData = await getTelegramInitData();
if(!initData){
  saveUnread(0);
  return;
}

const response = await fetch("/api/chats",{
  method:"POST",
  headers:{"Content-Type":"application/json"},
  body:JSON.stringify({initData})
});

if(!response.ok){
  saveUnread(0);
  return;
}

const result = await response.json();
if(!result?.ok){
  saveUnread(0);
  return;
}

const totalUnread = (result.chats || []).reduce(
  (total, chat) => total + (chat.unread_count || 0),
  0
);

saveUnread(totalUnread);
}

const itemStyle = (active:boolean)=>({
flex:1,
height:"100%",
display:"flex",
flexDirection:"column" as const,
justifyContent:"center",
alignItems:"center",
gap:5,
fontSize:11,
fontWeight:500,
color: active ? "#2F80FF" : "#A7ADB8",
cursor:"pointer"
});

if (hidden) {
  return null;
}

return(
<div
style={{
position:"fixed",
bottom:0,
left:0,
right:0,
height:"calc(74px + env(safe-area-inset-bottom, 0px))",
background:"#fff",
borderTop:"1px solid #ECECEC",
display:"flex",
alignItems:"center",
paddingBottom:"env(safe-area-inset-bottom, 0px)",
zIndex:999
}}
>

<div
onClick={()=>router.push("/home")}
style={itemStyle(pathname==="/home")}
>
<Home size={28}/>
Главная
</div>


<div
onClick={()=>router.push("/meet")}
style={itemStyle(pathname==="/meet")}
>
<MapPinned size={28}/>
Встречи
</div>


<div
onClick={()=>router.push("/chats")}
style={itemStyle(pathname==="/chats")}
>
  <div style={{position:"relative",display:"grid",placeItems:"center"}}>
    <MessageCircle size={28}/>
    {unread > 0 && (
      <div style={{position:"absolute",top:-7,right:-10,minWidth:18,height:18,padding:"0 5px",borderRadius:9,background:"#2F80FF",color:"#fff",display:"grid",placeItems:"center",fontSize:10,fontWeight:800,border:"2px solid #fff",boxSizing:"border-box"}}>
        {unread > 99 ? "99+" : unread}
      </div>
    )}
  </div>
  Чаты
</div>



<div
onClick={()=>router.push("/account")}
style={itemStyle(pathname==="/account")}
>
<User size={28}/>
Профиль
</div>

</div>
)

}
