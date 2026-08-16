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
    const timer=window.setTimeout(()=>finish(null),4500);
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
    const timer=window.setTimeout(()=>finish(()=>reject({code:3})),4000);
    watchId=navigator.geolocation.watchPosition(
      ({coords})=>finish(()=>resolve({lat:coords.latitude,lng:coords.longitude,accuracy:Number.isFinite(coords.accuracy)?coords.accuracy:null})),
      (error)=>finish(()=>reject(error)),
      {enableHighAccuracy:false,timeout:3500,maximumAge:10*60*1000}
    );
  });
}

export async function getReliableLocation():Promise<LocationCoordinates>{
  const cached=cachedLocation();
  if(cached)return cached;
  const attempts:Promise<LocationCoordinates>[]=[];
  const telegram=telegramLocation().then((coordinates)=>coordinates||Promise.reject({code:2}));
  attempts.push(telegram);
  if(navigator.geolocation){
    attempts.push(browserPosition({enableHighAccuracy:false,timeout:3500,maximumAge:10*60*1000}));
    attempts.push(new Promise((resolve,reject)=>window.setTimeout(()=>browserPosition({enableHighAccuracy:true,timeout:5000,maximumAge:60000}).then(resolve,reject),500)));
  }
  try{
    const coordinates=await Promise.any(attempts);
    remember(coordinates);
    return coordinates;
  }catch(aggregateError){
    const errors=aggregateError instanceof AggregateError?aggregateError.errors:[];
    const permissionDenied=errors.some((error)=>(error as GeolocationPositionError)?.code===1);
    if(permissionDenied)throw new Error("permission_denied" satisfies LocationFailure);
  }
  if(!navigator.geolocation)throw new Error("unavailable" satisfies LocationFailure);
  let lastError:any;
  try{
    const coordinates=await watchPosition();
    remember(coordinates);
    return coordinates;
  }catch(error){lastError=error;}
  const code=(lastError as GeolocationPositionError)?.code;
  throw new Error((code===1?"permission_denied":code===3?"timeout":"unavailable") satisfies LocationFailure);
}
