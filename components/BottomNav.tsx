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
import { Home, Search, Heart, User } from "lucide-react";

export default function BottomNav(){

const router = useRouter();
const pathname = usePathname();

const [unread,setUnread] =
useState(3);

useEffect(()=>{

loadUnread();

const channel =
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
)
.subscribe();

return ()=>{
supabase.removeChannel(
channel
);
};

},[]);


async function loadUnread(){

const { data } =
await supabase
.from("messages")
.select("id")
.eq(
"is_read",
false
);

setUnread(
data?.length || 0
);

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

return(
<div
style={{
position:"fixed",
bottom:0,
left:0,
right:0,
height:82,
background:"#fff",
borderTop:"1px solid #ECECEC",
display:"flex",
alignItems:"center",
paddingBottom:8,
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
onClick={()=>router.push("/discover")}
style={itemStyle(pathname==="/discover")}
>
<Search size={28}/>
Поиск
</div>


<div
onClick={()=>router.push("/chats")}
style={{
...itemStyle(
pathname==="/chats"
),
position:"relative"
}}
>

<Heart size={28}/>

{unread > 0 && (
<div
style={{
position:"absolute",
top:6,
right:"22%",

minWidth:20,
height:20,

padding:"0 5px",

borderRadius:10,

background:"#2F80FF",
color:"#fff",

display:"flex",
alignItems:"center",
justifyContent:"center",

fontSize:11,
fontWeight:700
}}
>
{unread > 9 ? "9+" : unread}
</div>
)}

Чаты
</div>


<div
onClick={()=>router.push("/profile")}
style={itemStyle(pathname==="/profile")}
>
<User size={28}/>
Профиль
</div>

</div>
)

}