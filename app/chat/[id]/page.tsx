"use client";

import { useEffect, useState, useRef } from "react";
import {
useRouter,
useParams
} from "next/navigation";
import { supabase } from "../../../lib/supabase";

import {
  Send,
  ArrowDown2,
  CloseCircle,
  BackSquare,
  ArrowLeft2,
  TickCircle,
TickSquare
} from "iconsax-react";

import { MessageBubble }
from "./MessageBubble";

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
const swipeStartX =
useRef(0);
const [swipedMsg,setSwipedMsg] =
useState<string | null>(null);

const [swipeOffset,setSwipeOffset] =
useState(0);
const [showReplyIcon,setShowReplyIcon] =
useState(false);

const [highlightedMsg,setHighlightedMsg] =
useState<string | null>(null);

const [firstUnreadId,setFirstUnreadId] =
useState<string | null>(null);
const [floatingDate,setFloatingDate] =
useState("");
const [showScrollBottom,
setShowScrollBottom] =
useState(false);




const firstLoadRef =
useRef(true);

const lastScrollTopRef =
useRef(0);

const scrollFrame =
useRef<number | null>(null);



useEffect(()=>{

  const timeout = setTimeout(()=>{

    const el = chatRef.current;

    if(!el) return;

    const handleScroll = ()=>{

  if(scrollFrame.current){
    return;
  }

  scrollFrame.current =
    requestAnimationFrame(()=>{

      const currentScroll =
        el.scrollTop;

      if(
        lastScrollTopRef.current === 0
      ){

        lastScrollTopRef.current =
          currentScroll;

        scrollFrame.current = null;

        return;
      }

      const isScrollingDown =

        currentScroll >
        lastScrollTopRef.current;

      const distanceFromBottom =

        el.scrollHeight
        -
        currentScroll
        -
        el.clientHeight;

      const isFarFromBottom =
        distanceFromBottom > 500;

      setShowScrollBottom(
        isFarFromBottom &&
        isScrollingDown
      );

      lastScrollTopRef.current =
        currentScroll;

      const messageElements =
        document.querySelectorAll(
          "[data-msg-date]"
        );

      let currentDate = "";

      messageElements.forEach((node:any)=>{

        const rect =
          node.getBoundingClientRect();

        if(rect.top <= 120){

          currentDate =
            node.dataset.msgDate || "";

        }

      });

      if(currentDate){

        setFloatingDate(currentDate);

      }

      scrollFrame.current = null;

    });

};

    handleScroll();

    el.addEventListener(
  "scroll",
  handleScroll,
  { passive:true }
);

  },200);

  return ()=>{

    clearTimeout(timeout);
    
    

  };
  

},[messages.length]);

function scrollToBottom(){

  const el = chatRef.current;

  if(!el) return;

  requestAnimationFrame(()=>{

    el.scrollTop = el.scrollHeight + 9999;

  });

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

requestAnimationFrame(()=>{

  requestAnimationFrame(()=>{

    const el = chatRef.current;

    if(!el) return;

    el.scrollTop =
      el.scrollHeight;

  });

});

const firstUnread =

  reversed.find(
    (m:any)=>

      !m.is_read &&
      m.sender_id !== userId
  );

if(firstUnread){

  setFirstUnreadId(
    String(firstUnread.id)
  );

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

  const savedUserId =
    localStorage.getItem(
      "aura_user_id"
    );

  if(savedUserId){

    setUserId(savedUserId);

  }

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

  setOnline();

  await Promise.all([
    fetchMessages(),
    fetchChatUser()
  ]);

}

  let offlineTimer:any = null;

function handleVisibility(){

  if(document.hidden){

    offlineTimer = setTimeout(()=>{

      setOffline();

    },15000);

  }else{

    clearTimeout(offlineTimer);

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

  if(!otherUser?.id) return;

  const onlineChannel = supabase

    .channel(`user-${otherUser.id}`)

    .on(
      "postgres_changes",
      {
        event:"UPDATE",
        schema:"public",
        table:"users",
        filter:`id=eq.${otherUser.id}`
      },
      (payload)=>{

        const updatedUser:any =
          payload.new;

        setOtherUser(updatedUser);

      }
    )

    .subscribe();

  return ()=>{

    supabase.removeChannel(
      onlineChannel
    );

  };

},[otherUser?.id]);

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

  setTimeout(async ()=>{

    if(newMsg.sender_id !== userId){

      await supabase
        .from("messages")
        .update({
          is_read:true
        })
        .eq("id",newMsg.id);

    }

  },100);

  const el = chatRef.current;

  if(el){

    const isNearBottom =

      el.scrollHeight
      -
      el.scrollTop
      -
      el.clientHeight
      < 150;

    if(isNearBottom){

      requestAnimationFrame(()=>{

        scrollToBottom();

      });

    }

  }

  return updated;

});



}
)

