"use client";

import {useEffect,useState} from "react";
import {getTelegramInitData} from "./telegram-init-data";

export type CurrentUser={id:string;telegram_id:number;name:string;avatar_url:string|null;onboarding_completed:boolean|null};

let cachedUser:CurrentUser|null|undefined;
let currentUserRequest:Promise<CurrentUser|null>|null=null;
const SNAPSHOT_KEY="aura-current-user-snapshot";
export const DELETED_SESSION_KEY="aura-account-deleted-session";

function mark(name:string){if(typeof performance!=="undefined")performance.mark(name);}

export function setCurrentUserCache(user:CurrentUser|null){
  cachedUser=user;
  if(typeof window==="undefined")return;
  if(user)localStorage.setItem(SNAPSHOT_KEY,JSON.stringify({telegram_id:user.telegram_id,name:user.name,avatar_url:user.avatar_url,onboarding_completed:user.onboarding_completed}));
  else localStorage.removeItem(SNAPSHOT_KEY);
  window.dispatchEvent(new CustomEvent("aura-current-user-changed",{detail:user}));
}

export function clearAuraUserSession(){
  cachedUser=null;
  currentUserRequest=null;
  for(const key of [SNAPSHOT_KEY,"profile_cache","navUnread","aura-notification-preferences","my_name","aura_last_location"])localStorage.removeItem(key);
  localStorage.removeItem("aura-theme");
  const languageIsManual=localStorage.getItem("aura-language-source")==="manual";
  if(!languageIsManual){localStorage.removeItem("aura-language");localStorage.removeItem("aura-language-source");localStorage.removeItem("aura-language-manual");}
  sessionStorage.clear();
  sessionStorage.setItem(DELETED_SESSION_KEY,"1");
  window.dispatchEvent(new CustomEvent("aura-account-deleted"));
}

export function loadCurrentUser(options?:{force?:boolean}){
  if(!options?.force&&cachedUser!==undefined)return Promise.resolve(cachedUser);
  if(currentUserRequest)return currentUserRequest;
  currentUserRequest=(async()=>{
    mark("USER_BOOTSTRAP_START");
    if(sessionStorage.getItem(DELETED_SESSION_KEY)==="1")return null;
    const initData=await getTelegramInitData();
    if(!initData)return null;
    mark("INITDATA_AVAILABLE");
    const response=await fetch("/api/auth/telegram",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({initData,action:"check"})});
    const result=await response.json().catch(()=>null);
    if(!response.ok||!result?.ok)throw new Error(result?.error||"AUTH_CHECK_FAILED");
    setCurrentUserCache(result.exists?result.user:null);
    return result.exists?result.user:null;
  })().finally(()=>{mark("USER_BOOTSTRAP_END");currentUserRequest=null;});
  return currentUserRequest;
}

export function readCurrentUserSnapshot(){
  if(typeof window==="undefined"||sessionStorage.getItem(DELETED_SESSION_KEY)==="1")return null;
  try{const value=JSON.parse(localStorage.getItem(SNAPSHOT_KEY)||"null");const telegramId=(window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id;return value?.telegram_id===telegramId?value:null;}catch{return null;}
}

export function useCurrentUser(){
  const [user,setUser]=useState<CurrentUser|null>(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState<Error|null>(null);
  useEffect(()=>{
    let active=true;
    const update=(event:Event)=>{if(active)setUser((event as CustomEvent<CurrentUser|null>).detail??null);};
    window.addEventListener("aura-current-user-changed",update);
    loadCurrentUser().then((value)=>{if(active)setUser(value);}).catch((reason)=>{if(active)setError(reason instanceof Error?reason:new Error("AUTH_CHECK_FAILED"));}).finally(()=>{if(active)setLoading(false);});
    return()=>{active=false;window.removeEventListener("aura-current-user-changed",update);};
  },[]);
  return {user,loading,error};
}
