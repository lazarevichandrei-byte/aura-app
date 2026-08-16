export type LocationCoordinates={lat:number;lng:number;accuracy:number|null};
export type LocationFailure="permission_denied"|"timeout"|"unavailable";

const CACHE_KEY="aura_last_location";
const CACHE_MAX_AGE=5*60*1000;

function valid(value:any){return Number.isFinite(value?.lat)&&Number.isFinite(value?.lng);}

function cachedLocation():LocationCoordinates|null{
  try{
    const value=JSON.parse(localStorage.getItem(CACHE_KEY)||"null");
    if(!valid(value)||!Number.isFinite(value.capturedAt)||Date.now()-value.capturedAt>CACHE_MAX_AGE)return null;
    return {lat:value.lat,lng:value.lng,accuracy:Number.isFinite(value.accuracy)?value.accuracy:null};
  }catch{return null;}
}

function remember(coordinates:LocationCoordinates){localStorage.setItem(CACHE_KEY,JSON.stringify({...coordinates,capturedAt:Date.now()}));}

function telegramLocation():Promise<LocationCoordinates|null>{
  const manager=(window as any)?.Telegram?.WebApp?.LocationManager;
  if(!manager?.init||!manager?.getLocation)return Promise.resolve(null);
  return new Promise((resolve)=>{
    let settled=false;
    const finish=(value:LocationCoordinates|null)=>{if(settled)return;settled=true;window.clearTimeout(timer);resolve(value);};
    const timer=window.setTimeout(()=>finish(null),10000);
    manager.init(()=>{
      if(manager.isLocationAvailable===false){finish(null);return;}
      manager.getLocation((location:any)=>finish(location&&Number.isFinite(location.latitude)&&Number.isFinite(location.longitude)?{lat:location.latitude,lng:location.longitude,accuracy:Number.isFinite(location.horizontal_accuracy)?location.horizontal_accuracy:null}:null));
    });
  });
}

function browserPosition(options:PositionOptions):Promise<LocationCoordinates>{
  return new Promise((resolve,reject)=>navigator.geolocation.getCurrentPosition(
    ({coords})=>resolve({lat:coords.latitude,lng:coords.longitude,accuracy:Number.isFinite(coords.accuracy)?coords.accuracy:null}),
    reject,
    options
  ));
}

function watchPosition():Promise<LocationCoordinates>{
  return new Promise((resolve,reject)=>{
    let watchId:number|undefined;
    const finish=(callback:()=>void)=>{if(watchId!==undefined)navigator.geolocation.clearWatch(watchId);window.clearTimeout(timer);callback();};
    const timer=window.setTimeout(()=>finish(()=>reject({code:3})),6000);
    watchId=navigator.geolocation.watchPosition(
      ({coords})=>finish(()=>resolve({lat:coords.latitude,lng:coords.longitude,accuracy:Number.isFinite(coords.accuracy)?coords.accuracy:null})),
      (error)=>finish(()=>reject(error)),
      {enableHighAccuracy:false,timeout:5500,maximumAge:10*60*1000}
    );
  });
}

export async function getReliableLocation():Promise<LocationCoordinates>{
  const cached=cachedLocation();
  if(cached)return cached;
  const telegram=await telegramLocation();
  if(telegram){remember(telegram);return telegram;}
  if(!navigator.geolocation)throw new Error("unavailable" satisfies LocationFailure);
  let lastError:any;
  for(const attempt of [
    ()=>browserPosition({enableHighAccuracy:true,timeout:9000,maximumAge:60000}),
    ()=>browserPosition({enableHighAccuracy:false,timeout:6500,maximumAge:10*60*1000}),
    watchPosition,
  ]){
    try{const coordinates=await attempt();remember(coordinates);return coordinates;}catch(error){lastError=error;if((error as GeolocationPositionError)?.code===1)break;}
  }
  const code=(lastError as GeolocationPositionError)?.code;
  throw new Error((code===1?"permission_denied":code===3?"timeout":"unavailable") satisfies LocationFailure);
}
