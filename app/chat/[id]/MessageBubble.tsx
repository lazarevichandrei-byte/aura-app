"use client";

import React,
{
  useRef
} from "react";
import {
  Reply
} from "lucide-react";

type Props = {
  msg:any;
  mine:boolean;

  sameAsPrev:boolean;
  sameAsNext:boolean;

  swipedMsg:string | null;
  swipeOffset:number;
  showReplyIcon:boolean;

  highlightedMsg:string | null;
  menuMessageId:string | null;

  

  onReplyPreviewClick:()=>void;

  onTouchStart:(e:any)=>void;
onTouchMove:(e:any)=>void;
onTouchEnd:(e:any)=>void;

onClick:()=>void;

onRetry:()=>void;
  onLongPressStart:()=>void;
onLongPressEnd:()=>void;
clearLongPress:()=>void;
};

function MessageBubbleComponent({


  msg,
  mine,

  sameAsPrev,
  sameAsNext,

  swipedMsg,
  swipeOffset,
  showReplyIcon,

  highlightedMsg,
  menuMessageId,

  
  onReplyPreviewClick,

  onTouchStart,
  onTouchMove,
 onTouchEnd,
 onClick,
onRetry,

onLongPressStart,
onLongPressEnd,
clearLongPress

}:Props){

const messageTime =
  new Date(
    msg.created_at || Date.now()
  ).toLocaleTimeString(
    "ru-RU",
    {
      hour:"2-digit",
      minute:"2-digit"
    }
  );

const touchMoved =
  useRef(false);

  const startTouchX =
  useRef(0);

const startTouchY =
  useRef(0);

return(

    

    <div
      id={`msg-${msg.id}`}

     onTouchStart={(e)=>{

  touchMoved.current = false;

  startTouchX.current =
    e.touches[0].clientX;

  startTouchY.current =
    e.touches[0].clientY;

  onTouchStart(e);

  onLongPressStart();

}}

onTouchMove={(e)=>{

  const deltaX = Math.abs(

    e.touches[0].clientX
    -
    startTouchX.current

  );

  const deltaY = Math.abs(

    e.touches[0].clientY
    -
    startTouchY.current

  );

  if(
    deltaX > 12 ||
    deltaY > 12
  ){

    touchMoved.current = true;

    clearLongPress();

  }

  onTouchMove(e);

}}



onTouchEnd={(e)=>{

  clearLongPress();

  if(!touchMoved.current){

    onLongPressEnd();

  }

  onTouchEnd(e);

}}

      style={{
        position:"relative",
        display:"flex",

        justifyContent:
          mine ? "flex-end" : "flex-start",

        paddingLeft: mine ? 60 : 0,
        paddingRight: mine ? 0 : 60,

        marginBottom:
          sameAsNext
          ? 2
          : 10,

      }}
    >

      {showReplyIcon &&
      swipedMsg === String(msg.id) && (

        <div
          style={{
            position:"absolute",

            left: mine ? "auto" : 16,
            right: mine ? 16 : "auto",

            top:"50%",

            

            width:34,
height:34,

borderRadius:"50%",

background:"#EEF4FF",

boxShadow:
  "0 4px 14px rgba(46,123,255,.18)",

            display:"flex",
            alignItems:"center",
            justifyContent:"center",

            opacity:
              Math.min(
                Math.abs(swipeOffset) / 40,
                1
              ),

            transform:
  `translateY(-50%) scale(${
    Math.min(
      Math.abs(swipeOffset) / 40,
      1
    )
  })`,

transition:
  "opacity .12s ease, transform .12s ease"
          }}
        >

          <Reply
  size={16}
  color="#111"
/>

        </div>

      )}

      <div

  onClick={()=>{

    clearLongPress();

    onClick();

    if(msg.status === "failed"){

      onRetry();

    }

  }}

  style={{

    background: mine
          ? "linear-gradient(135deg,#59A8FF,#2E7BFF)"
          : "#F2F4F7",

          color:
            mine
            ? "#fff"
            : "#111",

          padding:"8px 13px",

          fontSize:13,
          fontWeight:500,
          lineHeight:"17px",

          borderTopLeftRadius:
            !mine && sameAsPrev
            ? 8
            : 18,

          borderTopRightRadius:
            mine && sameAsPrev
            ? 8
            : 18,

          borderBottomLeftRadius:
            !mine && sameAsNext
            ? 8
            : 18,

          borderBottomRightRadius:
            mine && sameAsNext
            ? 8
            : 18,

          width:"auto",
maxWidth:"80%",

whiteSpace:"pre-wrap",
wordBreak:"break-all",
overflowWrap:"anywhere",
boxSizing:"border-box",

boxShadow:
  highlightedMsg === String(msg.id)
  ? "0 0 0 2px rgba(46,123,255,.35), 0 8px 24px rgba(46,123,255,.18)"
  : "none",

transform:

  highlightedMsg === String(msg.id)

  ? "scale(1.05)"

  : (
      swipedMsg === String(msg.id)
      ? `translateX(${swipeOffset}px)`
      : "translateX(0px)"
    ),

transition:

  highlightedMsg === String(msg.id)

  ? "all .25s ease"

  : (
      swipedMsg === String(msg.id)
      ? "none"
      : "transform .22s cubic-bezier(.16,1,.3,1)"
    ),
        }}
      >

        {msg.reply_preview && (

          <div

            onClick={(e)=>{

  e.stopPropagation();

  onReplyPreviewClick();

}}

            style={{
              background:
                mine
                ? "rgba(255,255,255,.16)"
                : "#E8F0FF",

              padding:"6px 8px",

              borderRadius:10,

              marginBottom:6,

              fontSize:11,

              cursor:"pointer"
            }}
          >
            {msg.reply_preview}
          </div>

        )}

        {msg.body}

        {!sameAsNext && (

          <div
            style={{
              marginTop:5,

              fontSize:10,
              fontWeight:600,

              opacity:.55,

              letterSpacing:0.2,

              display:"flex",
              alignItems:"center",
              justifyContent:"flex-end",

              gap:3
            }}
          >

            {mine && (
              <div style={{flex:1}} />
            )}

            <span>
  {messageTime}
</span>

            {mine && (

              <div
                style={{
                  display:"flex",
                  alignItems:"center",

                  marginLeft:2,

                  filter:
                    msg.is_read
                    ? "drop-shadow(0 0 8px rgba(141,255,97,.85))"
                    : "none"
                }}
              >

                <div
style={{
  position:"relative",
  WebkitTouchCallout:"none",

WebkitUserSelect:"none",

userSelect:"none",
  width:
    msg.status === "delivered" ||
    msg.is_read
    ? 18
    : 10,

  height:10,
  marginLeft:4
}}
>

<svg
width="11"
height="9"
viewBox="0 0 11 9"
fill="none"
style={{
  position:"absolute",
  left:0,
  top:1
}}
>

<path
d="M1 4.5L4 7.5L10 1.5"
stroke={

  msg.status === "sending"
  ? "rgba(255,255,255,.45)"

  : msg.status === "failed"
  ? "#FF6B6B"

  : msg.is_read
  ? "#8DFF61"

  : msg.status === "delivered"
  ? "#7ED6FF"

  : "rgba(255,255,255,.72)"
}
strokeWidth="1.8"
strokeLinecap="round"
strokeLinejoin="round"
/>

</svg>

{(
  msg.status === "delivered" ||
  msg.is_read
) && (

<svg
width="11"
height="9"
viewBox="0 0 11 9"
fill="none"
style={{
  position:"absolute",
  left:5,
  top:1
}}
>

<path
d="M1 4.5L4 7.5L10 1.5"
stroke={
  msg.is_read
  ? "#8DFF61"
  : "#7ED6FF"
}
strokeWidth="1.8"
strokeLinecap="round"
strokeLinejoin="round"
/>

</svg>

)}

</div>

              </div>

            )}

          </div>

        )}

      </div>

    </div>

  );

}

