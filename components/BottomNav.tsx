"use client";

import {
useRouter,
usePathname
} from "next/navigation";

import {
useEffect,
useRef,
useState
} from "react";

import { supabase }
from "../lib/supabase";
import {loadChatsBootstrap} from "../lib/chats/bootstrap";
import { useCurrentUser } from "../lib/useCurrentUser";
import {
  Home,
  MapPinned,
  MessageCircle,
  User
} from "lucide-react";
import { useI18n } from "./I18nProvider";

type Props = {
  hidden?: boolean;
};

export default function BottomNav({
  hidden = false,
}: Props){

const router = useRouter();
const pathname = usePathname();
const { user: currentUser } = useCurrentUser();
const {t}=useI18n();

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
const unreadRequestSequence=useRef(0);

useEffect(()=>{

for(const route of ["/home","/meet","/chats","/account"])router.prefetch(route);

loadUnread();

if(!currentUser?.id)return;

let channel =
supabase
.channel(`nav-unread-${currentUser.id}`);

channel = channel
.on(
  "postgres_changes",
  {event:"*",schema:"public",table:"chats",filter:`user1_id=eq.${currentUser.id}`},
  ()=>{loadUnread(true);}
)
.on(
  "postgres_changes",
  {event:"*",schema:"public",table:"chats",filter:`user2_id=eq.${currentUser.id}`},
  ()=>{loadUnread(true);}
)
.on(
  "postgres_changes",
  {
    event:"*",
    schema:"public",
    table:"chat_participants",
    filter:`user_id=eq.${currentUser.id}`
  },
  ()=>{loadUnread(true);}
);

channel.subscribe((status)=>{
if(status === "SUBSCRIBED" || status === "CHANNEL_ERROR" || status === "TIMED_OUT"){
loadUnread(status!=="SUBSCRIBED");
}
});

const handleReadStateUpdated = ()=>{
  void loadUnread(true);
};
const handleChatMessage=()=>{void loadUnread(true);};
window.addEventListener("chat-read-state-updated",handleReadStateUpdated);
window.addEventListener("aura-chat-message",handleChatMessage);
const handleResume = ()=>{
  if(!document.hidden) void loadUnread(true);
};
document.addEventListener("visibilitychange",handleResume);
window.addEventListener("online",handleResume);

return ()=>{
window.removeEventListener("chat-read-state-updated",handleReadStateUpdated);
window.removeEventListener("aura-chat-message",handleChatMessage);
document.removeEventListener("visibilitychange",handleResume);
window.removeEventListener("online",handleResume);
supabase.removeChannel(
channel
);
};

},[currentUser?.id]);


async function loadUnread(force=false){

const sequence=++unreadRequestSequence.current;

const saveUnread = (value:number)=>{
  if(sequence!==unreadRequestSequence.current)return;
  setUnread(value);
  localStorage.setItem("navUnread",String(value));
};

const result=await loadChatsBootstrap({force}).catch(()=>null);
if(!result)return;

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
color: active ? "var(--primary)" : "var(--text-muted)",
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
background:"var(--nav-bg)",
borderTop:"1px solid var(--border)",
backdropFilter:"blur(18px)",
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
{t("navigation.home")}
</div>


<div
onClick={()=>router.push("/meet")}
style={itemStyle(pathname==="/meet")}
>
<MapPinned size={28}/>
{t("navigation.meet")}
</div>


<div
onClick={()=>router.push("/chats")}
style={itemStyle(pathname==="/chats")}
>
  <div style={{position:"relative",display:"grid",placeItems:"center"}}>
    <MessageCircle size={28}/>
    {unread > 0 && (
      <div style={{position:"absolute",top:-7,right:-10,minWidth:18,height:18,padding:"0 5px",borderRadius:9,background:"var(--accent)",color:"var(--text-inverse)",display:"grid",placeItems:"center",fontSize:10,fontWeight:800,border:"2px solid var(--nav-bg)",boxSizing:"border-box"}}>
        {unread > 99 ? "99+" : unread}
      </div>
    )}
  </div>
  {t("navigation.chats")}
</div>



<div
onClick={()=>router.push("/account")}
style={itemStyle(pathname==="/account")}
>
<User size={28}/>
{t("navigation.profile")}
</div>

</div>
)

}
