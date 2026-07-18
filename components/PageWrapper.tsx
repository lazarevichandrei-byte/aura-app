"use client";

import {
  ReactNode,
  useRef,
  useEffect,
  useState
} from "react";
import { useRouter } from "next/navigation";

export default function PageWrapper({
  children,
  enabled = true
}:{
  children: ReactNode;
  enabled?: boolean;
}){

  const router = useRouter();

  const startX = useRef(0);
  const startY = useRef(0);

  const [visible, setVisible] =
  useState(false);

useEffect(() => {

  requestAnimationFrame(() => {
    setVisible(true);
  });

}, []);

  

  function touchStart(
    e: React.TouchEvent
  ){
    startX.current =
      e.touches[0].clientX;

      const startedFromEdge =
  startX.current < 30;

if (!startedFromEdge) {
  startX.current = -1;
  return;
}

    startY.current =
      e.touches[0].clientY;
  }

  
if (startX.current === -1) {
  return;
}

  function touchEnd(
  e: React.TouchEvent
){

  const endX =
    e.changedTouches[0].clientX;

  const endY =
    e.changedTouches[0].clientY;

  const diffX =
    endX - startX.current;

  const diffY =
    Math.abs(
      endY - startY.current
    );

  if(
    enabled &&
    diffX > 120 &&
    diffY < 80
  ){
    router.back();
  }
}

  return (
  <div
    onTouchStart={touchStart}
    onTouchEnd={touchEnd}
    style={{
  minHeight:"100vh",

  opacity: visible ? 1 : 0,

  transform: visible
    ? "translateY(0)"
    : "translateY(10px)",

  transition:
    "opacity .22s ease, transform .22s ease"
}}
  >
      {children}
    </div>
  );
}