import {getTelegramInitData} from "../telegram-init-data";

export async function getOrCreateDirectChat(_currentUserId:string,targetUserId:string){
  const initData=await getTelegramInitData();
  if(!initData)throw new Error("AUTH_REQUIRED");
  const response=await fetch("/api/direct-chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({initData,targetUserId})});
  const result=await response.json().catch(()=>null);
  if(!response.ok||!result?.ok)throw new Error(result?.error||"DIRECT_CHAT_FAILED");
  return result.chatId as string;
}
