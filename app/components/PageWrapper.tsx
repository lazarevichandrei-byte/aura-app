"use client";

import { ReactNode, useRef, useState } from "react";
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

  const [translateX, setTranslateX] = useState(0);

  function touchStart(
    e: React.TouchEvent
  ){
    startX.current =
      e.touches[0].clientX;

    startY.current =
      e.touches[0].clientY;
  }

  function touchMove(
  e: React.TouchEvent
){

  const currentX =
    e.touches[0].clientX;

  const diff =
    currentX - startX.current;

  if(
    startX.current < 30 &&
    diff > 0
  ){
    setTranslateX(
      Math.min(diff,120)
    );
  }
}

  function touchEnd(
  e: React.TouchEvent
){

  const endX =
    e.changedTouches[0].clientX;

  const diff =
    endX - startX.current;

  if(
    enabled &&
    startX.current < 30 &&
    diff > 90
  ){
    router.back();
    return;
  }

  setTranslateX(0);
}

  return (
  <div
    onTouchStart={touchStart}
    onTouchMove={touchMove}
    onTouchEnd={touchEnd}
    style={{
      minHeight:"100vh",

      transform:
        `translateX(${translateX}px)`,

      transition:
        translateX === 0
        ? "transform .22s ease"
        : "none"
    }}
  >
      {children}
    </div>
  );
}