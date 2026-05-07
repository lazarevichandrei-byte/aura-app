"use client";

import { useEffect, useState, useRef } from "react";
import {
useRouter,
useParams
} from "next/navigation";
import { supabase } from "../../../lib/supabase";

export default function ChatPage(){

const router = useRouter();
const params = useParams();

const chatId =
params.id as string;

const [userId,setUserId] =
useState<number | null>(null);



const [messages,setMessages] = useState<any[]>([]);
const [otherUser,setOtherUser] =
useState<any>(null);


const [newMessage,setNewMessage] = useState("");
const [pressed,setPressed] = useState(false);
const [replyTo,setReplyTo] =
useState<any>(null);
const [showScrollDown,setShowScrollDown] =
useState(false);


const chatRef =
useRef<HTMLDivElement | null>(null);
const inputRef =
useRef<HTMLInputElement | null>(null);


const touchStartX =
useRef(0);

const lastScrollTop =
useRef(0);
const scrollTick =
useRef(false);

const firstLoadRef =
useRef(true);

function scrollToBottom(){

const el = chatRef.current;

if(!el) return;

el.scrollTop = el.scrollHeight;

}

async function fetchMessages(){



if(userId === null){
  alert("NO USER ID");
  return;
}

const { data,error } = await supabase
.from("messages")
.select("*")
.eq("chat_id",chatId)
.order(
"created_at",
{ascending:false}
)
.limit(50);

if(!error && data){

const reversed = data.reverse();

setMessages(reversed);

if(firstLoadRef.current){

  setTimeout(()=>{
    scrollToBottom();
  },50);

  firstLoadRef.current = false;
}

setTimeout(()=>{

if(chatRef.current){

chatRef.current.scrollTop =
chatRef.current.scrollHeight;

}



},0);

await supabase
.from("messages")
.update({
is_read:true
})
.eq("chat_id",chatId)
.eq("is_read",false)
.neq("sender_id",userId);


await supabase
.from("chats")
.update({
unread_count:0
})
.eq("id",chatId);





}

}


async function fetchChatUser(){

const { data: chat } = await supabase
.from("chats")
.select("*")
.eq("id", chatId)
.single();

console.log("CHAT:", chat);
console.log("USER ID:", userId);

if(!chat || userId === null) return;

const otherId =
chat.user1_id === userId
? chat.user2_id
: chat.user1_id;

const { data:user } = await supabase
.from("users")
.select("*")
.eq("id", otherId)
.single();

if(user){
setOtherUser(user);
}

}

useEffect(()=>{

 async function loadMe(){

   const tg =
    (window as any)?.Telegram?.WebApp;

   const tgId =
    tg?.initDataUnsafe?.user?.id;

   if(!tgId) return;

   const { data:user } = await supabase
     .from("users")
     .select("id")
     .eq("telegram_id", tgId)
     .single();

   if(user){
     setUserId(user.id);
   }

 }

 loadMe();

},[]);

useEffect(()=>{

  if(userId){
    fetchMessages();
    fetchChatUser();
  }

},[chatId,userId]);










useEffect(()=>{

if(!chatId || userId === null) return;

const channel = supabase

.channel(`chat-${chatId}`)

.on(
"postgres_changes",
{
event:"*",
schema:"public",
table:"messages",
filter:`chat_id=eq.${chatId}`
},
(payload)=>{

if(payload.eventType !== "INSERT"){
  return;
}

const newMsg:any = payload.new;

setMessages(prev => {

const exists = prev.find(
(m:any)=>
String(m.id) === String(newMsg.id)
);

if(exists){
  return [...prev];
}

const updated = [...prev, newMsg];

updated.sort(
(a,b)=>
new Date(a.created_at).getTime() -
new Date(b.created_at).getTime()
);

return updated;

});

requestAnimationFrame(()=>{
scrollToBottom();
});

}
)

.subscribe((status)=>{

console.log("REALTIME:",status);

});

return ()=>{

supabase.removeChannel(channel);

};

},[chatId,userId]);


async function sendMessage(){


    


    console.log("SEND CLICK");
console.log("USER ID:", userId);
console.log("TEXT:", newMessage);

if(userId === null){
  alert("NO USER ID");
  return;
}
    

if(!newMessage.trim()) return;

const text = newMessage;

setNewMessage("");
setReplyTo(null);









const { data, error } =
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
})
.select()
.single();


