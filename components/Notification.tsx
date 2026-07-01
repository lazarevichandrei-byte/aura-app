"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  title: string;
  text: string;
  icon?: string;
  type?: "success" | "error" | "warning" | "info";
  onClose: () => void;
};

export default function Notification({
  title,
  text,
  icon = "🔔",
  type = "info",
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

  info: "#2F80FF"

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
  },2500);

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

      onPointerDown={pointerDown}

      onPointerMove={pointerMove}

      onPointerUp={pointerUp}

      onPointerLeave={pointerUp}

      style={{

        position:"fixed",

        top:20,

        left:16,

        right:16,

        zIndex:999999,

        background:"#FFFFFF",

        borderRadius:20,

        overflow:"hidden",

        userSelect:"none",

        touchAction:"pan-y",

        boxShadow:
          "0 12px 40px rgba(0,0,0,.18)",

        opacity:
          visible
            ? 1
            : 0,

        transform:
          `translateX(${translateX}px)
           translateY(${visible ? 0 : -20}px)`,

        transition:
          dragging
            ? "none"
            : "all .18s ease"

      }}

    >

      <div
        style={{
          display:"flex",
          alignItems:"center",
          gap:14,
          padding:16
        }}
      >

        <div
          style={{
            fontSize:30
          }}
        >
          {icon}
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

      <div

        style={{

          height:3,

          background:"#2F80FF",

          animation:
            "progress 2.5s linear forwards"

        }}

      />

      <style jsx>{`

        @keyframes progress{

          from{

            width:100%;

          }

          to{

            width:0%;

          }

        }

      `}</style>

    </div>

  );

}