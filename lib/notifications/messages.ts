import {getTelegramInitData} from "../telegram-init-data";

export async function sendMessageNotification(_userId:string|undefined,_senderName:string,_message:string,chatId:string,messageId?:string){
  if(!messageId)return {ok:false,skipped:true};const initData=await getTelegramInitData();if(!initData)return {ok:false,skipped:true};
  const response=await fetch("/api/telegram/message",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({initData,chatId,messageId})});const result=await response.json();if(!response.ok)throw new Error(result?.error||"DELIVERY_FAILED");return result;
}
