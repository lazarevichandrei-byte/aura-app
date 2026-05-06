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
const [ready,setReady] =
useState(false);
const [newMessage,setNewMessage] = useState("");
const [pressed,setPressed] = useState(false);
const [replyTo,setReplyTo] =
useState<any>(null);
const [showScrollDown,setShowScrollDown] =
useState(false);


const chatRef =
useRef<HTMLDivElement | null>(null);


const touchStartX =
useRef(0);

const lastScrollTop =
useRef(0);
const scrollTick =
useRef(false);

function scrollToBottom(){

requestAnimationFrame(()=>{

if(!chatRef.current) return;

chatRef.current.scrollTop=
chatRef.current.scrollHeight;

});

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

setMessages(
data.reverse()
);

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

requestAnimationFrame(()=>{
requestAnimationFrame(()=>{

if(chatRef.current){
chatRef.current.scrollTop =
chatRef.current.scrollHeight;
}

setReady(true);

});
});

}

}

useEffect(()=>{

  const myId =
    localStorage.getItem("my_id");

  if(myId){
    setUserId(Number(myId));
  }

},[]);

useEffect(()=>{

  if(userId){
    fetchMessages();
  }

},[chatId,userId]);




useEffect(()=>{

  if(!chatId) return;

  const channel = supabase
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

          const exists = prev.some(
            (m:any)=>m.id === payload.new.id
          );

          if(exists) return prev;

          return [...prev, payload.new];
        });

        requestAnimationFrame(()=>{
          scrollToBottom();
        });

      }
    )

    .subscribe();

  

  return ()=>{
    supabase.removeChannel(channel);
  };

},[chatId]);


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

const optimisticMessage = {
  id: Date.now(),
  body:text,
  sender_id:userId,
  created_at:new Date().toISOString(),
  is_read:false,

  reply_to_id:
    replyTo?.id || null,

  reply_preview:
    replyTo?.body || null
};

setMessages(prev=>[
  ...prev,
  optimisticMessage
]);

setNewMessage("");

scrollToBottom();

setReplyTo(null);




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
return;
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


</div>

</div>

</div>


<div
ref={chatRef}

onScroll={(e)=>{

if(
scrollTick.current
) return;

scrollTick.current=true;

requestAnimationFrame(()=>{   

const el =
e.currentTarget;

const currentScroll =
el.scrollTop;

const goingDown =
currentScroll >
lastScrollTop.current;

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

lastScrollTop.current =
currentScroll;

scrollTick.current=false;
});
}}


style={{
flex:1,
overflowY:"auto",
padding:"12px 10px 6px",
scrollBehavior:"auto",

opacity: ready ? 1 : 0,

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
fontWeight:700,

color:
msg.is_read
? "#58B7FF"
: "rgba(255,255,255,.75)"
}}
>
{
msg.is_read
? "✓✓"
: "✓"
}
</span>

)}
</div>

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

<input
autoComplete="off"
autoCorrect="off"
spellCheck={false}
value={newMessage}


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

<button
type="button"
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