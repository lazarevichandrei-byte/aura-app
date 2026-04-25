"use client";


import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function ChatPage(){

const router = useRouter();

const chatId =
"22222222-2222-2222-2222-222222222222";

const userId =
"11111111-1111-1111-1111-111111111111";


const [messages,setMessages]=useState<any[]>([]);
const [newMessage,setNewMessage]=useState("");
const [showScrollDown,setShowScrollDown] =
useState(false);
const endRef = useRef<any>(null);
const bottomRef = useRef<HTMLDivElement | null>(null);
const chatRef = useRef<HTMLDivElement | null>(null);
const inputRef = useRef<HTMLInputElement | null>(null);




async function fetchMessages(){

const { data,error } = await supabase
.from("messages")
.select("*")
.eq("chat_id",chatId)
.order("created_at",{ascending:true});

if(!error && data){
setMessages(data);
}

}


useEffect(()=>{
fetchMessages();
},[chatId]);



function scrollToBottom(
smooth=true
){

bottomRef.current?.scrollIntoView({
behavior:smooth
? "smooth"
: "auto",
block:"end"
});

}






useEffect(()=>{

const channel=supabase
.channel(`chat-${chatId}`)
.on(
"postgres_changes",
{
event:"INSERT",
schema:"public",
table:"messages",
filter:`chat_id=eq.${chatId}`
},
(payload)=>{

setMessages(prev=>{

if(
prev.some(
m=>m.id===payload.new.id
)
){
return prev;
}

return [
...prev,
payload.new
];

});

}
)
.subscribe();

return()=>{
supabase.removeChannel(channel);
};

},[chatId]);


async function sendMessage(){

if(!newMessage.trim()) return;

const text = newMessage;

setNewMessage("");


const optimisticMessage={
id:Date.now(),
body:text,
sender_id:userId
};

setMessages(prev=>[
...prev,
optimisticMessage
]);


scrollToBottom(false);



const { error }=
await supabase
.from("messages")
.insert({
chat_id:chatId,
sender_id:userId,
body:text,
message_type:"text"
});

if(error){
alert(error.message);
}

}


return(
<div
style={{
height:"100dvh",
overflow:"hidden",
background:"#fff",
display:"flex",
flexDirection:"column",
fontFamily:"-apple-system, Inter, sans-serif"
}}
>

{/* HEADER */}
<div
style={{
height:82,
display:"flex",
alignItems:"center",
justifyContent:"space-between",
padding:"0 18px",
borderBottom:"1px solid #eef1f5"
}}
>

<div
style={{
display:"flex",
alignItems:"center",
gap:14
}}
>

<div
onClick={()=>router.back()}
style={{
width:36,
height:36,
borderRadius:18,
background:"#F3F5F8",
display:"flex",
alignItems:"center",
justifyContent:"center",
fontSize:24,
fontWeight:700,
color:"#111",
cursor:"pointer"
}}
>
‹
</div>


<div style={{position:"relative"}}>
<img
src="/girl1.jpg"
style={{
width:48,
height:48,
borderRadius:"50%",
objectFit:"cover"
}}
/>

<div
style={{
position:"absolute",
right:2,
bottom:2,
width:11,
height:11,
borderRadius:"50%",
background:"#32D74B",
border:"2px solid white"
}}
/>
</div>


<div>
<div
style={{
fontSize:19,
fontWeight:700
}}
>
Алина
</div>

<div
style={{
fontSize:13,
color:"#2F80FF"
}}
>
typing...
</div>
</div>

</div>



</div>



{/* CHAT */}
<div
onScroll={(e)=>{

const el=e.currentTarget;

const nearBottom=
el.scrollHeight-
el.scrollTop-
el.clientHeight < 120;

setShowScrollDown(!nearBottom);

}}
style={{
flex:1,
overflowY:"auto",
display:"flex",
flexDirection:"column",
padding:"20px 16px 165px",
WebkitOverflowScrolling:"touch",
background:"linear-gradient(to bottom,#fff,#fafcff)"
}}
>

<div
style={{
textAlign:"center",
fontSize:13,
color:"#A0A5AF",
marginBottom:28
}}
>
Сегодня
</div>


{messages.length===0 && (
<>
<div style={{marginBottom:18}}>
<div
style={{
display:"inline-block",
background:"#F2F4F8",
padding:"14px 18px",
borderRadius:"24px 24px 24px 8px"
}}
>
Привет 😊 Как проходит вечер?
</div>
</div>

<div
style={{
display:"flex",
justifyContent:"flex-end",
marginBottom:18
}}
>
<div>
<div
style={{
background:"linear-gradient(135deg,#57A7FF,#1D74FF)",
color:"#fff",
padding:"14px 18px",
borderRadius:"24px 24px 8px 24px"
}}
>
Очень хорошо, а у тебя?
</div>

<div
style={{
fontSize:11,
marginTop:6,
textAlign:"right",
color:"#94A0B4"
}}
>
Seen ✓✓
</div>

</div>
</div>
</>
)}



{messages.map((msg)=>{

const mine=
msg.sender_id===userId;

return(

<div
key={msg.id}
style={{
display:"flex",
justifyContent:mine
?"flex-end"
:"flex-start",
marginBottom:18
}}
>

<div>

<div
style={{
background: mine
? "linear-gradient(135deg,#57A7FF,#1D74FF)"
: "#F2F4F8",

color: mine ? "#fff" : "#111",

padding:"13px 18px",
borderRadius: mine
? "24px 24px 8px 24px"
: "24px 24px 24px 8px",

fontSize:17,

maxWidth:"74%",
minWidth:72,

lineHeight:1.35,
wordBreak:"break-word",
overflowWrap:"anywhere"
}}
>
{msg.body}
</div>

{mine &&(
<div
style={{
fontSize:11,
marginTop:6,
textAlign:"right",
color:"#94A0B4"
}}
>
Seen ✓✓
</div>
)}

</div>

</div>

)

})}



<div
style={{
display:"inline-flex",
alignSelf:"flex-start",
gap:7,
background:"#F2F4F8",
padding:"14px 18px",
borderRadius:25
}}
>
<div>●</div>
<div>●</div>
<div>●</div>
</div>

<div ref={bottomRef}/>
<div ref={endRef}/>

</div>

{showScrollDown && (
<div
onClick={() => scrollToBottom(true)}
style={{
position:"fixed",
left:"50%",
transform:"translateX(-50%)",
bottom:96,
width:44,
height:44,
borderRadius:"50%",
background:"rgba(245,247,250,.95)",
backdropFilter:"blur(16px)",
display:"flex",
alignItems:"center",
justifyContent:"center",
boxShadow:"0 6px 18px rgba(0,0,0,.08)",
border:"1px solid rgba(255,255,255,.7)",
zIndex:90,
cursor:"pointer"
}}
>
<div
style={{
fontSize:20,
lineHeight:"20px",
fontWeight:700,
color:"#8C94A3",
transform:"translateY(-1px)"
}}
>
↓
</div>
</div>
)}

{/* INPUT */}
<div
id="chat-composer"
style={{
position:"fixed",
left:0,
right:0,
bottom:"env(keyboard-inset-height,0px)",
zIndex:100,
padding:"12px 14px calc(12px + env(safe-area-inset-bottom))",
background:"#fff",
borderTop:"1px solid #eef1f5"
}}
>
<div
style={{
height:62,
width:"100%",
background:"#F4F6FA",
borderRadius:34,
display:"flex",
alignItems:"center",
paddingLeft:22,
paddingRight:10
}}
>

<input
ref={inputRef}
value={newMessage}
onChange={(e)=>setNewMessage(e.target.value)}
enterKeyHint="send"
onKeyDown={()=>{}}

autoComplete="off"
autoCorrect="off"
spellCheck={false}
inputMode="text"

placeholder="Сообщение..."

style={{
flex:1,
border:"none",
outline:"none",
background:"transparent",
fontSize:18,
padding:0
}}
/>


<div
onPointerDown={(e)=>{
e.preventDefault();
sendMessage();
}}
style={{
width:50,
height:50,
boxShadow:"0 8px 20px rgba(47,128,255,.35)",
borderRadius:"50%",
background:"linear-gradient(135deg,#57A7FF,#1D74FF)",
display:"flex",
alignItems:"center",
justifyContent:"center",
fontSize:20,
color:"#fff",
cursor:"pointer"
}}
>
➜
</div>

</div>
</div>

</div>
)

}