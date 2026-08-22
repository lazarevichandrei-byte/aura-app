const KEY="aura-discovery-session-v1";
const MAX_AGE=30*60*1000;

export type DiscoveryCandidate={id:string;[key:string]:unknown};
export type DiscoverySession={userId:string;filterSnapshot:string;queue:DiscoveryCandidate[];consumedIds:string[];photoIndex:number;updatedAt:number};

export function readDiscoverySession(userId:string){
  if(typeof window==="undefined")return null;
  try{
    const value=JSON.parse(sessionStorage.getItem(KEY)||"null") as DiscoverySession|null;
    if(!value||value.userId!==userId||Date.now()-value.updatedAt>MAX_AGE){sessionStorage.removeItem(KEY);return null;}
    return value;
  }catch{sessionStorage.removeItem(KEY);return null;}
}

export function saveDiscoverySession(session:DiscoverySession){
  if(typeof window!=="undefined")sessionStorage.setItem(KEY,JSON.stringify({...session,updatedAt:Date.now()}));
}

export function consumeDiscoveryCandidate(userId:string,targetUserId:string){
  const current=readDiscoverySession(userId);
  if(!current)return;
  saveDiscoverySession({...current,queue:current.queue.filter((candidate)=>candidate.id!==targetUserId),consumedIds:[...new Set([...current.consumedIds,targetUserId])],photoIndex:0});
}

export function clearDiscoverySession(){if(typeof window!=="undefined")sessionStorage.removeItem(KEY);}
