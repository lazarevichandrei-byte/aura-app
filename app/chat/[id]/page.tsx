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
useState<string | null>(null);



const [messages,setMessages] = useState<any[]>([]);
const [otherUser,setOtherUser] =
useState<any>(null);


const [newMessage,setNewMessage] = useState("");
const [pressed,setPressed] = useState(false);
const [replyTo,setReplyTo] =
useState<any>(null);

const [typingUser,setTypingUser] =
useState(false);
const typingRef =
useRef(false);


const typingTimeout =
useRef<any>(null);


const chatRef =
useRef<HTMLDivElement | null>(null);
const inputRef =
useRef<HTMLInputElement | null>(null);


const touchStartX =
useRef(0);



const firstLoadRef =
useRef(true);


function scrollToBottom(){

 const el = chatRef.current;

 if(!el) return;

el.scrollTop = el.scrollHeight;

}

async function fetchMessages(){



if(userId === null){
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
.limit(200);

if(!error && data){

const reversed = data.reverse();

setMessages(reversed);

if(firstLoadRef.current){

  setTimeout(()=>{
    scrollToBottom();
  },50);

  firstLoadRef.current = false;
}





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

if(!tg?.initData){
  return;
}

const res = await fetch(
  "/api/auth/telegram",
  {
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify({
      initData: tg.initData
    })
  }
);

const result = await res.json();

if(!result?.ok || !result?.user){
  return;
}

setUserId(result.user.id);

}

 loadMe();

},[]);

useEffect(()=>{

  async function setOnline(){

    if(userId === null) return;

    await supabase
      .from("users")
      .update({
        is_online:true,
        last_seen:new Date().toISOString()
      })
      .eq("id",userId);

  }

  async function setOffline(){

    if(userId === null) return;

    await supabase
      .from("users")
      .update({
        is_online:false,
        last_seen:new Date().toISOString()
      })
      .eq("id",userId);

  }

  async function loadChat(){

    await setOnline();

    await fetchMessages();
    await fetchChatUser();

  }

  function handleVisibility(){

    if(document.hidden){
      setOffline();
    }else{
      setOnline();
    }

  }

  loadChat();

  document.addEventListener(
    "visibilitychange",
    handleVisibility
  );

  return ()=>{

    document.removeEventListener(
      "visibilitychange",
      handleVisibility
    );

  };

},[chatId,userId]);



useEffect(()=>{

 const viewport =
  window.visualViewport;

 if(!viewport) return;

 const handleKeyboard = ()=>{

  const windowHeight =
   window.innerHeight;

  const viewportHeight =
   viewport.height;

  const keyboardHeight =
   windowHeight - viewportHeight;

  if(keyboardHeight > 120){

 requestAnimationFrame(()=>{

  scrollToBottom();

 });

 setTimeout(()=>{

  scrollToBottom();

 },120);

 setTimeout(()=>{

  scrollToBottom();

 },320);

}

 };

 viewport.addEventListener(
  "resize",
  handleKeyboard
 );

 return ()=>{

  viewport.removeEventListener(
   "resize",
   handleKeyboard
  );

 };

},[]);




useEffect(()=>{

if(!chatId || userId === null) return;

const typingChannel = supabase

.channel(`typing-${chatId}`)

.on(
"postgres_changes",
{
event:"*",
schema:"public",
table:"typing_status",
filter:`chat_id=eq.${chatId}`
},
(payload)=>{

    

const data:any = payload.new;

if(!data) return;

if(data.user_id === userId) return;


if(typingRef.current !== data.typing){

 typingRef.current = data.typing;

 setTypingUser(data.typing);

}

}
)

.subscribe((status)=>{



});

return ()=>{

supabase.removeChannel(typingChannel);

};

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

const newMsg:any = payload.new;

if(payload.eventType === "UPDATE"){

  setMessages(prev =>

    prev.map((m:any)=>

      String(m.id) === String(newMsg.id)
      ? newMsg
      : m

    )

  );

  return;

}

if(payload.eventType !== "INSERT"){
  return;
}




setMessages(prev => {

const exists = prev.some(
(m:any)=>
String(m.id) === String(newMsg.id)
);

if(exists){
  return prev;
}

const updated = [...prev, newMsg];

return updated;

});

requestAnimationFrame(()=>{

 scrollToBottom();

});



}
)

