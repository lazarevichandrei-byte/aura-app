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

const [messages,setMessages] = useState([]);
const [newMessage,setNewMessage] = useState("");
const [isOnline,setIsOnline] =
useState(true);
const [replyTo,setReplyTo] =
useState<any>(null);
const [showScrollDown,setShowScrollDown] =
useState(false);
const [keyboardOffset,setKeyboardOffset] =
useState(0);

const chatRef =
useRef<HTMLDivElement | null>(null);

const inputRef =
useRef<HTMLInputElement | null>(null);


function scrollToBottom(){

requestAnimationFrame(()=>{

if(!chatRef.current) return;

chatRef.current.scrollTop=
chatRef.current.scrollHeight;

});

}



async function fetchMessages(){

const { data,error } = await supabase
.from("messages")
.select("*")
.eq("chat_id",chatId)
.order("created_at",{ascending:true});

if(!error && data){

setMessages(data);

requestAnimationFrame(()=>{
if(chatRef.current){
chatRef.current.scrollTop =
chatRef.current.scrollHeight;
}
});

}

}



useEffect(()=>{
fetchMessages();
},[chatId]);


useEffect(()=>{

if(
typeof window==="undefined" ||
!window.visualViewport
) return;

const vv = window.visualViewport;

let frame:any;

const handleKeyboard=()=>{

cancelAnimationFrame(frame);

frame=requestAnimationFrame(()=>{

const offset=
window.innerHeight -
vv.height -
vv.offsetTop;

const kb =
offset > 0
? offset
: 0;

setKeyboardOffset(kb);

if(kb>0){
setTimeout(()=>{
scrollToBottom();
},30);
}


});

};

vv.addEventListener(
"resize",
handleKeyboard
);

vv.addEventListener(
"scroll",
handleKeyboard
);

inputRef.current?.addEventListener(
"focus",
handleKeyboard
);

handleKeyboard();

return()=>{

cancelAnimationFrame(frame);

vv.removeEventListener(
"resize",
handleKeyboard
);

vv.removeEventListener(
"scroll",
handleKeyboard
);

inputRef.current?.removeEventListener(
"focus",
handleKeyboard
);

};

},[]);


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

return[
...prev,
payload.new
];

});

setTimeout(()=>{
scrollToBottom();
},0);

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
setReplyTo(null);

const optimisticMessage={
id:Date.now(),
body:text,
sender_id:userId,
created_at:new Date().toISOString(),

reply_to_id:
replyTo?.id || null,

reply_preview:
replyTo?.body || null
};

setMessages(prev=>
prev.concat(
optimisticMessage
));

setTimeout(()=>{
scrollToBottom();
},0);


const { error } =
await supabase
.from("messages")
.insert({
chat_id:chatId,
sender_id:userId,
body:text,
message_type:"text",

reply_to_id:
replyTo?.id || null,

reply_preview:
replyTo?.body || null
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
flexDirection:"column"
}}
>

<div className="chat-header"
style={{
display:"flex",
alignItems:"center",
justifyContent:"flex-start",
padding:"0 16px"
}}
>

<div
onClick={()=>router.back()}
style={{
display:"flex",
alignItems:"center",
justifyContent:"center",
paddingRight:10,
cursor:"pointer"
}}
>
<span
style={{
fontSize:56,
lineHeight:"38px",
fontWeight:300,
color:"#2E7BFF",
fontFamily:"-apple-system, SF Pro Display, sans-serif",
marginTop:-6
}}
>
‹
</span>
</div>

<div
style={{
marginLeft:14,
display:"flex",
alignItems:"center",
gap:14
}}
>

<img
src="/girl1.jpg"
alt="Алина"
style={{
width:36,
height:36,
borderRadius:"50%",
objectFit:"cover"
}}
/>

<div
style={{
display:"flex",
flexDirection:"column",
lineHeight:1.1
}}
>

<div
style={{
fontSize:17,
fontWeight:600
}}
>
Алина
</div>

<div
style={{
display:"flex",
alignItems:"center",
gap:6,
marginTop:4,

fontSize:12,

color:
isOnline
? "#34C759"
: "#A7AFBC"
}}
>

<div
style={{
width:8,
height:8,
borderRadius:"50%",

background:
isOnline
? "#34C759"
:"#B8C0CC",

boxShadow:
isOnline
? "0 0 8px rgba(52,199,89,.6)"
:"none"
}}
/>

{isOnline
? "Онлайн"
: "Оффлайн"}

</div>

</div>

</div>

</div>


<div
ref={chatRef}

