"use client";

import {
useEffect,
useState,
useRef
} from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import BottomNav from "../../components/BottomNav";

const matches = [
{img:"/girl1.jpg",name:"Алина"},
{img:"/girl2.jpg",name:"Мария"},
{img:"/girl3.jpg",name:"Екатерина"},
{img:"/girl4.jpg",name:"Полина"},
];

export default function Chats(){

const router = useRouter();

const [chats,setChats] =
useState<any[]>([]);
const [typingChats,setTypingChats] =
useState<any>({});
const reloadTimer =
useRef<any>(null);



useEffect(()=>{

queueMicrotask(
loadChats
);

const channel =
supabase
.channel("chats-live")
.on(
"postgres_changes",
{
event:"UPDATE",
schema:"public",
table:"chats"
},
()=>{

clearTimeout(
reloadTimer.current
);

reloadTimer.current=
setTimeout(()=>{
loadChats();
},250);

}
)
.subscribe();

return ()=>{
supabase.removeChannel(channel);
};

},[]);


useEffect(()=>{

const timer =

setInterval(()=>{

if(document.hidden){
return;
}


setTypingChats(prev=>{

if(
prev["22222222-2222-2222-2222-222222222222"]
) return prev;

return {
"22222222-2222-2222-2222-222222222222":true
};

});

setTimeout(()=>{
setTypingChats({});
},2200);

},7000);

return ()=>{
clearInterval(timer);
};

},[]);



async function loadChats(){

const {data,error} =
await supabase
.from("chats")
.select(
"id,name,avatar,last_message,last_message_at,unread_count"
)
.order(
"last_message_at",
{ascending:false}
)
.limit(30);

if(!error && data){
setChats(data);
}

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

{/* HEADER */}
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
fontSize:15,
color:"#A3A8B3"
}}
>
⌕ Поиск
</div>



{/* STORIES */}
<div
style={{
display:"flex",
gap:14,
overflowX:"auto",
marginTop:26,
paddingBottom:8
}}
>

<div style={{textAlign:"center"}}>
<div
style={{
width:68,
height:68,
borderRadius:"50%",
background:"#EEF4FF",
display:"flex",
alignItems:"center",
justifyContent:"center",
fontSize:30
}}
>
💙
</div>

<div
style={{
marginTop:6,
fontSize:13
}}
>
Мои пары
</div>
</div>


{matches.map((item,i)=>(

<div
key={i}
style={{textAlign:"center"}}
>

<div
style={{
position:"relative",
width:68,
height:68,
borderRadius:"50%",
padding:2.5,
border:"2px solid #2F80FF"
}}
>
<img
loading="lazy"
decoding="async"
src={item.img}
style={{
width:"100%",
height:"100%",
borderRadius:"50%",
objectFit:"cover"
}}
/>

{i < 3 && (
<div
style={{
position:"absolute",
right:-1,
bottom:4,
width:14,
height:14,
background:"#47C73B",
border:"2px solid #fff",
borderRadius:"50%"
}}
/>
)}

</div>

<div
style={{
fontSize:13,
marginTop:6
}}
>
{item.name}
</div>

</div>

))}

</div>



{/* CHAT LIST */}
<div
style={{
marginTop:20,
marginBottom:14,
padding:"14px 16px",
borderRadius:18,
background:
"linear-gradient(135deg,#EEF4FF,#F7F9FF)",
fontSize:15,
fontWeight:600,
color:"#2F80FF"
}}
>
✨ Новый мэтч сегодня
</div>

<div style={{marginTop:24}}>



{chats.map((chat,i)=>(

<div
key={chat.id}
onPointerDown={()=>
router.push(`/chat/${chat.id}`)
}
style={{
display:"flex",
alignItems:"center",

padding:"14px 14px",
marginBottom:8,

borderRadius:22,
background:"#fff",

boxShadow:
"0 1px 4px rgba(0,0,0,.03)",

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

<div
style={{
flex:1,
marginLeft:14
}}
>

<div
style={{
fontWeight:
chat.unread_count
?700
:600
}}
>
{chat.name}
</div>

<div
style={{
fontSize:15,
color:
typingChats[chat.id]
? "#2E7BFF"
: chat.unread_count
? "#2A2D34"
:"#8A8F9B",
marginTop:4
}}
>
{
typingChats[chat.id]
? "Печатает…"
: chat.last_message || "Начните общение ✨"
}
</div>

</div>


<div
style={{
display:"flex",
flexDirection:"column",
alignItems:"flex-end",
gap:10
}}
>

<div
style={{
fontSize:14,
color:"#A0A5B0"
}}
>
{
chat.last_message_at
? new Date(chat.last_message_at)
.toLocaleTimeString(
"ru-RU",
{
hour:"2-digit",
minute:"2-digit"
}
)
: ""
}
</div>

{chat.unread_count > 0 && (
<div
style={{
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
}}
>
{chat.unread_count}
</div>
)}

</div>

</div>

))}

</div>

<BottomNav/>

</div>
)
}