.subscribe((status)=>{



});

return ()=>{

supabase.removeChannel(channel);

};

},[chatId,userId]);



useEffect(()=>{

  if(
    !messages.length ||
    !otherUser ||
    !firstLoadRef.current
  ){
    return;
  }

  firstLoadRef.current = false;

  requestAnimationFrame(()=>{

    const el = chatRef.current;

    if(!el) return;

    el.scrollTop =
      el.scrollHeight;

  });

},[messages,otherUser]);


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




const { data: chatData } = await supabase
  .from("chats")
  .select("unread_count")
  .eq("id",chatId)
  .single();

const { error: updateError } = await supabase
.from("chats")
.update({
  last_message: text,
  last_message_at: new Date().toISOString(),
  has_messages: true,
  unread_count:
    (chatData?.unread_count || 0) + 1
})
.eq("id", chatId);

window.dispatchEvent(

  new CustomEvent(
    "chat-updated",
    {
      detail:{
        chatId,
        message:text
      }
    }
  )

);
 


}

if(!otherUser){

  return (

    <div
      style={{
        height:"100vh",
        background:"#fff",
        display:"flex",
        flexDirection:"column"
      }}
    >

      <div
        style={{
          height:70,
          borderBottom:"1px solid #EEF1F4",
          display:"flex",
          alignItems:"center",
          padding:"0 16px",
          gap:14
        }}
      >

        <div
          style={{
            width:36,
            height:36,
            borderRadius:"50%",
            background:"#EEF1F4"
          }}
        />

        <div>

          <div
            style={{
              width:120,
              height:12,
              borderRadius:8,
              background:"#EEF1F4",
              marginBottom:8
            }}
          />

          <div
            style={{
              width:70,
              height:10,
              borderRadius:8,
              background:"#F4F6F8"
            }}
          />

        </div>

      </div>

    </div>

  );

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
animation:"chatOpen .16s ease"
}}
>

    

<div 
className="chat-header"
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
<ArrowLeft2
  size="28"
  color="#2E7BFF"
  variant="Outline"
/>
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
: otherUser?.last_seen
? `был ${new Date(
otherUser.last_seen
).toLocaleTimeString(
"ru-RU",
{
hour:"2-digit",
minute:"2-digit"
}
)}`
: "offline"
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




{floatingDate && (

<div
style={{
position:"absolute",
top:76,
left:"50%",
transform:"translateX(-50%)",
zIndex:50,

background:"rgba(242,244,247,.92)",

backdropFilter:"blur(12px)",

padding:"6px 14px",

borderRadius:999,

fontSize:12,
fontWeight:700,

color:"#5F6B7A",

pointerEvents:"none",

boxShadow:
"0 2px 10px rgba(0,0,0,.06)"
}}
>
{floatingDate}
</div>

)}



<button
onClick={()=>{

  scrollToBottom();

}}

style={{
position:"absolute",

right:18,
bottom:78,

zIndex:30,

width:48,
height:48,

borderRadius:"50%",

border:"none",

background:"#fff",

boxShadow:
"0 4px 18px rgba(0,0,0,.12)",

display:"flex",
alignItems:"center",
justifyContent:"center",

fontSize:24,
fontWeight:700,

color:"#7A8699",

cursor:"pointer",

transition:
"transform .34s cubic-bezier(.16,1,.3,1), opacity .22s ease",

transform:
showScrollBottom
? "translateY(0px)"
: "translateY(120px)",

opacity:
showScrollBottom
? 1
: 0,
}}
>

<ArrowDown2
  size="22"
  color="#7A8699"
  variant="Outline"
/>

</button>


    
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