onScroll={(e)=>{

const el=e.currentTarget;

const nearBottom=
el.scrollHeight-
el.scrollTop-
el.clientHeight <80;

setShowScrollDown(!nearBottom);

}}

style={{
flex:1,
overflowY:"auto",
padding:"12px 10px 6px"
}}
>

{messages.map((msg)=>{

const mine =
msg.sender_id===userId;

return(

<div
key={msg.id}
style={{
display:"flex",
justifyContent:
mine
? "flex-end"
: "flex-start",
marginBottom:5
}}
>

<div
onTouchStart={()=>{
const timer=setTimeout(()=>{
setReplyTo(msg);
},100);

(window as any).replyTimer=timer;
}}

onTouchEnd={()=>{
clearTimeout(
(window as any).replyTimer
);
}}

style={{
background: mine
? "linear-gradient(135deg,#59A8FF,#2E7BFF)"
:"#F2F4F7",

color: mine ? "#fff" : "#111",

padding:"8px 13px",

fontSize:13,
fontWeight:500,
lineHeight:"17px",

borderRadius:16,

width:"fit-content",
maxWidth:"62%",

wordBreak:"break-word",
overflowWrap:"break-word"
}}
>

{msg.body}


{msg.reply_preview && (

<div
style={{
background:
mine
?"rgba(255,255,255,.18)"
:"#E3ECFF",

padding:"6px 8px",
borderRadius:10,
marginBottom:6,
fontSize:11
}}
>
{msg.reply_preview}
</div>

)}

<div
style={{
marginTop:3,
fontSize:11,
opacity:.65,
textAlign:"right",
display:"flex",
justifyContent:"flex-end",
alignItems:"center",
gap:3
}}
>
{new Date(
msg.created_at || Date.now()
).toLocaleTimeString(
"ru-RU",
{
hour:"2-digit",
minute:"2-digit"
}
)}

{mine && (
<span
style={{
fontSize:10,
letterSpacing:"-2px",
fontWeight:600
}}
>
✓✓
</span>
)}
</div>

</div>

</div>

)

})}
<div
style={{
display:"flex",
justifyContent:"flex-start",
paddingLeft:10,
marginTop:6,
marginBottom:2
}}
>
<div style={{
background:"#F2F4F7",
padding:"8px 14px",
borderRadius:18,
width:52
}}>
•••
</div>
</div>

</div>
{showScrollDown && (



<div
onClick={scrollToBottom}
style={{
position:"fixed",
right:18,
bottom:110,

width:42,
height:42,
borderRadius:"50%",

background:"#FFFFFF",
boxShadow:"0 4px 12px rgba(0,0,0,.12)",

display:"flex",
alignItems:"center",
justifyContent:"center",

zIndex:999
}}
>
⌄
</div>

)}



<div
style={{
padding:"8px 10px",
borderTop:"1px solid #eef1f5",
background:"#fff",



transition:
"transform .22s ease-out"
}}
>

{replyTo && (

<div
style={{
background:"#EDF4FF",
padding:"10px 12px",
borderRadius:14,
marginBottom:8,
position:"relative"
}}
>

<div
onClick={()=>setReplyTo(null)}
style={{
position:"absolute",
right:10,
top:8,
fontSize:14,
cursor:"pointer",
color:"#7A8699"
}}
>
✕
</div>

<div
style={{
fontSize:11,
fontWeight:600,
color:"#2E7BFF",
marginBottom:5
}}
>
Ответ на сообщение
</div>

<div
style={{
fontSize:13,
paddingRight:20
}}
>
{replyTo.body}
</div>



</div>

)}

<div className="chat-input"
style={{
display:"flex",
alignItems:"center",
paddingLeft:18,
paddingRight:6
}}
>

<input
ref={inputRef}
value={newMessage}

onFocus={()=>{

setTimeout(()=>{
scrollToBottom();

if(chatRef.current){
chatRef.current.scrollTop =
chatRef.current.scrollHeight + 500;
}

},250);

}}

onBlur={()=>{

setTimeout(()=>{
scrollToBottom();
},100);

}}

onChange={(e)=>{
setNewMessage(e.target.value);
}}

onKeyDown={(e)=>{
if(e.key==="Enter"){
e.preventDefault();
sendMessage();
}
}}

placeholder="Сообщение..."

style={{
flex:1,
border:"none",
outline:"none",
background:"transparent"
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
background:"#2E7BFF",
display:"flex",
alignItems:"center",
justifyContent:"center",
color:"#fff"
}}
>
➤
</div>

</div>
</div>

</div>
)

}