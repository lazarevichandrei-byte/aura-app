import {getTelegramInitData} from "../telegram-init-data";

export async function performLikeAction(action:"like"|"dismiss"|"skip",targetUserId:string){
  const initData=await getTelegramInitData();
  if(!initData)throw new Error("AUTH_REQUIRED");
  const response=await fetch("/api/likes",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({initData,action,targetUserId})});
  const result=await response.json().catch(()=>null);
  if(!response.ok||!result?.ok)throw new Error(result?.error||"LIKE_ACTION_FAILED");
  return result as {ok:true;chatId:string|null};
}
