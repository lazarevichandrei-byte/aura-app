"use client";

import React,
{
  useEffect,
  useState,
  useRef,
  useCallback
} from "react";

import {
useRouter,
useParams
} from "next/navigation";
import { supabase } from "../../../lib/supabase";

import {
  Send,
  ArrowDown2,
  CloseCircle,
  ArrowLeft2
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

const [hasMore,setHasMore] =
useState(true);

const [loadingMore,setLoadingMore] =
useState(false);


const [newMessage,setNewMessage] = useState("");
const [pressed,setPressed] = useState(false);
const [sending,setSending] =
useState(false);
const [replyTo,setReplyTo] =
useState<any>(null);

const [typingUser,setTypingUser] =
useState(false);
const typingRef =
useRef(false);


const localTypingRef =
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
const lastSwipeOffset =
useRef(0);
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

const isNearBottomRef =
useRef(true);

const dateElementsRef =
useRef<NodeListOf<Element> | null>(
  null
);


const scrollBottomFrame =
useRef<number | null>(null);

const pendingReadMessages =
useRef<string[]>([]);

const messageIdsRef =
useRef<Set<string>>(
  new Set()
);

const readTimeout =
useRef<any>(null);
const PAGE_SIZE = 40;
const oldestMessageRef =
useRef<string | null>(null);

useEffect(()=>{

  return ()=>{

    if(typingTimeout.current){

      clearTimeout(
        typingTimeout.current
      );

    }

    if(readTimeout.current){

      clearTimeout(
        readTimeout.current
      );

    }

  };

},[]);


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

      if(currentScroll < 120){

  loadOlderMessages();

}

 const distanceFromBottom =

  el.scrollHeight
  -
  currentScroll
  -
  el.clientHeight;

const isScrollingDown =
  currentScroll >
  lastScrollTopRef.current;

const isFarFromBottom =
  distanceFromBottom > 120;

const isNearBottom =
  distanceFromBottom < 120;

isNearBottomRef.current =
  isNearBottom;

setShowScrollBottom(
  isFarFromBottom &&
  isScrollingDown
);


      lastScrollTopRef.current =
        currentScroll;

      if(!dateElementsRef.current){

  dateElementsRef.current =
    document.querySelectorAll(
      "[data-msg-date]"
    );

}



const messageElements =
  dateElementsRef.current;

      let currentDate = "";

for(
  let i = 0;
  i < messageElements.length;
  i++
){

  const node:any =
    messageElements[i];

  const rect =
    node.getBoundingClientRect();

  if(rect.top <= 120){

    currentDate =
      node.dataset.msgDate || "";

  }else{

    break;

  }

}

      if(
  currentDate &&
  currentDate !== floatingDate
){

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

  if(scrollFrame.current){

    cancelAnimationFrame(
      scrollFrame.current
    );

  }

  if(scrollBottomFrame.current){

    cancelAnimationFrame(
      scrollBottomFrame.current
    );

  }

  dateElementsRef.current = null;

};
},[messages.length]);

async function loadOlderMessages(){

  if(
    loadingMore ||
    !hasMore ||
    !oldestMessageRef.current
  ){
    return;
  }

  setLoadingMore(true);

  const el = chatRef.current;

  const previousHeight =
    el?.scrollHeight || 0;

  const { data,error } =
  await supabase
    .from("messages")
    .select("*")
    .eq("chat_id",chatId)
    .lt(
      "created_at",
      oldestMessageRef.current
    )
    .order(
      "created_at",
      { ascending:false }
    )
    .limit(PAGE_SIZE);

  if(!error && data){

    const reversed =
      data.reverse();

    if(reversed.length){

      oldestMessageRef.current =
        reversed[0].created_at;

      setMessages(prev => [

        ...reversed,
        ...prev

      ]);

      requestAnimationFrame(()=>{

        if(!el) return;

        const newHeight =
          el.scrollHeight;

        el.scrollTop =
          newHeight - previousHeight;

      });

    }

    setHasMore(
      data.length === PAGE_SIZE
    );

  }

  setLoadingMore(false);

}

const scrollToBottom =
useCallback(()=>{

  const el = chatRef.current;

  if(!el) return;

  if(scrollBottomFrame.current){
    return;
  }

  scrollBottomFrame.current =
    requestAnimationFrame(()=>{

     el.scrollTo({
  top: el.scrollHeight,
  behavior:"smooth"
});

      scrollBottomFrame.current =
        null;

    });

},[]);

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
.limit(PAGE_SIZE);