export const MessageBubble =
React.memo(
  MessageBubbleComponent,
  (prev,next)=>{

  const prevHighlighted =

    prev.highlightedMsg ===
    String(prev.msg.id);

  const nextHighlighted =

    next.highlightedMsg ===
    String(next.msg.id);

  const prevSwiped =
  
  

    prev.swipedMsg ===
    String(prev.msg.id);

  const nextSwiped =

    next.swipedMsg ===
    String(next.msg.id);

    const prevMenuOpen =

  prev.menuMessageId ===
  String(prev.msg.id);

const nextMenuOpen =

  next.menuMessageId ===
  String(next.msg.id);



  return(

  prev.msg.id === next.msg.id &&
  prev.msg.body === next.msg.body &&
  prev.msg.is_read === next.msg.is_read &&
  prev.msg.status ===
next.msg.status &&

  prev.msg.reply_preview ===
  next.msg.reply_preview &&

  prev.msg.reply_to_id ===
  next.msg.reply_to_id &&

  prevHighlighted ===
  nextHighlighted &&

  

  prev.sameAsNext ===
  next.sameAsNext &&

 prev.sameAsPrev ===
next.sameAsPrev &&

prev.sameAsPrev ===
next.sameAsPrev &&

prev.swipeOffset ===
next.swipeOffset &&

prev.swipedMsg ===
next.swipedMsg &&

prev.showReplyIcon ===
next.showReplyIcon &&

prevMenuOpen ===
nextMenuOpen
);

}
);