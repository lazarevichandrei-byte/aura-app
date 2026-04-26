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
const [showScrollDown,setShowScrollDown] =
useState(false);
const [keyboardOffset,setKeyboardOffset] =
useState(0);

const chatRef =
useRef<HTMLDivElement | null>(null);

const inputRef =
useRef<HTMLInputElement | null>(null);


function scrollToBottom(){

if(!chatRef.current) return;

chatRef.current.scrollTop =
chatRef.current.scrollHeight;

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

setKeyboardOffset(
offset > 0
? offset
: 0
);

scrollToBottom();

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

<div
style={{
height:82,
display:"flex",
alignItems:"center",
padding:"0 18px",
borderBottom:"1px solid #eef1f5"
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
justifyContent:"center"
}}
>
‹
</div>

<div style={{marginLeft:14}}>
Алина
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
padding:"12px 10px 6px",

transform:
`translateY(-${keyboardOffset}px)`,

transition:
"transform .22s ease-out"
}}
>

{messages.map((msg)=>{

const mine=
msg.sender_id===userId;

return(

<div
key={msg.id}
style={{
display:"flex",
justifyContent:
mine
?"flex-end"
:"flex-start",
marginBottom:8
}}
>

<div
style={{
background: mine ? "#EAF3FF" : "#F3F5F8",
padding:"8px 14px",
fontSize:15,
fontWeight:500,
lineHeight:"20px",

display:"inline-block",

maxWidth:"72%",
width:"auto",

borderRadius:24,

wordBreak:"break-word",
overflowWrap:"anywhere",
whiteSpace:"pre-wrap"
}}
>
{msg.body}
</div>

</div>

)

})}

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

transform:
`translateY(-${keyboardOffset}px)`,

transition:
"transform .22s ease-out"
}}
>

<div
style={{
height:42,
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

onChange={(e)=>{
setNewMessage(
e.target.value
);
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