if(!error && data){

const reversed = data.reverse();
if(reversed.length){

  oldestMessageRef.current =
    reversed[0].created_at;

}

setHasMore(
  data.length === PAGE_SIZE
);

setMessages(reversed);
messageIdsRef.current =
  new Set(
    reversed.map(
      (m:any)=>String(m.id)
    )
  );

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

},[scrollToBottom]);


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

  onlineChannel.unsubscribe();

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

.subscribe();

return ()=>{

  typingChannel.unsubscribe();

  supabase.removeChannel(
    typingChannel
  );

};

},[chatId,userId]);



useEffect(()=>{

if(!chatId || userId === null) return;

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


    
const newMsg:any = payload.new;









setMessages(prev => {
const msgId =
  String(newMsg.id);

if(
  messageIdsRef.current.has(
    msgId
  )
){
  return prev;
}

messageIdsRef.current.add(
  msgId
);

  const updated = [...prev, newMsg];

  if(newMsg.sender_id !== userId){

  pendingReadMessages.current.push(
    newMsg.id
  );

  if(readTimeout.current){

    clearTimeout(
      readTimeout.current
    );

  }

  readTimeout.current =
  setTimeout(async ()=>{

    const ids = [
      ...pendingReadMessages.current
    ];

    pendingReadMessages.current = [];

    await supabase
      .from("messages")
      .update({
        is_read:true
      })
      .in("id",ids);

  },250);

}




  const el = chatRef.current;

  if(
  el &&
  isNearBottomRef.current
){

  requestAnimationFrame(()=>{

    scrollToBottom();

  });

}

  return updated;

});



}
)

.subscribe();

return ()=>{

  channel.unsubscribe();

  supabase.removeChannel(
    channel
  );

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

  if(sending){
    return;
  }

  if(!newMessage.trim()){
    return;
  }
    

if(!newMessage.trim()) return;

const text = newMessage;

setNewMessage("");
setPressed(false);
setReplyTo(null);

await updateTyping(false);







setSending(true);
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

  setSending(false);

  return;
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

setSending(false);


}


const scrollToReplyMessage =
useCallback((
  replyId:string
)=>{

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

},[]);

const handleSwipeMove =
useCallback((
  e:any,
  msgId:string
)=>{

  const delta =
    e.touches[0].clientX
    -
    swipeStartX.current;

  if(delta < 0){

    const limited =
      Math.max(delta,-85);

    setSwipedMsg(msgId);

    if(
      Math.abs(
        limited -
        lastSwipeOffset.current
      ) > 4
    ){

      lastSwipeOffset.current =
        limited;

      setSwipeOffset(limited);

    }

    setShowReplyIcon(
      Math.abs(limited) > 28
    );

  }

},[]);

const handleSwipeEnd =
useCallback((

  

  e:any,
  msg:any
)=>{

  const delta =
    e.changedTouches[0].clientX
    -
    swipeStartX.current;

  if(delta < -45){

    setReplyTo(msg);

  }

  setSwipedMsg(null);

  lastSwipeOffset.current = 0;

  setSwipeOffset(0);

  setShowReplyIcon(false);

},[]);

const handleTouchStart =
useCallback((
  e:any
)=>{

  swipeStartX.current =
    e.touches[0].clientX;

},[]);



function getMessageDateLabel(
  createdAt:string
){

  const msgDate =
    new Date(createdAt);

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

const dateLabel =
  getMessageDateLabel(
    msg.created_at
  );



return(

<React.Fragment key={msg.id}>
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

  msg={msg}

  mine={mine}

  sameAsPrev={sameAsPrev}
  sameAsNext={sameAsNext}

  swipedMsg={swipedMsg}
  swipeOffset={swipeOffset}
  showReplyIcon={showReplyIcon}

  highlightedMsg={highlightedMsg}



  onReplyPreviewClick={()=>{

  if(!msg.reply_to_id){
    return;
  }

  scrollToReplyMessage(
    String(msg.reply_to_id)
  );

}}

onTouchStart={handleTouchStart}

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


</React.Fragment>

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

  const value =
    e.target.value;

  setNewMessage(value);

  clearTimeout(
    typingTimeout.current
  );

  if(!localTypingRef.current){

    localTypingRef.current = true;

    setPressed(true);

    updateTyping(true);

  }

  typingTimeout.current =
    setTimeout(async ()=>{

      localTypingRef.current = false;

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
disabled={sending}

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

opacity:
  sending ? .6 : 1,

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



