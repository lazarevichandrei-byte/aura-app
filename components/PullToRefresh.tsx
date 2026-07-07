"use client";

import {
  ReactNode,
  useRef,
  useState
} from "react";

type Props = {
  children: ReactNode;
  onRefresh: () => Promise<void> | void;
  enabled?: boolean;
};

export default function PullToRefresh({
  children,
  onRefresh,
  enabled = true
}: Props) {

  const containerRef =
    useRef<HTMLDivElement>(null);

  const startY =
    useRef<number | null>(null);

  const pulling =
    useRef(false);

  const refreshing =
    useRef(false);

  const [offset,setOffset] =
  useState(0);

const THRESHOLD = 90;

const progress =
  Math.min(offset / THRESHOLD, 1);

    function handleTouchStart(
  e: React.TouchEvent
){

  if(
    !enabled ||
    refreshing.current
  ){
    return;
  }

  const scroller =
    document.scrollingElement;

  if(
    scroller &&
    scroller.scrollTop > 0
  ){
    return;
  }

  startY.current =
    e.touches[0].clientY;

  pulling.current = true;

}

function handleTouchMove(
  e: React.TouchEvent
){

  if(
    !pulling.current ||
    startY.current === null
  ){
    return;
  }

  const diff =
    e.touches[0].clientY -
    startY.current;

  if(diff <= 0){
    return;
  }

  // сопротивление
  const distance =
    Math.pow(diff,0.85);

  setOffset(
    Math.min(distance,120)
  );

}

async function handleTouchEnd(){

  if(!pulling.current){

    return;

  }

  pulling.current = false;

  startY.current = null;

  if(offset >= THRESHOLD){

    refreshing.current = true;

    try{

      await onRefresh();

    }finally{

      refreshing.current = false;

    }

  }

  setOffset(0);

}

  return (

    <div
  ref={containerRef}

  onTouchStart={handleTouchStart}

  onTouchMove={handleTouchMove}

  onTouchEnd={handleTouchEnd}
      style={{

position:"relative",

width:"100%",

height:"100%",


  touchAction:"pan-y",

  overflow:"hidden",

  transform:`translateY(${offset}px)`,

  transition:
    pulling.current
      ? "none"
      : "transform .22s ease"

}}
    >
        


        <div
style={{

position:"absolute",

top:0,

left:0,

right:0,

height:70,

display:"flex",

alignItems:"center",

justifyContent:"center",

pointerEvents:"none",

opacity:
offset > 0 || refreshing.current
?1
:0,

transition:"opacity .2s"

}}
>

<div
style={{

width:34,

height:34,

borderRadius:"50%",

border:`3px solid rgba(42,171,238,.2)`,

borderTop:`3px solid #2AABEE`,

transform:
refreshing.current
?undefined
:`rotate(${progress*270}deg)`,

animation:
refreshing.current
?"auraSpin .9s linear infinite"
:"none"

}}
/>

</div>

      {children}

<style jsx>{`

@keyframes auraSpin{

from{
transform:rotate(0deg);
}

to{
transform:rotate(360deg);
}

}

`}</style>

    </div>

  );

}