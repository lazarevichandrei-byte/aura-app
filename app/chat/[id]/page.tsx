"use client";

import React,
{
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo
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

import {
  Copy,
  Trash2,
  Reply
} from "lucide-react";


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
const [inputHeight,setInputHeight] =
  useState(36);
const [pressed,setPressed] = useState(false);
const [sending,setSending] =
useState(false);
const [replyTo,setReplyTo] =
useState<any>(null);
const [menuMessage,setMenuMessage] =
useState<any>(null);


const [typingUser,setTypingUser] =
useState(false);
const [isOffline,setIsOffline] =
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
useRef<HTMLTextAreaElement | null>(
  null
);


const touchStartX =
useRef(0);
const longPressTimeout =
useRef<any>(null);
const swipeStartX =
useRef(0);

const touchMovedRef =
useRef(false);

const touchStartYRef =
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
const floatingDateRef =
useRef("");
const [showScrollBottom,
setShowScrollBottom] =
useState(false);





const firstLoadRef =
useRef(true);

const lastScrollTopRef =
useRef(0);

const lastScrollHeightRef =
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

const offlineQueueRef =
useRef<any[]>([]);

const messageIdsRef =
useRef<Set<string>>(
  new Set()
);

const latestMessageDateRef =
useRef<string | null>(null);

const readTimeout =
useRef<any>(null);

const loadingMoreRef =
useRef(false);



const jumpingToReplyRef =
useRef(false);

const ignoreScrollButtonUntilRef =
useRef(0);

const resendFailedMessages =
useCallback(async ()=>{

  const failedMessages =
    messages.filter(
      (m:any)=>
        m.status === "failed"
    );

  for(
    const failedMsg of failedMessages
  ){

    await resendMessage(
      failedMsg
    );

  }

},[
  messages
]);
const PAGE_SIZE = 80;

const quickActionStyle = {

  width:34,
  height:34,

  border:"none",

  borderRadius:"50%",

  background:"transparent",

  display:"flex",

  alignItems:"center",
  justifyContent:"center",

  fontSize:18,

  cursor:"pointer",

  transition:"all .14s ease"
};

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

        

        

      if(
 currentScroll <= 1200 &&
 !loadingMoreRef.current &&
 hasMore
){
  loadingMoreRef.current = true;
  loadOlderMessages();
}

 const distanceFromBottom =

  el.scrollHeight
  -
  currentScroll
  -
  el.clientHeight;

const isNearBottom =
  distanceFromBottom < 120;

isNearBottomRef.current =
  isNearBottom;

const scrollDelta =
  currentScroll -
  lastScrollTopRef.current;

const isScrollingDown =
  scrollDelta > 15;

const isScrollingUp =
  scrollDelta < -15;

if(
  Date.now() >
  ignoreScrollButtonUntilRef.current
){

  if(
    loadingMoreRef.current ||
    currentScroll < 1400
  ){
    setShowScrollBottom(false);
  }
  else if(
    distanceFromBottom > 300 &&
    isScrollingDown
  ){
    setShowScrollBottom(true);
  }
  else if(
    distanceFromBottom < 150 ||
    isScrollingUp
  ){
    setShowScrollBottom(false);
  }

}


      lastScrollTopRef.current =
        currentScroll;

        lastScrollHeightRef.current =
  el.scrollHeight;

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

    if(!node.isConnected){
  continue;
}

  const rect =
    node.getBoundingClientRect();

  if(rect.top <= 120){

    currentDate =
      node.dataset.msgDate || "";
  }

}

  if(currentDate){

  if(
  floatingDateRef.current !==
  currentDate
){

  floatingDateRef.current =
    currentDate;

  setFloatingDate(currentDate);

}

}
      scrollFrame.current = null;

    });

};

    

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
    const previousTop =
  el?.scrollTop || 0;

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
     dateElementsRef.current = null;