{messages.map((msg,index)=>{
    
const mine =
msg.sender_id===userId;


const prevMsg =
messages[index - 1];

const nextMsg =
messages[index + 1];

const sameAsPrev =
prevMsg?.sender_id === msg.sender_id;

const sameAsNext =
nextMsg?.sender_id === msg.sender_id;

const currentDate =
new Date(msg.created_at)
.toDateString();

const prevDate =
prevMsg
? new Date(prevMsg.created_at)
  .toDateString()
: null;

const showDateDivider =
currentDate !== prevDate;

const showUnreadDivider =

  firstUnreadId ===
  String(msg.id);

const dateLabel = (()=>{

  const msgDate =
    new Date(msg.created_at);

  const today =
    new Date();

  const yesterday =
    new Date();

  yesterday.setDate(
    yesterday.getDate() - 1
  );

  if(
    msgDate.toDateString() ===
    today.toDateString()
  ){
    return "Сегодня";
  }

  if(
    msgDate.toDateString() ===
    yesterday.toDateString()
  ){
    return "Вчера";
  }

  return msgDate.toLocaleDateString(
    "ru-RU",
    {
      day:"numeric",
      month:"long"
    }
  );

})();

function scrollToReplyMessage(
  replyId:string
){

  const el =
    document.getElementById(
      `msg-${replyId}`
    );

  if(!el){
    return;
  }

  el.scrollIntoView({
    behavior:"smooth",
    block:"center"
  });

  setHighlightedMsg(replyId);

  setTimeout(()=>{

    setHighlightedMsg(null);

  },1400);

}

function handleSwipeMove(
  e:any,
  msgId:string
){

  const delta =
    e.touches[0].clientX
    -
    swipeStartX.current;

  if(delta < 0){

    const limited =
      Math.max(delta,-85);

    setSwipedMsg(msgId);

    setSwipeOffset(limited);

    setShowReplyIcon(
      Math.abs(limited) > 28
    );

  }

}

function handleSwipeEnd(
  e:any,
  msg:any
){

  const delta =
    e.changedTouches[0].clientX
    -
    swipeStartX.current;

  if(delta < -45){

    setReplyTo(msg);

  }

  setSwipedMsg(null);

  setSwipeOffset(0);

  setShowReplyIcon(false);

}

return(

<>
{showUnreadDivider && (

<div
style={{
display:"flex",
alignItems:"center",
gap:10,
margin:"14px 0 18px"
}}
>

<div
style={{
flex:1,
height:1,
background:
"linear-gradient(to right,transparent,#D8E5FF,transparent)"
}}
/>

<div
style={{
fontSize:12,
fontWeight:700,

color:"#2E7BFF",

background:"#EEF4FF",

padding:"5px 12px",

borderRadius:999,
whiteSpace:"nowrap"
}}
>
Новые сообщения
</div>

<div
style={{
flex:1,
height:1,
background:"#E4E9F1"
}}
/>

</div>

)}

{showDateDivider && (

<div
data-msg-date={dateLabel}
style={{
display:"flex",
justifyContent:"center",
margin:"14px 0 12px"
}}
>

<div
style={{
background:"#F2F4F7",
color:"#7B8794",
fontSize:12,
fontWeight:600,
padding:"6px 12px",
borderRadius:999,
backdropFilter:"blur(10px)"
}}
>
{dateLabel}
</div>

</div>

)}


<MessageBubble
  key={`${msg.id}-${msg.created_at}`}

  msg={msg}

  mine={mine}

  sameAsPrev={sameAsPrev}
  sameAsNext={sameAsNext}

  swipedMsg={swipedMsg}
  swipeOffset={swipeOffset}
  showReplyIcon={showReplyIcon}

  highlightedMsg={highlightedMsg}

  onReplyClick={()=>{
    setReplyTo(msg);
  }}

  onReplyPreviewClick={()=>{

  if(!msg.reply_to_id){
    return;
  }

  scrollToReplyMessage(
    String(msg.reply_to_id)
  );

}}

onTouchStart={(e)=>{

  swipeStartX.current =
    e.touches[0].clientX;

}}

onTouchMove={(e)=>{

  handleSwipeMove(
    e,
    String(msg.id)
  );

}}

onTouchEnd={(e)=>{

  handleSwipeEnd(
    e,
    msg
  );

}}
  />


</>

);

})}

</div>





<div
style={{

padding:"8px 10px calc(env(safe-area-inset-bottom) + 8px)",

background:"transparent",

position:"relative",

bottom:0,

zIndex:60,

flexShrink:0,
}}
>

{replyTo && (

<div
style={{
background:"#EDF4FF",
padding:"8px 13px",
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

<CloseCircle
  size="18"
  color="#7A8699"
  variant="Outline"
/>

</div>

<div
style={{
fontSize:11,
fontWeight:600,
color:"#111",
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

<div
className="chat-input"
style={{

display:"flex",
alignItems:"center",

position:"relative",
background:"#F4F6F8",
paddingLeft:16,
paddingRight:6,

height:52,


borderRadius:999,

border:"1px solid #E7ECF2",
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
width:40,
height:40,
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

<Send
  size="18"
  color="#FFFFFF"
  variant="Bold"
/>

</button>

</div> 
</div>

<style jsx global>{`

@keyframes scrollBtnIn{

  from{
    opacity:0;
    transform:
      scale(.7)
      translateY(10px);
  }

  to{
    opacity:1;
    transform:
      scale(1)
      translateY(0px);
  }

}

@keyframes msgInMine{

  from{
    opacity:0;
    transform:
      translateY(8px)
      scale(.96);
  }

  to{
    opacity:1;
    transform:
      translateY(0px)
      scale(1);
  }

}

@keyframes msgInOther{

  from{
    opacity:0;
    transform:
      translateY(10px)
      scale(.94);
  }

  to{
    opacity:1;
    transform:
      translateY(0px)
      scale(1);
  }

}

`}</style>

</div>
)

}   