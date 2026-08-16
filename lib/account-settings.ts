import {getTelegramInitData} from "./telegram-init-data";

async function request(method:"POST"|"PATCH",body:Record<string,unknown>={}){
  const initData=await getTelegramInitData();
  if(!initData)throw new Error("AUTH_REQUIRED");
  const response=await fetch("/api/account-settings",{method,headers:{"Content-Type":"application/json"},body:JSON.stringify({initData,...body})});
  const result=await response.json().catch(()=>null);
  if(!response.ok||!result?.ok)throw new Error(result?.error||"ACCOUNT_SETTINGS_FAILED");
  return result;
}

export async function loadAccountSettings(){return (await request("POST")).settings as Record<string,unknown>;}
export async function saveAccountSetting(field:string,value:unknown){await request("PATCH",{field,value});}
