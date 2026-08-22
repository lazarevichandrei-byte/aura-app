"use client";

import type {ClientAuraEventName} from "./catalog";
import {getTelegramInitData} from "../telegram-init-data";

type ClientEventInput={eventName:ClientAuraEventName;targetUserId?:string;entityType?:"user"|"chat"|"meet_event";entityId?:string;metadata?:Record<string,string|number|boolean>;occurredAt?:string;clientEventId?:string};

export async function trackAuraEvent(input:ClientEventInput){
  try{
    const initData=await getTelegramInitData();
    if(!initData)return;
    const payload={...input,initData,clientEventId:input.clientEventId??crypto.randomUUID(),occurredAt:input.occurredAt??new Date().toISOString()};
    for(let attempt=0;attempt<2;attempt++){
      try{
        const response=await fetch("/api/events",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload),keepalive:true});
        if(response.ok||response.status<500)return;
      }catch{if(attempt===1)return;}
    }
  }catch{return;}
}
