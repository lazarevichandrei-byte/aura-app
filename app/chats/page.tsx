"use client";

import React,{
useEffect,
useState,
useRef
} from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import BottomNav from "../../components/BottomNav";

const [matches,setMatches] =
useState([
{
img:"/girl1.jpg",
name:"Алина",
online:true,
unread:2,
newMatch:true
},
{
img:"/girl2.jpg",
name:"Мария",
online:true,
unread:1,
newMatch:true
},
{
img:"/girl3.jpg",
name:"Екатерина",
online:false,
unread:0,
newMatch:false
},
{
img:"/girl4.jpg",
name:"Полина",
online:true,
unread:0,
newMatch:false
}
]);
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
{chat.name}
</div>

<div style={{
fontSize:15,
marginTop:4,
color:
typing
? "#2E7BFF"
: chat.unread_count
? "#2A2D34"
:"#8A8F9B"
}}>
{
typing
? "Печатает…"
: chat.last_message ||
"Начните общение ✨"
}
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
const [search,setSearch] =
useState("");
const searching =
search.trim().length > 0;
const [typingChats,setTypingChats] =
useState<any>({});
const reloadTimer =
useRef<any>(null);



useEffect(()=>{

loadChats();

const channel =
supabase
.channel("chats-live")
.on(
"postgres_changes",
{
event:"*",
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
},150);

}
)
.subscribe();

return ()=>{
supabase.removeChannel(channel);
};

},[]);

const filteredChats =
chats.filter(chat=>
(chat?.name || "")
.toLowerCase()
.includes(
search.toLowerCase()
)
);







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

const { data, error } =
await supabase
.from("chats")
.select(
"id,name,avatar,unread_count,last_message,last_message_at"
)
.order(
"last_message_at",
{ ascending:false }
)
.limit(30);

if(!error && data){
setChats(data || []);
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
{!searching && (

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
onClick={()=>{
alert("Новый мэтч 💙");
}}
style={{
width:68,
height:68,
borderRadius:"50%",

background:
"linear-gradient(135deg,#59A8FF,#2E7BFF)",

display:"flex",
alignItems:"center",
justifyContent:"center",

fontSize:34,
fontWeight:300,
color:"#fff",

cursor:"pointer"
}}
>
＋
</div>

<div
style={{
marginTop:6,
fontSize:13
}}
>
Новый мэтч
</div>
</div>


{matches.map((item,i)=>(

<div
key={i}
onClick={()=>{

setMatches(prev =>
prev.map((m,index)=>
index===i
? {
...m,
newMatch:false
}
: m
)
);

router.push(
`/chat/${i+1}`
);

}}
style={{
textAlign:"center",
cursor:"pointer"
}}
>

<div
style={{
position:"relative",
width:68,
height:68,
borderRadius:"50%",
padding:2.5,
border: item.newMatch
? "2px solid #2F80FF"
: "2px solid #E6EBF3"
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

{item.online && (
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
)}




<div style={{
marginTop:
searching ? 12 : 24
}}>


{searching && (
<div style={{
fontSize:13,
fontWeight:600,
color:"#8A8F9B",
marginBottom:10
}}>
Результаты
</div>
)}

{filteredChats.map(chat=>(
<ChatCard
key={chat.id}
chat={chat}
typing={typingChats[chat.id]}
router={router}
/>
))}


{searching &&
!filteredChats.length && (
<div
style={{
padding:"30px 0",
textAlign:"center",
fontSize:14,
color:"#9AA3AF"
}}
>
Никого не найдено
</div>
)}
</div>

<BottomNav/>

</div>
)
}

