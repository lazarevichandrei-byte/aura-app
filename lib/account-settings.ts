import {getTelegramInitData} from "./telegram-init-data";

let cachedSettings:Record<string,unknown>|null=null;
let cachedAt=0;
let loadRequest:Promise<Record<string,unknown>>|null=null;
const CACHE_TTL=30_000;

async function request(method:"POST"|"PATCH",body:Record<string,unknown>={}){
  const initData=await getTelegramInitData();
  if(!initData)throw new Error("AUTH_REQUIRED");
  const response=await fetch("/api/account-settings",{method,headers:{"Content-Type":"application/json"},body:JSON.stringify({initData,...body})});
  const result=await response.json().catch(()=>null);
  if(!response.ok||!result?.ok)throw new Error(result?.error||"ACCOUNT_SETTINGS_FAILED");
  return result;
}

export async function loadAccountSettings({force=false}:{force?:boolean}={}){
  if(!force&&cachedSettings&&Date.now()-cachedAt<CACHE_TTL)return cachedSettings;
  if(loadRequest)return loadRequest;
  loadRequest=request("POST").then((result)=>{cachedSettings=result.settings as Record<string,unknown>;cachedAt=Date.now();return cachedSettings;}).finally(()=>{loadRequest=null;});
  return loadRequest;
}
export async function saveAccountSetting(field:string,value:unknown){
  await request("PATCH",{field,value});
  if(cachedSettings){cachedSettings={...cachedSettings,[field]:value,...(field==="show_online"?{show_last_seen:value}:{})};cachedAt=Date.now();}
}
export function clearAccountSettingsCache(){cachedSettings=null;cachedAt=0;loadRequest=null;}
