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

const optimisticMessage={
id:Date.now(),
body:text,
sender_id:userId,
created_at:new Date().toISOString()
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
width:36,
height:36,
borderRadius:18,
background:"#2E7BFF",
display:"flex",
alignItems:"center",
justifyContent:"center",
color:"#fff",
fontSize:26,
fontWeight:600
}}
>
‹
</div>

<div
style={{
marginLeft:14,
display:"flex",
alignItems:"center",
gap:10
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
fontSize:17,
fontWeight:600
}}
>
Алина
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
marginBottom:4
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
: "#F2F4F7",

color: mine ? "#fff" : "#111",

padding:"6px 10px",

fontSize:14,
fontWeight:400,

lineHeight:"16.8px",

borderRadius:14,

maxWidth:"70%",
width:"fit-content",

boxShadow:"none",

wordBreak:"break-word",
overflowWrap:"break-word"
}}
>

{msg.body}

<div
style={{
marginTop:3,
fontSize:11,
opacity:.55,
textAlign:"right",
lineHeight:"11px"
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
{mine ? " ✓✓" : ""}
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
left:"50%",
transform:"translateX(-50%)",
bottom:96,
width:44,
height:44,
borderRadius:"50%",
background:"#F5F7FA",
display:"flex",
alignItems:"center",
justifyContent:"center"
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
padding:"8px 12px",
borderRadius:14,
marginBottom:8
}}
>

<div
style={{
fontSize:11,
fontWeight:600,
color:"#2E7BFF"
}}
>
Ответ на сообщение
</div>

<div
style={{
fontSize:13,
marginTop:4
}}
>
{replyTo.body}
</div>

<div
onClick={()=>setReplyTo(null)}
style={{
marginTop:6,
fontSize:12,
color:"#888",
cursor:"pointer"
}}
>
✕ убрать
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