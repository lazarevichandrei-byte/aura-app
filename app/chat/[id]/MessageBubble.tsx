"use client";

import React from "react";
import {
  BackSquare,
  TickCircle
} from "iconsax-react";

type Props = {
  msg:any;
  mine:boolean;

  sameAsPrev:boolean;
  sameAsNext:boolean;

  swipedMsg:string | null;
  swipeOffset:number;
  showReplyIcon:boolean;

  highlightedMsg:string | null;

  

  onReplyPreviewClick:()=>void;

  onTouchStart:(e:any)=>void;
  onTouchMove:(e:any)=>void;
  onTouchEnd:(e:any)=>void;
  onRetry:()=>void;
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

  
  onReplyPreviewClick,

  onTouchStart,
  onTouchMove,
 onTouchEnd,
onRetry

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

    
  return(

    

    <div
      id={`msg-${msg.id}`}

      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}

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

            transform:"translateY(-50%)",

            width:28,
            height:28,

            borderRadius:"50%",

            background:"#E8F1FF",

            display:"flex",
            alignItems:"center",
            justifyContent:"center",

            opacity:
              Math.min(
                Math.abs(swipeOffset) / 40,
                1
              ),

            transition:"opacity .12s ease"
          }}
        >

          <BackSquare
            size="16"
            color="#2E7BFF"
            variant="Outline"
          />

        </div>

      )}

      <div

  onClick={()=>{

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

          width:"fit-content",
          maxWidth:"80%",

          wordBreak:"break-word",
          overflowWrap:"break-word",

          boxShadow:
            highlightedMsg === String(msg.id)
            ? "0 0 0 2px rgba(46,123,255,.35)"
            : "none",

          transform:
            swipedMsg === String(msg.id)
            ? `translateX(${swipeOffset}px)`
            : "translateX(0px)",

          transition:"transform .12s ease",
        }}
      >

        {msg.reply_preview && (

          <div

            onClick={onReplyPreviewClick}

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
  display:"flex",
  alignItems:"center",
  marginLeft:2,
  position:"relative",
width:22,
height:15
}}
>

<TickCircle
  size="15"

  style={{
    position:"absolute",
    left:0
  }}

  color={

    msg.status === "sending"
    ? "rgba(255,255,255,.4)"

    : msg.status === "failed"
    ? "#FF6B6B"

    : msg.is_read
    ? "#8DFF61"

    : msg.status === "delivered"
    ? "#7ED6FF"

    : "rgba(255,255,255,.72)"
  }
  variant="Bulk"
/>

{(
  msg.status === "delivered" ||
  msg.is_read
) && (

<TickCircle
  size="15"

  style={{
    position:"absolute",
    left:7
  }}

  color={
    msg.is_read
    ? "#8DFF61"
    : "#7ED6FF"
  }
  variant="Bulk"
/>

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

  return(

  prev.msg.id === next.msg.id &&
  prev.msg.body === next.msg.body &&
  prev.msg.is_read === next.msg.is_read &&

  prev.msg.reply_preview ===
  next.msg.reply_preview &&

  prev.msg.reply_to_id ===
  next.msg.reply_to_id &&

  prevHighlighted ===
  nextHighlighted &&

  prevSwiped ===
  nextSwiped &&

  prev.swipeOffset ===
  next.swipeOffset &&

  prev.showReplyIcon ===
  next.showReplyIcon &&

  prev.sameAsNext ===
  next.sameAsNext &&

  prev.sameAsPrev ===
  next.sameAsPrev

);

}
);