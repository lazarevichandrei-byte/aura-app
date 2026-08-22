import {getTelegramInitData} from "../telegram-init-data";
import {normalizeNotificationPreferences,type NotificationPreferences} from "./preferences";

let cached:NotificationPreferences|null=null;
let cachedAt=0;
let inFlight:Promise<NotificationPreferences>|null=null;
const CACHE_KEY="aura-notification-preferences";
const CACHE_TTL=30_000;

export async function loadNotificationPreferences({force=false}:{force?:boolean}={}){
  if(!cached&&typeof window!=="undefined"){
    try{cached=normalizeNotificationPreferences(JSON.parse(localStorage.getItem(CACHE_KEY)||"null"));}catch{}
  }
  if(!force&&cached&&Date.now()-cachedAt<CACHE_TTL)return cached;
  if(inFlight)return inFlight;
  inFlight=(async()=>{
    const initData=await getTelegramInitData();if(!initData)throw new Error("AUTH_REQUIRED");
    const response=await fetch("/api/notification-settings",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({initData})});
    const result=await response.json().catch(()=>null);if(!response.ok||!result?.ok)throw new Error(result?.error||"LOAD_FAILED");
    cached=normalizeNotificationPreferences(result.preferences);cachedAt=Date.now();localStorage.setItem(CACHE_KEY,JSON.stringify(cached));return cached;
  })().finally(()=>{inFlight=null;});
  return inFlight;
}

export async function saveNotificationPreferences(preferences:NotificationPreferences){
  const initData=await getTelegramInitData();if(!initData)throw new Error("AUTH_REQUIRED");
  const response=await fetch("/api/notification-settings",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({initData,preferences})});
  const result=await response.json().catch(()=>null);if(!response.ok||!result?.ok)throw new Error(result?.error||"SAVE_FAILED");
  cached=normalizeNotificationPreferences(result.preferences);cachedAt=Date.now();localStorage.setItem(CACHE_KEY,JSON.stringify(cached));return cached;
}

export function updateNotificationPreferencesCache(preferences:NotificationPreferences){cached=preferences;cachedAt=Date.now();localStorage.setItem(CACHE_KEY,JSON.stringify(preferences));}
export function clearNotificationPreferencesCache(){cached=null;cachedAt=0;inFlight=null;}
