"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  title: string;
  text: string;
  icon?: string;
  type?: "success" | "error" | "warning" | "info";
  onOpen?: () => void;
  onClose: () => void;
};

export default function Notification({
  title,
  text,
  icon = "🔔",
  type = "info",
  onOpen,
  onClose
}: Props) {

  const [visible, setVisible] = useState(false);

  const [translateX, setTranslateX] = useState(0);

  const [dragging, setDragging] = useState(false);

  const startX = useRef(0);

  const accentColor = {

  success: "#22C55E",

  error: "#EF4444",

  warning: "#F59E0B",

  info: "var(--brand-primary)"

}[type];

const accentBackground = {

  success: "#DCFCE7",

  error: "#FEE2E2",

  warning: "#FEF3C7",

  info: "var(--brand-soft)"

}[type];

  function closeNotification() {

    setVisible(false);

    setTimeout(() => {
      onClose();
    },180);

  }

  useEffect(() => {

  setVisible(false);
  setTranslateX(0);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      setVisible(true);
    });
  });

  const timer = setTimeout(() => {
    closeNotification();
  },3500);

  return () => clearTimeout(timer);

}, [title, text, icon]);

  function pointerDown(
    e: React.PointerEvent
  ){

    startX.current = e.clientX;

    setDragging(true);

  }

  function pointerMove(
    e: React.PointerEvent
  ){

    if(!dragging) return;

    const diff =
  e.clientX -
  startX.current;

if (Math.abs(diff) < 8) {
  return;
}

setTranslateX(diff);
    setTranslateX(diff);

  }

  function pointerUp(){

    setDragging(false);

    if(Math.abs(translateX)>90){

      setTranslateX(
        translateX>0
          ? window.innerWidth
          : -window.innerWidth
      );

      setTimeout(()=>{
        onClose();
      },180);

      return;

    }

    setTranslateX(0);

  }

  return(

    <div

      onClick={()=>{
        if(!dragging && Math.abs(translateX)<8 && onOpen){
          onOpen();
          closeNotification();
        }
      }}

      onPointerDown={pointerDown}

      onPointerMove={pointerMove}

      onPointerUp={pointerUp}

      onPointerLeave={pointerUp}

      style={{

        position:"fixed",

        top:"calc(env(safe-area-inset-top, 0px) + 12px)",

        left:16,

        right:16,

        zIndex:999999,

        background:"var(--surface-elevated)",
        color:"var(--text-primary)",

        borderRadius:20,

        overflow:"hidden",

        userSelect:"none",

        cursor:onOpen ? "pointer" : "default",

        touchAction:"pan-y",

        boxShadow:"var(--shadow-md)",
        border:"1px solid var(--border)",

        opacity:
  visible
    ? Math.max(
        0.2,
        1 - Math.abs(translateX) / 220
      )
    : 0,

        transform:
          `translateX(${translateX}px)
           translateY(${visible ? 0 : -20}px)`,

        transition:
dragging
? "none"
: "all .22s cubic-bezier(.22,1,.36,1)"

      }}

    >
        <div
  style={{
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    background: accentColor
  }}
/>

      <div
        style={{
          display:"flex",
          alignItems:"center",
          gap:14,
          padding:"16px 16px 16px 22px"
        }}
      >

       <div
  style={{
    width:44,
    height:44,

    borderRadius:14,

    background:accentBackground,

    display:"flex",

    justifyContent:"center",

    alignItems:"center",

    flexShrink:0
  }}
>

  <span
    style={{
      fontSize:24
    }}
  >
    {icon}
  </span>

</div>

        <div
  style={{
    flex:1,
    paddingRight:4
  }}
>

          <div
            style={{
              fontWeight:700,
              fontSize:16
            }}
          >
            {title}
          </div>

          <div
            style={{
              marginTop:4,
              color:"#667085",
              fontSize:14,
              lineHeight:1.35
            }}
          >
            {text}
          </div>

        </div>

        

      </div>

      

    </div>

  );

}
