import {getTelegramInitData} from "../telegram-init-data";
import {clearChatsBootstrapCache} from "../chats/bootstrap";

export async function performLikeAction(action:"like"|"dismiss"|"skip",targetUserId:string){
  const initData=await getTelegramInitData();
  if(!initData)throw new Error("AUTH_REQUIRED");
  const response=await fetch("/api/likes",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({initData,action,targetUserId})});
  const result=await response.json().catch(()=>null);
  if(!response.ok||!result?.ok)throw new Error(result?.error||"LIKE_ACTION_FAILED");
  const datingResult=result as {ok:true;state:"pending"|"matched"|"rejected";cycleId:string;chatId:string|null;cooldownUntil:string|null};
  if(datingResult.chatId)clearChatsBootstrapCache();
  window.dispatchEvent(new CustomEvent("aura-dating-state-changed",{detail:datingResult}));
  return datingResult;
}

export async function loadLikesInbox(){
  const initData=await getTelegramInitData();
  if(!initData)throw new Error("AUTH_REQUIRED");
  const response=await fetch("/api/likes",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({initData,action:"inbox"})});
  const result=await response.json().catch(()=>null);
  if(!response.ok||!result?.ok)throw new Error(result?.error||"LIKES_INBOX_FAILED");
  return result as {ok:true;premium:boolean;count:number;people:Array<{cycleId:string;from_user_id:string;created_at:string;users:{id:string;name:string;age:number|null;city:string|null;avatar_url:string|null;photos:string[]|null;main_photo_index:number|null}}>};
}
