export type TelegramLaunchContextV1={hasTelegramContext:boolean;startParam:string|null};

export function telegramLaunchContextV1(initData:string,webApp:unknown):TelegramLaunchContextV1{
  if(!initData||!webApp||typeof webApp!=="object")return {hasTelegramContext:false,startParam:null};
  const value=webApp as {initDataUnsafe?:{user?:{id?:unknown};start_param?:unknown}};
  if(!Number.isSafeInteger(value.initDataUnsafe?.user?.id))return {hasTelegramContext:false,startParam:null};
  return {hasTelegramContext:true,startParam:typeof value.initDataUnsafe?.start_param==="string"?value.initDataUnsafe.start_param:null};
}

export function resolveTelegramStartupRouteV1({context,userExists,onboardingCompleted,currentPath}:{context:TelegramLaunchContextV1;userExists:boolean;onboardingCompleted:boolean;currentPath:string}):string|null{
  if(!userExists)return null;
  const destination=onboardingCompleted&&context.hasTelegramContext&&context.startParam==="admin"?"/admin/aura":onboardingCompleted?"/home":"/profile";
  return currentPath===destination?null:destination;
}

export const hasAdminTelegramStartIntentV1=(context:TelegramLaunchContextV1)=>context.hasTelegramContext&&context.startParam==="admin";
