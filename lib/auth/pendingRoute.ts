const KEY="aura-pending-route";

export function savePendingRoute(path:string){
  if(/^\/(home|meet(?:[/?]|$)|chats(?:[/?]|$)|chat(?:[/?]|$)|likes(?:[/?]|$)|account(?:[/?]|$)|settings(?:[/?]|$)|notifications(?:[/?]|$)|user(?:[/?]|$))/.test(path))sessionStorage.setItem(KEY,path);
}

export function consumePendingRoute(){const route=sessionStorage.getItem(KEY);sessionStorage.removeItem(KEY);return route||null;}