floatingDateRef.current = "";
      

      requestAnimationFrame(()=>{

  dateElementsRef.current =

    document.querySelectorAll(
      "[data-msg-date]"
    );

});

      requestAnimationFrame(()=>{

  if(!el) return;

  const newHeight =
    el.scrollHeight;

  const heightDiff =
    newHeight -
    previousHeight;

  el.scrollTop =
    previousTop +
    heightDiff;

});

    }

    setHasMore(
      data.length === PAGE_SIZE
    );

  }

  setLoadingMore(false);

loadingMoreRef.current = false;



}

const scrollToBottom =
useCallback(()=>{

  const el = chatRef.current;

  if(!el) return;

  requestAnimationFrame(()=>{

    requestAnimationFrame(()=>{

      el.scrollTo({
        top: el.scrollHeight,
        behavior:"smooth"
      });

    });

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
if(reversed.length){

  latestMessageDateRef.current =

    reversed[
      reversed.length - 1
    ].created_at;

}
requestAnimationFrame(()=>{

  dateElementsRef.current =

    document.querySelectorAll(
      "[data-msg-date]"
    );

});
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

async function handleReconnect(){
  

 await setOnline();

setIsOffline(false);

await recoverMissedMessages();

await processOfflineQueue();

resendFailedMessages();

}

function handleOffline(){

  console.log("offline event ignored");

}

function handleVisibility(){

  if(document.hidden){

    offlineTimer = setTimeout(()=>{

      setOffline();

    },15000);

  }else{

    clearTimeout(offlineTimer);

    setOnline();
resendFailedMessages();

  }

}

  loadChat();

  document.addEventListener(
    "visibilitychange",
    handleVisibility
  );

  window.addEventListener(
  "online",
  handleReconnect
);

window.addEventListener(
  "offline",
  handleOffline
);

  return ()=>{

    document.removeEventListener(
      "visibilitychange",
      handleVisibility
    );

    window.removeEventListener(
  "online",
  handleReconnect
);

window.removeEventListener(
  "offline",
  handleOffline
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

if(isNearBottomRef.current){

  requestAnimationFrame(()=>{

    scrollToBottom();

  });

}
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

if(newMsg.sender_id === userId){
  return;
}

(window as any)
?.Telegram
?.WebApp
?.HapticFeedback
?.notificationOccurred(
  "success"
);












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

latestMessageDateRef.current =
  newMsg.created_at;



  const updated = [
  ...prev,
  {
    ...newMsg,
    status:"delivered"
  }
];

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

.on(
  "postgres_changes",
  {
    event:"UPDATE",
    schema:"public",
    table:"messages",
    filter:`chat_id=eq.${chatId}`
  },
  (payload)=>{

    const updatedMsg:any =
      payload.new;

    setMessages(prev =>

      prev.map((m:any)=>

        String(m.id) ===
        String(updatedMsg.id)

        ? {
            ...m,
            is_read:
              updatedMsg.is_read
          }

        : m

      )

    );

  }
)

.on(
  "postgres_changes",
  {
    event:"DELETE",
    schema:"public",
    table:"messages",
    filter:`chat_id=eq.${chatId}`
  },
  (payload)=>{

    const deletedMsg:any =
      payload.old;

    messageIdsRef.current.delete(
      String(deletedMsg.id)
    );

    setMessages(prev =>

      prev.filter(
        (m:any)=>

          String(m.id) !==
          String(deletedMsg.id)

      )

    );

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

      lastScrollTopRef.current =
  el.scrollTop;

isNearBottomRef.current =
  true;

  if(
  el &&
  el.scrollHeight >
    el.clientHeight
){

  const distanceFromTop =

    el.scrollHeight
    -
    el.clientHeight
    -
    el.scrollTop;

  if(distanceFromTop < 1400){

    loadOlderMessages();

  }

}

  el.dispatchEvent(
  new Event("scroll")
);

  });

},[messages,otherUser]);



useEffect(()=>{

  if(!newMessage.trim()){

    setInputHeight(36);

    if(inputRef.current){

      inputRef.current.style.height =
        "36px";

    }

  }

},[newMessage]);





async function updateTyping(status:boolean){

 if(userId === null) return;

 const payload = {
  chat_id: chatId,
  user_id: userId,
  typing: status,
  updated_at: new Date().toISOString()
 };

 const { error } = 
   await supabase
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

async function recoverMissedMessages(){

  if(
    !latestMessageDateRef.current
  ){
    return;
  }

  const { data,error } =
  await supabase

    .from("messages")

    .select("*")

    .eq("chat_id",chatId)

    .gt(
      "created_at",
      latestMessageDateRef.current
    )

    .order(
      "created_at",
      { ascending:true }
    );

  if(error || !data?.length){
    return;
  }

  setMessages(prev => {

    const updated = [...prev];

    for(const msg of data){

      const msgId =
        String(msg.id);

      if(
        messageIdsRef.current.has(
          msgId
        )
      ){
        continue;
      }

      messageIdsRef.current.add(
        msgId
      );

      updated.push({
        ...msg,
        status:"delivered"
      });

    }

    return updated;

  });

  latestMessageDateRef.current =

    data[
      data.length - 1
    ].created_at;

}

async function processOfflineQueue(){

  if(
    !offlineQueueRef.current.length
  ){
    return;
  }

  const queued = [
    ...offlineQueueRef.current
  ];

  offlineQueueRef.current = [];

  for(const item of queued){

    const { error } =
    await supabase
      .from("messages")
      .insert({

        chat_id:chatId,

        sender_id:userId,

        body:item.body,

        message_type:"text",

        reply_to_id:
          item.replyTo?.id || null,

        reply_preview:
          item.replyTo?.body || null

      });

    if(error){

      offlineQueueRef.current.push(
        item
      );

    }

  }

}

async function resendMessage(
  failedMsg:any
){

  if(userId === null){
    return;
  }

  setMessages(prev =>

    prev.map((m:any)=>

      m.id === failedMsg.id
      ? {
          ...m,
          status:"sending"
        }
      : m

    )

  );

  const { data,error } =
  await supabase
    .from("messages")
    .insert({

      chat_id:chatId,

      sender_id:userId,

      body:failedMsg.body,

      message_type:"text",

      reply_to_id:
        failedMsg.reply_to_id || null,

      reply_preview:
        failedMsg.reply_preview || null

    })
    .select()
    .single();

  if(error){

    setMessages(prev =>

      prev.map((m:any)=>

        m.id === failedMsg.id
        ? {
            ...m,
            status:"failed"
          }
        : m

      )

    );

    return;
  }

  if(data){

    setMessages(prev =>

      prev.map((m:any)=>

        m.id === failedMsg.id
        ? {
            ...data,
            client_id:
              failedMsg.client_id
          }
        : m

      )

    );

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

if(!navigator.onLine){

  offlineQueueRef.current.push({
    body:newMessage,
    replyTo
  });

}

const text = newMessage;

const optimisticId =
  `temp-${Date.now()}`;

const optimisticMessage = {

  id: optimisticId,

  client_id: optimisticId,

  chat_id: chatId,

  sender_id: userId,

  body: text,

  message_type:"text",

  created_at:
    new Date().toISOString(),

  is_read:false,

  status:"sending",

  reply_to_id:
    replyTo?.id || null,

  reply_preview:
    replyTo?.body || null

};

setNewMessage("");

requestAnimationFrame(()=>{

  setInputHeight(36);

  if(inputRef.current){

    inputRef.current.style.height =
      "36px";

  }

});
setMessages(prev => [
  ...prev,
  optimisticMessage
]);

setTimeout(()=>{

  const el = chatRef.current;

  if(!el) return;

  el.scrollTo({
    top: el.scrollHeight,
    behavior:"auto"
  });

},0);
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

  setMessages(prev =>

    prev.map((m:any)=>

      m.id === optimisticId
      ? {
          ...m,
          status:"failed"
        }
      : m

    )

  );

  setSending(false);

  return;
}

if(data){

  setMessages(prev =>

    prev.map((m:any)=>

      m.id === optimisticId
     ? {
  ...data,
  client_id: optimisticId,
  status:"sent"
}
      : m

    )

  );

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
useCallback(async(
  replyId:string
)=>{

  jumpingToReplyRef.current = true;

  ignoreScrollButtonUntilRef.current =
  Date.now() + 1500;

let el =
document.getElementById(
  `msg-${replyId}`
);

  let attempts = 0;

  while(
    !el &&
    hasMore &&
    attempts < 20
  ){

    await loadOlderMessages();

    await new Promise(
      resolve =>
        setTimeout(resolve,250)
    );

    el =
      document.getElementById(
        `msg-${replyId}`
      );

    attempts++;

  }

  if(!el){
    return;
  }

  dateElementsRef.current =
  document.querySelectorAll(
    "[data-msg-date]"
  );

  el.scrollIntoView({
    behavior:"smooth",
    block:"center"
  });

  setHighlightedMsg(replyId);

  setTimeout(()=>{

    setHighlightedMsg(null);

  },1400);

setTimeout(()=>{

  jumpingToReplyRef.current = false;

},1500);

},[
  hasMore
]);

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
  Math.max(delta,-120);

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
  Math.abs(limited) > 45
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

    

  if(delta < -90){

  (window as any)
?.Telegram
?.WebApp
?.HapticFeedback
?.impactOccurred(
  "light"
);

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

  touchStartYRef.current =
    e.touches[0].clientY;

  touchMovedRef.current =
    false;

},[]);

const handleTouchMoveTap =
useCallback((e:any)=>{

  const moveY =
    Math.abs(
      e.touches[0].clientY -
      touchStartYRef.current
    );

  const moveX =
    Math.abs(
      e.touches[0].clientX -
      swipeStartX.current
    );

  if(
  moveY > 10
){

    touchMovedRef.current =
      true;

  }

},[]);

const handleMessageTap =
useCallback((msg:any)=>{

  if(
    touchMovedRef.current
  ){
    return;
  }

  setMenuMessage(prev =>

    prev?.id === msg.id
      ? null
      : msg

  );

},[]);

const handleMessageLongPress =
useCallback(()=>{},[]);

const clearLongPress =
useCallback(()=>{

  if(longPressTimeout.current){

    clearTimeout(
      longPressTimeout.current
    );

  }

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

const handleRetryMessage =
useCallback((msg:any)=>{

  resendMessage(msg);

},[]);

const handleReplyPreview =
useCallback((replyId:string)=>{

  scrollToReplyMessage(replyId);

},[
  scrollToReplyMessage
]);

const handleSwipeMoveMessage =
useCallback((
  e:any,
  msgId:string
)=>{

  handleSwipeMove(
    e,
    msgId
  );

},[
  handleSwipeMove
]);

const handleSwipeEndMessage =
useCallback((
  e:any,
  msg:any
)=>{

  handleSwipeEnd(
    e,
    msg
  );

},[
  handleSwipeEnd
]);

const renderedMessages =
useMemo(()=>{

return messages.map((msg,index)=>{

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

<React.Fragment
  key={
    msg.client_id || msg.id
  }
>

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

{menuMessage?.id === msg.id && (

<div
style={{
  display:"flex",

  justifyContent:
    mine
    ? "flex-end"
    : "flex-start",

  marginBottom:6,

  paddingLeft:
    mine ? 0 : 14,

  paddingRight:
    mine ? 14 : 0,

  animation:
    "quickMenuIn .18s ease"
}}
>

<div
style={{
  display:"flex",
  alignItems:"center",
  gap:8,

  padding:"8px 10px",

  borderRadius:999,

  background:
    "rgba(255,255,255,.72)",

  backdropFilter:
    "blur(18px)",

  boxShadow:
    "0 10px 30px rgba(0,0,0,.12)"
}}
>

<button

  onClick={()=>{

    setReplyTo(msg);

    setMenuMessage(null);

  }}

  className="quick-action"
>

<Reply
  size={18}
  strokeWidth={2.2}
  color="currentColor"
/>

<span>
  Ответить
</span>

</button>

<button

  onClick={async()=>{

    await navigator
      .clipboard
      .writeText(
        msg.body || ""
      );

    setMenuMessage(null);

  }}

  className="quick-action"
>

<Copy
  size={18}
  strokeWidth={2.2}
  color="currentColor"
/>

<span>
  Копировать
</span>

</button>

{mine && (

<button

  onClick={async(e:any)=>{

    e.stopPropagation();


  const { error } = await supabase
  .from("messages")
  .delete()
  .eq("id", msg.id);



if(!error){

  messageIdsRef.current.delete(
    String(msg.id)
  );

  setMessages(prev =>

    prev.filter(
      m =>
      String(m.id) !==
      String(msg.id)
    )

  );

}

setMenuMessage(null);

}}

   className="quick-action"
>

<Trash2
  size={18}
  strokeWidth={2.2}
  color="currentColor"
/>

<span>
  Удалить
</span>

</button>

)}

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
menuMessageId={
  menuMessage?.id || null
}

onReplyPreviewClick={()=>{

  if(msg.reply_to_id){

    handleReplyPreview(
      String(msg.reply_to_id)
    );

  }

}}

onTouchStart={handleTouchStart}

onTouchMove={(e)=>{

  handleTouchMoveTap(e);

  handleSwipeMoveMessage(
    e,
    String(msg.id)
  );

}}

onTouchEnd={(e)=>
  handleSwipeEndMessage(
    e,
    msg
  )
}

onClick={()=>
  handleMessageTap(msg)
}

onRetry={()=>
  handleRetryMessage(msg)
}

onLongPressStart={()=>
  handleMessageLongPress()
}

onLongPressEnd={()=>{}}

clearLongPress={
  clearLongPress
}
/>

</React.Fragment>

);

});

},[
messages,
userId,
firstUnreadId,
highlightedMsg,
menuMessage,

swipedMsg,
swipeOffset,
showReplyIcon
]);

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
overflow:"visible",
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
isOffline
? "нет соединения"

: otherUser?.last_seen &&
(
  Date.now() -
  new Date(
    otherUser.last_seen
  ).getTime()
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
  display:"flex",
  alignItems:"center",
  gap:4,
  marginTop:4,
  height:10
}}
>

<div className="typing-dot" />
<div className="typing-dot" />
<div className="typing-dot" />

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

onClick={()=>{

  if(menuMessage){

    setMenuMessage(null);

  }

}}



style={{
flex:1,
minHeight:0,
overflowY:"auto",
padding:"12px 10px 6px",
paddingBottom:"20px",
overscrollBehavior:"contain",
WebkitOverflowScrolling:"touch",
}}
>

{loadingMore && (

  <div
    style={{
      display:"flex",
      justifyContent:"center",
      alignItems:"center",
      gap:4,
      padding:"12px 0"
    }}
  >

    <div className="load-dot" />
    <div className="load-dot" />
    <div className="load-dot" />

  </div>

)}

{renderedMessages}

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
position:"relative",

maxWidth:"100%",
overflow:"hidden"
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
  paddingRight:20,

  overflow:"hidden",
  textOverflow:"ellipsis",

  display:"-webkit-box",
  WebkitLineClamp:2,
  WebkitBoxOrient:"vertical",

  wordBreak:"break-word",
  whiteSpace:"normal",

  maxWidth:"100%"
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

paddingLeft:12,
paddingRight:4,
paddingTop:2,
paddingBottom:2,

minHeight:inputHeight + 12,
height:inputHeight + 12,

maxHeight:140,

overflow:"hidden",

transition:
  "height .18s ease",

border:"1px solid #E7ECF2",

boxSizing:"border-box"
}}
>


   

<textarea
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
  
  const textarea =
  inputRef.current;

if(textarea){

  textarea.style.height = "auto";

  const nextHeight =
    Math.max(
      36,
      Math.min(
        textarea.scrollHeight,
        120
      )
    );

  textarea.style.height =
    `${nextHeight}px`;

  setInputHeight(nextHeight);

}

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

      setMenuMessage(null);

      await updateTyping(false);

    },1500);

}}


placeholder="Сообщение..."
rows={1}

style={{
  flex:1,

  minWidth:0,

  width:"100%",

  border:"none",
  outline:"none",

  background:"transparent",

  minHeight:36,
maxHeight:120,



lineHeight:"20px",

paddingTop:6,
paddingBottom:6,


  resize:"none",

  overflowY:"auto",

  WebkitOverflowScrolling:"touch",

display:"block",



maxWidth:"100%",

  

  overflowX:"hidden",

  wordBreak:"break-word",

  whiteSpace:"pre-wrap",

  boxSizing:"border-box",

  paddingRight:10,

  fontSize:16,




}}
></textarea>

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
width:
  newMessage.trim()
  ? 44
  : 38,

height:
  newMessage.trim()
  ? 44
  : 38,
borderRadius:"50%",
background:
  newMessage.trim()
  ? "#2E7BFF"
  : "#AEBFD8",
display:"flex",
alignItems:"center",
justifyContent:"center",
color:"#fff",
border:"none",
outline:"none",
flexShrink:0,

opacity:
  sending
  ? .6
  : newMessage.trim()
  ? 1
  : .82,
  transform:
  newMessage.trim()
  ? "scale(1)"
  : "scale(.92)",

transition:"min-height .18s ease, max-height .18s ease",

boxShadow:
  newMessage.trim()
  ? "0 4px 14px rgba(46,123,255,.28)"
  : "none",

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

@keyframes fadeIn{

  from{
    opacity:0;
  }

  to{
    opacity:1;
  }

}

@keyframes menuPop{

  from{
    opacity:0;
    transform:scale(.92);
  }

  to{
    opacity:1;
    transform:scale(1);
  }

}

@keyframes quickMenuIn{

  from{
    opacity:0;

    transform:
      translateY(6px)
      scale(.92);
  }

  to{
    opacity:1;

    transform:
      translateY(0px)
      scale(1);
  }

}

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

.typing-dot{

  width:6px;
  height:6px;

  border-radius:50%;

  background:#7A8699;

  animation:
    typingBounce 1s infinite ease-in-out;

}

.quick-action{

  background:transparent;

  border:none;

  display:flex;

  flex-direction:column;

  align-items:center;

  justify-content:center;

  gap:2px;

  min-width:52px;

  cursor:pointer;

  color:#111;

  transition:
    color .18s ease,
    transform .18s ease;

}

.quick-action span{

  font-size:8px;

  font-weight:500;

  color:#7A8699;

}

.quick-action:hover,
.quick-action:active{

  color:#2E7BFF;

  transform:scale(.92);

}

.typing-dot:nth-child(2){
  animation-delay:.15s;
}

.typing-dot:nth-child(3){
  animation-delay:.3s;
}

@keyframes typingBounce{

  0%,80%,100%{
    transform:scale(.7);
    opacity:.45;
  }

  40%{
    transform:scale(1);
    opacity:1;
  }

}

.load-dot{

  width:6px;
  height:6px;

  border-radius:50%;

  background:#7A8699;

  animation:
    loadBounce 1s infinite ease-in-out;

}

.load-dot:nth-child(2){

  animation-delay:.15s;

}

.load-dot:nth-child(3){

  animation-delay:.3s;

}

@keyframes loadBounce{

  0%,80%,100%{

    transform:scale(.7);

    opacity:.35;

  }

  40%{

    transform:scale(1);

    opacity:1;

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