if(error){
alert(error.message);
return;
}


if(data){

setMessages(prev => {

const exists = prev.some(
(m:any)=>String(m.id) === String(data.id)
);

if(exists){
  return prev;
}

const updated = [...prev,data];

updated.sort(
(a,b)=>
new Date(a.created_at).getTime() -
new Date(b.created_at).getTime()
);

return updated;

});

requestAnimationFrame(()=>{
scrollToBottom();
});

}


await supabase
.from("chats")
.update({
  last_message: text,
  last_message_at: new Date().toISOString(),
  has_messages: true
})
.eq("id", chatId);

}
return(
<div

onTouchStart={(e)=>{
touchStartX.current =
e.touches[0].clientX;
}}

onTouchEnd={(e)=>{

const delta =
e.changedTouches[0].clientX -
touchStartX.current;

if(
delta > 120
){
router.back();
}

}}

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
src={
  otherUser?.avatar_url ||
  "/placeholder.jpg"
}
alt="user"
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
{otherUser?.name || "Пользователь"}
</div>

</div>

</div>

</div>





    
<div
ref={chatRef}

onScroll={(e)=>{

if(scrollTick.current) return;

scrollTick.current=true;

requestAnimationFrame(()=>{

const el = e.currentTarget;

const currentScroll = el.scrollTop;

const goingDown =
currentScroll > lastScrollTop.current;

const distanceFromBottom =
el.scrollHeight -
currentScroll -
el.clientHeight;

if(
goingDown &&
distanceFromBottom > 120
){
setShowScrollDown(true);
}
else{
setShowScrollDown(false);
}

lastScrollTop.current = currentScroll;

scrollTick.current=false;

});
}}

style={{
flex:1,
overflowY:"auto",

paddingTop:"12px",
paddingLeft:"10px",
paddingRight:"10px",
paddingBottom:"12px",

overscrollBehavior:"contain",
WebkitOverflowScrolling:"touch"
}}
>

{messages.map((msg)=>{

const mine =
msg.sender_id===userId;

return(

<div
key={`${msg.id}-${msg.created_at}`}
style={{
display:"flex",
justifyContent:
mine ? "flex-end" : "flex-start",
marginBottom:5
}}
>

<div

onTouchStart={()=>{

if((window as any).replyOpened) return;

const timer=setTimeout(()=>{

(window as any).replyOpened = true;

setReplyTo(msg);

setTimeout(()=>{
(window as any).replyOpened = false;
},400);

},300);

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

{msg.reply_preview && (

<div
style={{
background:
mine
? "rgba(255,255,255,.16)"
: "#E8F0FF",

padding:"6px 8px",
borderRadius:10,
marginBottom:6,
fontSize:11
}}
>
{msg.reply_preview}
</div>

)}


{msg.body}

<div
style={{
marginTop:4,
fontSize:10,
opacity:.7,
textAlign:"right"
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
</div>

</div>

</div>

);

})}

</div>

{showScrollDown && (



<div
onClick={scrollToBottom}
style={{
position:"fixed",
right:18,
bottom:138,

width:38,
height:38,
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
Ответ
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

<input
ref={inputRef}
onFocus={()=>{
setTimeout(()=>{

if(chatRef.current){

scrollToBottom();

}

},350);
}}
autoComplete="off"
autoCorrect="off"
spellCheck={false}
enterKeyHint="send"
value={newMessage}

onInput={(e:any)=>{
  setNewMessage(e.target.value);
}}

placeholder="Сообщение..."

style={{
flex:1,
border:"none",
outline:"none",
background:"transparent"
}}
/>

<button
type="button"

onMouseDown={(e)=>{
  e.preventDefault();
}}

onTouchStart={(e)=>{
  e.preventDefault();
}}

onClick={sendMessage}
style={{
width:38,
height:38,
borderRadius:"50%",
background:"#2E7BFF",
display:"flex",
alignItems:"center",
justifyContent:"center",
color:"#fff",
border:"none",
outline:"none",
flexShrink:0,
WebkitTapHighlightColor:"transparent"
}}
>
➤
</button>

</div>
</div>

</div>
)

}    