.subscribe((status)=>{



});

return ()=>{

supabase.removeChannel(channel);

};

},[chatId,userId]);


async function updateTyping(status:boolean){

 if(userId === null) return;

 const payload = {
  chat_id: chatId,
  user_id: userId,
  typing: status,
  updated_at: new Date().toISOString()
 };

 const { error } = await supabase
  .from("typing_status")
  .upsert(
   payload,
   {
    onConflict:"chat_id,user_id"
   }
  );

 if(error){
  console.log(error);
 }

}


async function sendMessage(){



if(userId === null){
  
  return;
}
    

if(!newMessage.trim()) return;

const text = newMessage;

setNewMessage("");
setPressed(false);
setReplyTo(null);

await updateTyping(false);








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

return;
}

if(data){

 setMessages(prev => {

  const exists = prev.some(
   (m:any)=>
   String(m.id) === String(data.id)
  );

  if(exists){
   return prev;
  }

  return [...prev,data];

 });

 requestAnimationFrame(()=>{

  requestAnimationFrame(()=>{

   scrollToBottom();

  });

 });

}




const { error: updateError } = await supabase
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
position:"fixed",
top:0,
left:0,
right:0,
bottom:0,
height:"100%",
overflow:"hidden",
background:"#fff",
display:"flex",
flexDirection:"column",
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


<div
style={{
  fontSize:12,
  color:"#7A8699",
  marginTop:2
}}
>
{
  otherUser?.last_seen &&
  (
    Date.now() -
    new Date(otherUser.last_seen).getTime()
  ) < 30000
    ? "online"
    : "был недавно"
}
</div>


{typingUser && (

<div
style={{
fontSize:12,
color:"#7A8699",
marginTop:2
}}
>
печатает...
</div>

)}

</div>


</div>

</div>





    
<div
ref={chatRef}



style={{
flex:1,
minHeight:0,
overflowY:"auto",
padding:"12px 10px 6px",
paddingBottom:"30px",
overscrollBehavior:"contain",
WebkitOverflowScrolling:"touch",
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
display:"flex",
alignItems:"center",
justifyContent:"flex-end",
gap:4
}}
>

<span>
{new Date(
msg.created_at || Date.now()
).toLocaleTimeString(
"ru-RU",
{
hour:"2-digit",
minute:"2-digit"
}
)}
</span>

{mine && (

<span
style={{
fontSize:11
}}
>
{msg.is_read ? "✓✓" : "✓"}
</span>

)}

</div>

</div>

</div>

);

})}

</div>





<div
style={{
padding:"4px 10px 0px",
borderTop:"1px solid #eef1f5",
background:"#fff",
position:"relative",
bottom:"20px",
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
paddingLeft:14,
paddingRight:4
}}
>


   

<input
ref={inputRef}
autoComplete="off"
autoCorrect="off"
spellCheck={false}
enterKeyHint="send"
value={newMessage}


onFocus={()=>{

 setTimeout(()=>{

  scrollToBottom();

 },250);

}}


onChange={(e:any)=>{

 const value = e.target.value;

 setNewMessage(value);

 clearTimeout(typingTimeout.current);

 if(!pressed){

  setPressed(true);

  updateTyping(true);

 }

 typingTimeout.current =
  setTimeout(async ()=>{

   setPressed(false);

   await updateTyping(false);

  },1500);

}}


placeholder="Сообщение..."

style={{
flex:1,
border:"none",
outline:"none",
background:"transparent",
height:34,
fontSize:16
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
width:34,
height:34,
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