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

  const startY =
    useRef<number | null>(null);

  const pulling =
    useRef(false);

  const [refreshing, setRefreshing] =
  useState(false);

  const [offset,setOffset] =
    useState(0);

    const THRESHOLD = 90;

    function handleTouchStart(
  e: React.TouchEvent
){

  if(
    !enabled ||
    refreshing
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

  // Плавное сопротивление
  const elastic =
    120 *
    (1 - Math.exp(-diff / 140));

  setOffset(elastic);

}


async function handleTouchEnd(){

  if(!pulling.current){
    return;
  }

  pulling.current = false;

  startY.current = null;

  if(offset >= THRESHOLD){

    setRefreshing(true);

    try{

      await onRefresh();

    }finally{

      setRefreshing(false);

    }

  }

  setOffset(0);

}

  return (

    <div

onTouchStart={handleTouchStart}

onTouchMove={handleTouchMove}

onTouchEnd={handleTouchEnd}

style={{

        position:"relative",

        width:"100%",

        height:"100%",

        overflow:"hidden"

      }}

    >

      {/* Индикатор */}

      <div

        style={{

          position:"absolute",

          top:0,

          left:0,

          right:0,

          height:72,

          display:"flex",

          justifyContent:"center",

          alignItems:"center",

          zIndex:5,

          pointerEvents:"none"

        }}

      >

      </div>

      {/* Контент */}

      <div

       style={{

transform:
`translateY(${offset}px)`,

transition:
pulling.current
? "none"
: "transform .22s cubic-bezier(.22,.61,.36,1)",

willChange:"transform"

}}

      >

        {children}

      </div>

    </div>

  );

}