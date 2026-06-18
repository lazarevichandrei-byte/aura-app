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

  function touchStart(
    e: React.TouchEvent
  ){
    startX.current =
      e.touches[0].clientX;
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
      startX.current < 80 &&
      diff > 20
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