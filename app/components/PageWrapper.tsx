"use client";

import { ReactNode, useRef } from "react";
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

  function touchStart(
    e: React.TouchEvent
  ){
    startX.current =
      e.touches[0].clientX;

    startY.current =
      e.touches[0].clientY;
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
      startX.current < 40 &&
      diffX > 100 &&
      diffY < 60
    ){
      router.back();
    }
  }

  return (
    <div
      onTouchStart={touchStart}
      onTouchEnd={touchEnd}
      style={{
        minHeight:"100vh"
      }}
    >
      {children}
    </div>
  );
}