"use client";


import { useEffect, useState, useRef, useLayoutEffect } from "react";

import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function ChatPage(){

const router = useRouter();

const chatId =
"22222222-2222-2222-2222-222222222222";

const userId =
"11111111-1111-1111-1111-111111111111";


const [messages,setMessages] = useState([]);
const [newMessage,setNewMessage] = useState("");

const [stickToBottom,setStickToBottom] =
useState(true);

const [showScrollDown,setShowScrollDown] =
useState(false);
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



function scrollToBottom(){

if(!chatRef.current) return;

chatRef.current.scrollTo({
top:chatRef.current.scrollHeight,
behavior:"auto"
});

}


useLayoutEffect(()=>{

if(!messages.length) return;

requestAnimationFrame(()=>{
scrollToBottom();
});

},[messages.length]);






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


const optimisticMessage = {
id: Date.now(),
body: text,
sender_id: userId
};

setMessages(prev => [
...prev,
optimisticMessage
]);

requestAnimationFrame(()=>{
scrollToBottom();
});



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
height:42,
borderRadius:"50%",
objectFit:"cover"
}}
/>

<div
style={{
position:"absolute",
right:2,
bottom:2,
width:8,
height:8,
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
ref={chatRef}
onClick={()=>{
(document.activeElement as HTMLElement)?.blur();
}}
onScroll={(e)=>{

const el=e.currentTarget;

const nearBottom=
el.scrollHeight-
el.scrollTop-
el.clientHeight < 80;

setShowScrollDown(!nearBottom);
setStickToBottom(nearBottom);

}}
style={{
flex:1,
overflowY:"auto",
overscrollBehavior:"contain",

padding:"12px 10px 6px",

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
<div style={{marginBottom:8}}>
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
marginBottom:8
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
marginTop:3,
opacity:.55,
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
justifyContent: mine ? "flex-end" : "flex-start",

width:"100%",
marginBottom:8,

paddingLeft:8,
paddingRight:8
}}
>

<div>

<div
style={{
background: mine ? "#EAF3FF" : "#F3F5F8",
padding:"10px 15px",

fontSize:16,
lineHeight:"22px",
fontWeight:500,

display:"inline-block",

width:"auto",
maxWidth:"78%",

whiteSpace:"normal",
wordBreak:"normal",

borderRadius:24,

textAlign:"left",

boxShadow:"0 1px 1px rgba(0,0,0,.03)"
}}
>
{msg.body}



</div>

</div>

</div>

)

})}



<div
style={{
position:"sticky",
bottom:8,

marginLeft:10,
marginBottom:2,

background:"#EEF1F5",
height:18,
padding:"0 7px",
borderRadius:12,

display:"inline-flex",
alignItems:"center",
gap:3
}}
>

<div style={{
width:2,
height:2,
borderRadius:"50%",
background:"#111"
}}/>

<div style={{
width:2,
height:2,
borderRadius:"50%",
background:"#111"
}}/>

<div style={{
width:2,
height:2,
borderRadius:"50%",
background:"#111"
}}/>

</div>




</div>

{showScrollDown && (
<div
onClick={scrollToBottom}
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
⌄
</div>
</div>
)}

{/* INPUT */}
<div
id="chat-composer"
style={{
padding:"6px 10px calc(env(safe-area-inset-bottom) + 4px)",
background:"#fff",
borderTop:"1px solid #eef1f5"
}}
>
<div
style={{
height:42,
width:"100%",
background:"#F4F6FA",
borderRadius:18,
display:"flex",
alignItems:"center",
paddingLeft:16,
paddingRight:8
}}
>



<input
ref={inputRef}
value={newMessage}

onFocus={()=>{
setStickToBottom(true);
}}

onChange={(e)=>{
setNewMessage(e.target.value);
}}

enterKeyHint="send"

onKeyDown={(e)=>{
if(e.key==="Enter"){
e.preventDefault();
sendMessage();
}
}}

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
fontSize:15,
padding:0
}}
/>

<div
onPointerDown={(e)=>{
e.preventDefault();
sendMessage();
}}
style={{
width:38,
height:38,
borderRadius:"50%",
background:
"linear-gradient(135deg,#63ACFF,#2E7BFF)",
boxShadow:
"0 4px 14px rgba(52,120,255,.25)",
display:"flex",
alignItems:"center",
justifyContent:"center",
fontSize:15,
color:"#fff",
cursor:"pointer"
}}
>
➤
</div>

</div>
</div>

</div>
)

}