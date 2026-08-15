"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import RealtimeNotificationBridge from "./RealtimeNotificationBridge";

function mark(name:string){if(typeof performance!=="undefined"&&!performance.getEntriesByName(name).length) performance.mark(name);}

export default function StartupLifecycle(){
  const pathname=usePathname();
  const [realtimeReady,setRealtimeReady]=useState(false);
  useEffect(()=>{mark("FIRST_SHELL_RENDER");setRealtimeReady(true);},[]);
  useEffect(()=>{mark("FIRST_ROUTE_RENDER");},[pathname]);
  return realtimeReady?<RealtimeNotificationBridge/>:null;
}
