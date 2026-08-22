import {getTelegramInitData} from "../telegram-init-data";

export type ChatBootstrapRow={id:string;unread_count?:number;[key:string]:unknown};
type ChatsBootstrap={ok:true;chats:ChatBootstrapRow[]};
let cached:ChatsBootstrap|null=null;
let cachedAt=0;
let inFlight:Promise<ChatsBootstrap>|null=null;
const CACHE_TTL=5_000;

export async function loadChatsBootstrap({force=false}:{force?:boolean}={}){
  if(!force&&cached&&Date.now()-cachedAt<CACHE_TTL)return cached;
  if(inFlight)return inFlight;
  inFlight=(async()=>{
    const initData=await getTelegramInitData();
    if(!initData)throw new Error("AUTH_REQUIRED");
    const response=await fetch("/api/chats",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({initData})});
    const result=await response.json().catch(()=>null);
    if(!response.ok||!result?.ok)throw new Error(result?.error||"CHATS_LOAD_FAILED");
    cached={ok:true,chats:Array.isArray(result.chats)?result.chats:[]};
    cachedAt=Date.now();
    return cached;
  })().finally(()=>{inFlight=null;});
  return inFlight;
}

export function clearChatsBootstrapCache(){cached=null;cachedAt=0;inFlight=null;}

export async function hideChatForMe(chatId:string){
  const initData=await getTelegramInitData();
  if(!initData)throw new Error("AUTH_REQUIRED");
  const response=await fetch("/api/chats",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({initData,action:"hide",chatId})});
  const result=await response.json().catch(()=>null);
  if(!response.ok||!result?.ok)throw new Error(result?.error||"CHAT_HIDE_FAILED");
  clearChatsBootstrapCache();
}
