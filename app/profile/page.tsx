"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { ArrowLeft2 } from "iconsax-react";
import { useNotification } from "../../components/NotificationContext";
import AuraLoader from "../../components/AuraLoader";
import ProfileSkeleton from "../../components/ProfileSkeleton";
import {useI18n} from "../../components/I18nProvider";
import { INTERESTS, interestId, interestLabel } from "../../lib/i18n/interests";
import {getReliableLocation,type LocationFailure} from "../../lib/location/reliableLocation";
import {reverseGeocode} from "../../lib/map/reverseGeocode";
import {consumeProfileLocation,prepareMeetLocation} from "../../lib/meet/locationStore";
import {consumePendingRoute} from "../../lib/auth/pendingRoute";
import {loadCurrentUser} from "../../lib/useCurrentUser";


const Cropper:any = dynamic(
 () => import("react-easy-crop"),
 { ssr:false }
);
import { supabase } from "../../lib/supabase";

const BASE_INTERESTS = INTERESTS.slice(0,4).map((item)=>item.legacy);
const EXTRA_INTERESTS = INTERESTS.slice(4).map((item)=>item.legacy);

async function createCroppedFile(source:string,area:{x:number;y:number;width:number;height:number},name:string){
  const image=await new Promise<HTMLImageElement>((resolve,reject)=>{const element=new Image();element.onload=()=>resolve(element);element.onerror=()=>reject(new Error("PHOTO_DECODE_FAILED"));element.src=source;});
  const canvas=document.createElement("canvas");
  canvas.width=Math.max(1,Math.round(area.width));
  canvas.height=Math.max(1,Math.round(area.height));
  const context=canvas.getContext("2d");
  if(!context)throw new Error("PHOTO_CANVAS_FAILED");
  context.drawImage(image,area.x,area.y,area.width,area.height,0,0,canvas.width,canvas.height);
  const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob((value)=>value?resolve(value):reject(new Error("PHOTO_CROP_FAILED")),"image/jpeg",.88));
  const baseName=name.replace(/\.[^.]+$/,"")||"photo";
  return new File([blob],`${baseName}.jpg`,{type:"image/jpeg"});
}

export default function Profile() {
  const {t,locale}=useI18n();
  const [loading, setLoading] = useState(true);
  const [telegramId, setTelegramId] = useState<number | null>(null);

  const [age, setAge] = useState(22);
  const [gender, setGender] = useState("female");
  const [search, setSearch] = useState("female");

  const [searchRadius,setSearchRadius] =
useState(50);

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [latitude,setLatitude]=useState<number|null>(null);
  const [longitude,setLongitude]=useState<number|null>(null);
  const [locationStatus,setLocationStatus]=useState<"idle"|"locating"|"resolving_place">("idle");
  const [locationFailed,setLocationFailed]=useState(false);
const [bio, setBio] = useState("");

const [isEditing,setIsEditing] =
useState(false);
  

  const [photos, setPhotos] = useState<string[]>([]);
  const [mainIndex, setMainIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
const [uploadProgress,setUploadProgress] = useState(0);
const [lastUploadTime,setLastUploadTime] = useState(0);
const [saveStatus,setSaveStatus] =
useState("saved");
const [savingProfile,setSavingProfile] =
useState(false);
const [lastSaveTime,setLastSaveTime] = useState(0);

  const [selected, setSelected] = useState<string[]>([]);
  const [showMore, setShowMore] = useState(false);

  const [cropOpen,setCropOpen] = useState(false);
  const [avatarPreview,setAvatarPreview] = useState("");
const [editingPhoto,setEditingPhoto] = useState("");

const [crop,setCrop] = useState({x:0,y:0});
const [zoom,setZoom] = useState(1.2);
const [croppedAreaPixels,setCroppedAreaPixels] = useState<{x:number;y:number;width:number;height:number}|null>(null);
const [photoEdits,setPhotoEdits] = useState<any>({});
const lastSavedRef = useRef("");
const [matches, setMatches] = useState<any[]>([]);
const [isOnboarding, setIsOnboarding] = useState(true);
const [onboardingStep,setOnboardingStep]=useState(0);
const photoInputRef=useRef<HTMLInputElement>(null);
const [profileLoaded,setProfileLoaded]=useState(false);
const [pendingPhoto,setPendingPhoto]=useState<{file:File;slot:number}|null>(null);

const router = useRouter();

const {
  success,
  error,
  warning
} = useNotification();

const base = BASE_INTERESTS;
const extra = EXTRA_INTERESTS;

  const hasLocation=city.trim().length>0||(latitude!==null&&longitude!==null);
  const isValid = name.trim().length > 0 && hasLocation;

useEffect(() => {
  document.body.style.overflowY = "auto";
  document.documentElement.style.overflowY = "auto";

  const init = async () => {
    if(typeof performance!=="undefined")performance.mark("PROFILE_BOOTSTRAP_START");

    const cached = localStorage.getItem("profile_cache");

if (cached) {
 try {
   const profile = JSON.parse(cached);

   setName(profile.name || "");
   setAge(profile.age || 22);
   setGender(profile.gender || "female");
   setSearch(profile.looking || "female");
   setCity(profile.city || "");
   setBio(profile.bio || "");
   setSelected(profile.interests || []);
   setPhotoEdits(profile.photo_edits || {});

   if (profile.photos?.length) {
     setPhotos(profile.photos);
   }
 } catch(e){
   localStorage.removeItem("profile_cache");
 }
}


    const tg = (window as any).Telegram?.WebApp;

    if (tg) {
      tg.ready();
      tg.expand();
    }

    const user = tg?.initDataUnsafe?.user;

if (!user) {
  console.log("NO TELEGRAM USER");
  setLoading(false);
  return;
}



const currentUser=await loadCurrentUser();
if(!currentUser){
  router.replace("/");
  return;
}

setTelegramId(currentUser.telegram_id);
setName(user.first_name || "");
if(currentUser.onboarding_completed!==true){
  setLoading(false);
  if(typeof performance!=="undefined"){
    performance.mark("PROFILE_SHELL_READY");
    if(process.env.NODE_ENV!=="production"){
      const start=performance.getEntriesByName("PROFILE_BOOTSTRAP_START").at(-1)?.startTime;
      const shell=performance.getEntriesByName("PROFILE_SHELL_READY").at(-1)?.startTime;
      console.info("[AURA_BOOT]",{registrationShellReadyMs:start===undefined||shell===undefined?null:Math.max(0,shell-start)});
    }
  }
}
const { data } =
await supabase
  .from("users")
  .select(`
id,
telegram_id,
name,
age,
gender,
looking,
search_radius,
city,
latitude,
longitude,
bio,
interests,
avatar_url,
photos,
photo_edits,
main_photo_index,
onboarding_completed
`)
.eq("telegram_id", user.id)
.maybeSingle();

if (!data) {
  router.replace("/");
  return;
}

  
  if (data) {

    

 // если анкета уже завершена —
 // просто показываем профиль как страницу редактирования


  setName(data.name || user.first_name || "");
  setAge(data.age || 22);
  setGender(data.gender || "female");
  setSearch(data.looking || "female");
  setSearchRadius(

  data.search_radius || 50
);

  setCity(data.city || "");
  setLatitude(Number.isFinite(data.latitude)?data.latitude:null);
  setLongitude(Number.isFinite(data.longitude)?data.longitude:null);
  setBio(data.bio || "");
  setSelected(data.interests || []);
  setPhotoEdits(data.photo_edits || {});
setMainIndex(data.main_photo_index || 0);
setIsOnboarding(!data.onboarding_completed);
  if (data.photos?.length) {
    setPhotos(data.photos);
  } else if (data.avatar_url) {
    setPhotos([data.avatar_url]);
  }

  try{
    const draft=JSON.parse(sessionStorage.getItem("aura-onboarding-draft")||"null");
    if(draft){setName(draft.name??data.name??user.first_name??"");setAge(draft.age??data.age??22);setGender(draft.gender??data.gender??"female");setSearch(draft.search??data.looking??"female");setCity(draft.city??data.city??"");setLatitude(draft.latitude??data.latitude??null);setLongitude(draft.longitude??data.longitude??null);setBio(draft.bio??data.bio??"");setSelected(draft.selected??data.interests??[]);setPhotos(draft.photos??data.photos??[]);setOnboardingStep(draft.step??0);}
  }catch{sessionStorage.removeItem("aura-onboarding-draft");}

  localStorage.setItem(
    "profile_cache",
    JSON.stringify(data)
  );
}
else{
 setName(user.first_name || "");
}

setLoading(false);
setProfileLoaded(true);
if(typeof performance!=="undefined"){
  performance.mark("PROFILE_BOOTSTRAP_END");
  if(process.env.NODE_ENV!=="production"){
    const start=performance.getEntriesByName("PROFILE_BOOTSTRAP_START").at(-1)?.startTime;
    const end=performance.getEntriesByName("PROFILE_BOOTSTRAP_END").at(-1)?.startTime;
    console.info("[AURA_BOOT]",{profileResolvedMs:start===undefined||end===undefined?null:Math.max(0,end-start)});
  }
}

};

init();
}, []);

useEffect(()=>{
  if(!isOnboarding||loading)return;
  sessionStorage.setItem("aura-onboarding-draft",JSON.stringify({name,age,gender,search,city,latitude,longitude,bio,selected,photos,step:onboardingStep}));
},[age,bio,city,gender,isOnboarding,latitude,loading,longitude,name,onboardingStep,photos,search,selected]);

useEffect(()=>{
 if(!telegramId)return;
  const applySelected=async()=>{
    const selectedLocation=consumeProfileLocation();
    if(!selectedLocation)return;
    try{
      await persistLocation(selectedLocation.lat,selectedLocation.lng,selectedLocation.city||undefined);
      success(t("common.saved"),t("profile.locationUpdated"));
    }catch{error(t("common.error"),t("location.updateFailed"));}
  };
  void applySelected();
  window.addEventListener("pageshow",applySelected);
  return()=>window.removeEventListener("pageshow",applySelected);
},[telegramId]);

useEffect(()=>{

 if(!telegramId||!profileLoaded) return;

 const timer = setTimeout(async()=>{
  const payload = JSON.stringify({
  name,
  age,
  gender,
  looking: search,
  searchRadius,
  city,
  bio,
  interests: selected,
  photos,
  mainIndex
});

if(payload === lastSavedRef.current){
  return;
}
  const now = Date.now();

if(now - lastSaveTime < 10000){
 return;
}

setLastSaveTime(now);

   if(!name.trim() || !city.trim()) return;

   setSaveStatus("saving");

   const { error } =
await supabase.from("users").update({
 telegram_id:telegramId,
 name,
 age,
 gender,
 looking:search,
search_radius:searchRadius,
city,
bio,
 interests:selected,
photo_edits:photoEdits,
main_photo_index:mainIndex,
avatar_url:
   avatarPreview ||
   photos[mainIndex] ||
   null,
 photos,
 onboarding_completed: !isOnboarding
}).eq("telegram_id",telegramId);

   if(!error){
    lastSavedRef.current = payload;

 localStorage.setItem(
   "profile_cache",
   JSON.stringify({
      name,
      age,
      gender,
      looking:search,
search_radius:searchRadius,
city,
bio,
      interests:selected,
      photos
      
   })
 );

 setSaveStatus("saved");
}

 },2500);

 return ()=>clearTimeout(timer);

},[
name,
age,
gender,
search,
searchRadius,
city,
bio,
selected,
photos,
mainIndex,
avatarPreview,
telegramId,
photoEdits,
profileLoaded
]);


useEffect(() => {
  if (!telegramId) return;

  const timer = setTimeout(async () => {

    let query = supabase
      .from("users")
    .select("telegram_id, name, age, city, avatar_url, photos")
      .neq("telegram_id", telegramId);

    if (search !== "any") {
      query = query.eq("gender", search);
    }

let { data, error } = await query.limit(20);



// 🔥 получаем кто лайкнул тебя
const { data: likedYou } = await supabase
  .from("likes")
  .select("from_user_id")
.eq("to_user_id", telegramId);

// список id
const likedIds = (likedYou || []).map(l => l.from_user_id);

// 🔥 сортируем: сначала те кто лайкнул
data = (data || []).sort((a, b) => {
  const aLiked = likedIds.includes(a.telegram_id);
  const bLiked = likedIds.includes(b.telegram_id);

  if (aLiked === bLiked) return 0;
  return aLiked ? -1 : 1;
});

if (error) {
  console.log("match error", error);
  setMatches([]);
  return;
}

// fallback если мало результатов
if ((data?.length || 0) < 5) {
  const { data: fallback } = await supabase
    .from("users")
    .select("telegram_id, name, age, city, avatar_url, photos")
    .neq("telegram_id", telegramId)
    .limit(20);

  data = fallback || data;
}

setMatches(data || []);

  }, 400); // 👈 задержка

  return () => clearTimeout(timer);

}, [telegramId, search]);

const compressImage = (file: File): Promise<File> =>
 new Promise((resolve)=>{

   const img = new Image();
   const reader = new FileReader();

   reader.onload=(e)=>{
      img.src = e.target?.result as string;
   };

   img.onload=()=>{

      const canvas =
       document.createElement("canvas");

      const ctx =
       canvas.getContext("2d");

      const maxWidth = 500;

      const scale =
 img.width > maxWidth
   ? maxWidth / img.width
   : 1;

      canvas.width = img.width * scale;
canvas.height = img.height * scale;

      ctx?.drawImage(
        img,
        0,
        0,
        canvas.width,
        canvas.height
      );

      canvas.toBlob(
       (blob)=>{
         if(!blob){
            resolve(file);
            return;
         }

         resolve(
           new File(
             [blob],
             file.name,
             {
               type:"image/jpeg"
             }
           )
         );
       },
       "image/jpeg",
       0.7
      );

   };

   reader.readAsDataURL(file);

});
  const uploadPhoto = async (file: File) => {
    if(uploading){
  warning(
  t("common.loading"),
  t("profile.photoUploading")
);
  return;
}
 if (!telegramId) return;
 const now = Date.now();

if(now - lastUploadTime < 3000){
 warning(
  t("common.loading"),
  t("profile.tryAgain")
);
 return;
}


setLastUploadTime(now);

setUploading(true);

 
 setUploadProgress(10);

 setTimeout(()=>{
   setUploadProgress(35);
 },150);

 const fileName =
`${telegramId}/${Date.now()}.jpg`;

 const compressedFile =
  await compressImage(file);

 const { error: rpcError } = await supabase.storage
   .from("avatars")
   .upload(
      fileName,
      compressedFile
   );

if (rpcError) {
  error(t("profile.uploadFailed"),rpcError.message);
  setUploading(false);
  setUploadProgress(0);
  return;
}

const { data } = supabase.storage
  .from("avatars")
  .getPublicUrl(
    fileName
  );
const uploadedUrl=`${data.publicUrl}?v=${Date.now()}`;

setUploadProgress(80);

setTimeout(()=>{
 setUploadProgress(100);
},150);

setTimeout(()=>{
setUploading(false);
setUploadProgress(0);
},500);
return uploadedUrl;
};

  const handlePhotoSelection=async(files:FileList|null,slot:number)=>{
    if(!files?.length)return;
    const file=files[0];
    if(file.size>10*1024*1024){warning(t("profile.fileTooLarge"),t("profile.fileLimit"));return;}
    const localImage=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>typeof reader.result==="string"?resolve(reader.result):reject(new Error("PHOTO_READ_FAILED"));reader.onerror=()=>reject(reader.error||new Error("PHOTO_READ_FAILED"));reader.readAsDataURL(file);}).catch(()=>"");
    if(!localImage){error(t("common.error"),t("profile.uploadFailed"));return;}
    const decoded=await new Promise<boolean>((resolve)=>{const image=new Image();image.onload=()=>resolve(true);image.onerror=()=>resolve(false);image.src=localImage;});
    if(!decoded){error(t("common.error"),t("profile.uploadFailed"));return;}
    setPendingPhoto({file,slot});
    setEditingPhoto(localImage);
    setCrop({x:0,y:0});
    setZoom(1.2);
    setCropOpen(true);
  };



  const toggle = (item: string) => {
    setSelected((previous) => {
      const targetId=interestId(item);
      const active=previous.some((value)=>interestId(value)===targetId);
      return active?previous.filter((value)=>interestId(value)!==targetId):[...previous,item];
    });
  };
    const handleSubmit = async () => {
      
    if (!telegramId || savingProfile || loading) return;

setSavingProfile(true);
    setUploading(true);

if (!name.trim() || (!city.trim()&&(latitude===null||longitude===null))) {
 setSavingProfile(false);
 setUploading(false);
 warning(
  t("profile.complete"),
  t("profile.required")
);
 return;
}

   const { error: rpcError } = await supabase
.from("users")
.update({
 name,
 age,
 gender,
 looking:search,
 search_radius:searchRadius,
 city,
 bio,
 interests:selected,
 photo_edits:photoEdits,
main_photo_index:mainIndex,
avatar_url:
   avatarPreview ||
   photos[mainIndex] ||
   null,
 photos,
 onboarding_completed:true
})
.eq("telegram_id", telegramId);

if (rpcError) {

  error(
    t("common.error"),
    rpcError.message
  );

  setSavingProfile(false);
  setUploading(false);

  return;

}

setSavingProfile(false);
setUploading(false);

if (isOnboarding) {
  sessionStorage.removeItem("aura-onboarding-draft");
  await loadCurrentUser({force:true});
  router.push(consumePendingRoute()||"/home");
} else {
  router.push("/account");
}
  };


  async function persistLocation(lat:number,lng:number,nextCity?:string){
    if(!telegramId)return;
    const values:{latitude:number;longitude:number;city?:string}={latitude:lat,longitude:lng};
    if(nextCity)values.city=nextCity;
    const {error:updateError}=await supabase.from("users").update(values).eq("telegram_id",telegramId);
    if(updateError)throw updateError;
    setLatitude(lat);setLongitude(lng);if(nextCity)setCity(nextCity);
  }

  async function updateLocation(){
    if(locationStatus!=="idle")return;
    setLocationFailed(false);
    setLocationStatus("locating");
    let coordinates;
    try{
      coordinates=await getReliableLocation();
    }catch(locationError){
      const failure=(locationError instanceof Error?locationError.message:"unavailable") as LocationFailure;
      const key=failure==="permission_denied"?"location.permissionDenied":failure==="timeout"?"location.timeout":"location.unavailable";
      error(t("common.error"),t(key));
      setLocationFailed(true);
      setLocationStatus("idle");
      return;
    }
    try{
      await persistLocation(coordinates.lat,coordinates.lng);
    }catch{error(t("common.error"),t("location.updateFailed"));setLocationStatus("idle");return;}
    setLocationStatus("resolving_place");
    try{
      const place=await reverseGeocode(coordinates.lat,coordinates.lng);
      const resolvedCity=place.city||await resolveSecondaryCity(coordinates.lat,coordinates.lng);
      if(resolvedCity)await persistLocation(coordinates.lat,coordinates.lng,resolvedCity);
      else warning(t("location.coordinatesFound"),t("location.resolveFailed"));
      success(t("common.saved"),t("profile.locationUpdated"));
      setLocationFailed(false);
    }catch{
      const resolvedCity=await resolveSecondaryCity(coordinates.lat,coordinates.lng).catch(()=>"");
      if(resolvedCity)await persistLocation(coordinates.lat,coordinates.lng,resolvedCity);
      else warning(t("location.coordinatesFound"),t("location.resolveFailed"));
    }
    finally{setLocationStatus("idle");if(isOnboarding&&onboardingStep===4)setOnboardingStep(5);}
  }

  async function resolveSecondaryCity(lat:number,lng:number){
    const response=await fetch(`/api/location?lat=${lat}&lng=${lng}&language=${encodeURIComponent(locale)}`);
    const result=await response.json().catch(()=>null);
    return response.ok&&result?.ok&&typeof result.city==="string"?result.city.trim():"";
  }

  function chooseLocationManually(){
    prepareMeetLocation(latitude!==null&&longitude!==null?{title:city,address:city,city,lat:latitude,lng:longitude}:null);
    router.push("/meet/location?source=profile");
  }

  const guideStyle=(section:number)=>isOnboarding&&onboardingStep<8?{opacity:onboardingStep===section?1:.92,transform:onboardingStep===section?"translateY(-1px)":"none",outline:onboardingStep===section?"2px solid color-mix(in srgb,var(--brand-primary) 38%,transparent)":"2px solid transparent",boxShadow:onboardingStep===section?"0 10px 24px color-mix(in srgb,var(--brand-primary) 10%,transparent)":"none",transition:"opacity .2s ease, transform .2s ease, box-shadow .2s ease, outline-color .2s ease"}:{};
  const guideHint=(section:number)=>isOnboarding&&onboardingStep===section?<div style={{position:"relative",marginTop:8,padding:"9px 11px",borderRadius:12,background:"var(--primary-soft)",color:"var(--text-secondary)",fontSize:12,lineHeight:1.4}}>{t(`onboarding.hint${section+1}` as any)}</div>:null;
  const selectGuide=(section:number)=>{if(isOnboarding&&onboardingStep<8)setOnboardingStep(section);};
  const openPhotoSlot=(slot:number)=>{selectGuide(7);photoInputRef.current?.setAttribute("data-slot",String(Math.min(slot,photos.length)));photoInputRef.current?.click();};
  const removePhotoAt=(slot:number)=>{
    setPhotos((current)=>current.filter((_,index)=>index!==slot));
    setMainIndex((current)=>current===slot?0:current>slot?current-1:current);
    setPhotoEdits((current)=>Object.fromEntries(Object.entries(current).flatMap(([key,value])=>{const index=Number(key);if(index===slot)return[];return [[index>slot?index-1:index,value]];})));
  };

  useEffect(()=>{
    if(!isOnboarding||onboardingStep>=8)return;
    window.setTimeout(()=>document.querySelector(`[data-guide-section="${onboardingStep}"]`)?.scrollIntoView({behavior:"smooth",block:"center"}),60);
  },[isOnboarding,onboardingStep]);

  if (loading) {
  return <ProfileSkeleton />;
}





  return (
    <div style={styles.wrapper}>
  <div style={styles.card}>

    <div
  style={{
    display: "flex",
    alignItems: "center",
    marginBottom: 20
  }}
>
  {!isOnboarding && (
  <button
    onClick={() => router.back()}
    style={{
      border: "none",
      background: "transparent",
      padding: 0,
      cursor: "pointer",
      display: "flex",
      alignItems: "center"
    }}
  >
    <ArrowLeft2
      size="28"
      color="var(--brand-primary)"
      variant="Outline"
    />
  </button>
)}

  <div
  style={{
    marginLeft: !isOnboarding ? 12 : 0,
    fontSize: 22,
    fontWeight: 700
  }}
>
  {t("profile.title")}
</div>
</div>

{isOnboarding&&onboardingStep<8&&<div style={{position:"sticky",top:"max(8px, env(safe-area-inset-top))",zIndex:20,marginBottom:18,padding:"9px 11px",borderRadius:15,background:"color-mix(in srgb,var(--surface-elevated) 94%,transparent)",border:"1px solid var(--border-subtle)",boxShadow:"var(--shadow-sm)",backdropFilter:"blur(12px)"}}><div style={{display:"grid",gridTemplateColumns:"repeat(8,1fr)",gap:4}}>{Array.from({length:8},(_,index)=><span key={index} style={{height:4,borderRadius:99,background:index<=onboardingStep?"var(--primary)":"var(--border-subtle)"}}/>)}</div><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:6}}><span style={{fontSize:11,fontWeight:700,color:"var(--text-secondary)"}}>{t("onboarding.progress",{current:onboardingStep+1,total:8})}</span><button type="button" onClick={()=>setOnboardingStep(8)} style={{border:0,background:"transparent",padding:"2px 0",color:"var(--primary)",fontSize:11,fontWeight:700}}>{t("onboarding.skip")}</button></div></div>}

        <div style={isOnboarding?{display:"block"}:styles.row}>
          <div data-guide-section="0" onClick={()=>selectGuide(0)} style={{...styles.inputBox,...guideStyle(0)}}>
            <p style={styles.label}>{t("profile.name")}</p>
            <input value={name} onChange={(e)=>setName(e.target.value)} onBlur={()=>{if(onboardingStep===0&&name.trim())setOnboardingStep(1);}} style={styles.input}/>
            {guideHint(0)}
          </div>

          <div data-guide-section="1" onClick={()=>selectGuide(1)} style={{...styles.inputBox,...guideStyle(1)}}>
            <p style={styles.label}>{t("profile.age")}</p>
<div style={{fontSize:14, marginBottom:4}}>{age}</div><input
 type="range"
 min="16"
 max="60"
 value={age}
 onChange={(e)=>setAge(Number(e.target.value))}
 onPointerUp={()=>{if(onboardingStep===1)setOnboardingStep(2);}}
 style={styles.slider}
/>
            {guideHint(1)}
          </div>
        </div>

        <div data-guide-section="2" onClick={()=>selectGuide(2)} style={{...styles.block,...guideStyle(2)}}>
          <p style={styles.label}>{t("profile.gender")}</p>
          <div style={styles.buttons}>
            <button onClick={()=>{setGender("female");if(onboardingStep===2)setOnboardingStep(3);}} style={{...styles.option,...(gender==="female"&&styles.active)}}>{t("profile.woman")}</button>
            <button onClick={()=>{setGender("male");if(onboardingStep===2)setOnboardingStep(3);}} style={{...styles.option,...(gender==="male"&&styles.active)}}>{t("profile.man")}</button>
          </div>
          {guideHint(2)}
        </div>

        <div data-guide-section="3" onClick={()=>selectGuide(3)} style={{...styles.block,...guideStyle(3)}}>
          <p style={styles.label}>{t("profile.lookingFor")}</p>
          <div style={styles.buttons}>
            {["male","female","any"].map(item=>(
              <button key={item} onClick={()=>{setSearch(item);if(onboardingStep===3)setOnboardingStep(4);}} style={{...styles.option,...(search===item&&styles.active)}}>
                {
 item==="male"
 ? t("profile.boy")
 : item==="female"
 ? t("profile.girl")
 : t("profile.anyone")
}
              </button>
            ))}
          </div>
          {guideHint(3)}
        </div>



        

        <div
  data-guide-section="4"
  onClick={()=>selectGuide(4)}
  style={{
    marginTop:"14px",
    padding:"14px 16px",
    background:"var(--surface-secondary)",
    borderRadius:"16px",
    ...guideStyle(4),

    display:"flex",
    alignItems:"center",
    justifyContent:"space-between"
  }}
>
  <div>
    <div
      style={{
        fontSize:"12px",
        color:"var(--text-secondary)"
      }}
    >
      {t("profile.location")}
    </div>

    <div
      style={{
        fontSize:"15px",
        fontWeight:600,
        marginTop:"2px"
      }}
    >
      📍 {city || (latitude!==null&&longitude!==null?t("location.coordinatesFound"):t("common.notSpecified"))}
    </div>
  </div>

  <button
    onClick={updateLocation}
    disabled={locationStatus!=="idle"}
    style={{
      border:"none",
      background:"var(--primary-soft)",
      color:"var(--primary)",
      padding:"8px 12px",
      borderRadius:"10px",
      fontSize:"13px",
      fontWeight:600
    }}
  >
    {locationStatus==="locating"?t("location.detecting"):locationStatus==="resolving_place"?t("location.resolving"):t(city?"profile.updateLocation":"location.detectAutomatically")}
  </button>
</div>
{!hasLocation&&!locationFailed&&<p style={{margin:"8px 2px 0",fontSize:12,lineHeight:1.45,color:"var(--text-secondary)"}}>{t("location.permissionRequired")}</p>}
{locationFailed&&<div style={{marginTop:10}}><p style={{margin:"0 0 8px",fontSize:12,color:"var(--text-secondary)"}}>{t("location.unavailable")}</p><button type="button" onClick={chooseLocationManually} style={{border:0,background:"transparent",color:"var(--primary)",fontWeight:650,padding:"8px 2px",cursor:"pointer"}}>{t("location.chooseManually")}</button></div>}
<p style={{margin:"0 2px 14px",fontSize:12,lineHeight:1.45,color:"var(--text-secondary)"}}>{t("onboarding.locationPrivacy")}</p>
{guideHint(4)}


        <div data-guide-section="5" onClick={()=>selectGuide(5)} style={{...styles.inputBox,...guideStyle(5)}}>
          <p style={styles.label}>{t("profile.bio")}</p>
          <textarea value={bio} onChange={(e)=>setBio(e.target.value)} onBlur={()=>{if(onboardingStep===5)setOnboardingStep(6);}} style={styles.textarea}/>
          {guideHint(5)}
        </div>

        <div data-guide-section="6" onClick={()=>selectGuide(6)} style={{...styles.block,...guideStyle(6)}}>
          <p style={styles.label}>{t("profile.interests")}</p>
          <div style={styles.tags}>
            {[...base, ...(showMore ? extra : [])].map((interest) => {
              const active = selected.some((value)=>interestId(value)===interestId(interest));
              return (
                <span key={interest} onClick={() => {toggle(interest);if(onboardingStep===6)setOnboardingStep(7);}} style={{...styles.tag,...(active && styles.tagActive)}}>
                  {interestLabel(interest,t)}
                </span>
              );
            })}
            {!showMore && <span style={styles.tag} onClick={() => setShowMore(true)}>+</span>}
          </div>
          {guideHint(6)}
          
        </div>

        <div data-guide-section="7" onClick={()=>selectGuide(7)} style={{...styles.photoManager,...guideStyle(7)}}>
          <p style={styles.label}>{t("profile.photos")}</p>
          <div style={styles.photoSlots}>
            {Array.from({length:6},(_,slot)=>{
              const photo=photos[slot];
              return <button key={slot} type="button" onClick={(event)=>{event.stopPropagation();if(photo)setMainIndex(slot);else openPhotoSlot(slot);}} style={{...styles.photoSlot,...(slot===0?styles.photoSlotMain:{}),...(photo?{padding:0}:{})}}>
                {photo?<img src={slot===mainIndex&&avatarPreview?avatarPreview:photo} alt="" style={styles.photoSlotImage}/>:<span style={{fontSize:28,color:"var(--primary)"}}>+</span>}
                {photo&&slot===mainIndex&&<span style={styles.photoMainBadge}>★ {t("profile.mainPhoto")}</span>}
                {photo&&<span onClick={(event)=>{event.stopPropagation();removePhotoAt(slot);}} style={styles.photoRemove}>×</span>}
              </button>;
            })}
          </div>
          {uploading&&<div style={{marginTop:8,fontSize:12,color:"var(--primary)",fontWeight:700}}>{t("profile.savingPhoto",{progress:uploadProgress})}</div>}
          {guideHint(7)}
          <input ref={photoInputRef} type="file" accept="image/*" hidden disabled={uploading} onChange={async(event)=>{const slot=Number(event.currentTarget.dataset.slot||photos.length);await handlePhotoSelection(event.target.files,slot);event.target.value="";}}/>
        </div>
        

        <button
  disabled={
  !isValid ||
  !profileLoaded ||
  uploading ||
  savingProfile
}
  style={{
    ...styles.submit,
    opacity:isValid&&profileLoaded ? 1 : 0.5,
    boxShadow:isOnboarding&&isValid&&onboardingStep>=8?"0 10px 26px color-mix(in srgb,var(--brand-primary) 24%,transparent)":"none"
  }}
  onClick={handleSubmit}
>
  {savingProfile || uploading ? (

  <AuraLoader
  inline
  size={18}
  text={
    savingProfile
      ? t("common.saving")
      : t("profile.savingPhoto",{progress:uploadProgress})
  }
/>

) : (

  isOnboarding
    ? t("onboarding.createProfile")
    : t("common.save")

)}
</button>
<div
style={{
marginTop:10,
fontSize:12,
textAlign:"center",
color:"var(--text-secondary)"
}}
>
{saveStatus==="saving"
 ? t("common.saving")
 : t("common.saved")}
</div>

      </div>
{cropOpen && (
<div
 style={{
   position:"fixed",
   inset:0,
   background:"#000",
   zIndex:999999,
   display:"flex",
   justifyContent:"center",
   alignItems:"center"
 }}
 onClick={()=>{setCropOpen(false);setPendingPhoto(null);}}
>

<div
 onClick={(e)=>e.stopPropagation()}
 style={{
   width:"92%",
   maxWidth:"380px",
   background:"var(--surface-elevated)",
   color:"var(--text-primary)",
   borderRadius:"28px",
   padding:"20px",
   position:"relative",
   overflow:"hidden" // важно
 }}
>

<div
style={{
 position:"relative",
 width:"100%",
   height:"min(320px, 48vh)",
 overflow:"hidden",
 borderRadius:"18px",
 background:"var(--surface-secondary)"
}}
>

<Cropper
 image={editingPhoto}
 crop={crop}
 zoom={zoom}

 aspect={1}
 cropShape="round"

 cropSize={{ width:260, height:260 }}

 objectFit="horizontal-cover"

 restrictPosition={true}
 showGrid={false}

 rotation={0}
 minZoom={1}
 maxZoom={3}
 zoomSpeed={1}

 onCropChange={setCrop}
 onZoomChange={setZoom}

 onCropComplete={(a,b)=>{
   setCroppedAreaPixels(b);
 }}
/>

</div>

<input
 type="range"
 min="1"
 max="3"
 step="0.1"
 value={zoom}
 onChange={(e)=>setZoom(Number(e.target.value))}
 style={styles.slider}
/>

<button
 style={styles.submit}
 disabled={uploading}
 onClick={async()=>{
 const targetSlot=pendingPhoto?.slot??mainIndex;
 let nextPhotos=photos;
 if(pendingPhoto){
   if(!croppedAreaPixels)return;
   const croppedFile=await createCroppedFile(editingPhoto,croppedAreaPixels,pendingPhoto.file.name).catch(()=>null);
   if(!croppedFile){error(t("common.error"),t("profile.uploadFailed"));return;}
   const uploadedUrl=await uploadPhoto(croppedFile);
   if(typeof uploadedUrl!=="string")return;
   nextPhotos=[...photos];
   nextPhotos[targetSlot]=uploadedUrl;
   nextPhotos=nextPhotos.filter(Boolean);
   setPhotos(nextPhotos);
   if(photos.length===0)setMainIndex(0);
 }
 const nextPhotoEdits={
 ...photoEdits,
 [targetSlot]:pendingPhoto?{crop:{x:0,y:0},zoom:1}:{crop,zoom}
};
 setPhotoEdits(nextPhotoEdits);

localStorage.setItem(
 "profile_cache",
 JSON.stringify({
   name,
   age,
   gender,
  looking:search,
search_radius:searchRadius,
city,
bio,
   interests:selected,
   photos:nextPhotos,
   photo_edits:nextPhotoEdits
 })
);

setCropOpen(false);
setPendingPhoto(null);
if(isOnboarding&&onboardingStep===7)setOnboardingStep(8);

}}
>
{t("common.save")}
</button>

</div>
</div>
)}
    </div>
  );
}




const styles:any = {
  wrapper:{
 minHeight:"100vh",
 background:"var(--app-bg)",
 color:"var(--text-primary)",
 padding:"20px 20px 120px",
 overflowY:"auto",
 WebkitOverflowScrolling:"touch"
},
  card:{background:"var(--surface)",border:"1px solid var(--border-subtle)",borderRadius:"24px",padding:"20px",maxWidth:"420px",margin:"0 auto"},

photoManager:{marginBottom:18,padding:12,borderRadius:18,background:"var(--surface-secondary)"},
photoSlots:{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gridAutoRows:"92px",gap:8},
photoSlot:{position:"relative",minWidth:0,border:"1px dashed var(--border-strong)",borderRadius:14,background:"var(--surface)",overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center"},
photoSlotMain:{gridColumn:"span 2",gridRow:"span 2"},
photoSlotImage:{width:"100%",height:"100%",objectFit:"cover",display:"block"},
photoMainBadge:{position:"absolute",left:7,bottom:7,padding:"3px 7px",borderRadius:999,background:"var(--primary)",color:"var(--text-inverse)",fontSize:10,fontWeight:700},
photoRemove:{position:"absolute",right:6,top:6,width:24,height:24,borderRadius:12,background:"color-mix(in srgb,var(--surface) 88%,transparent)",color:"var(--text-primary)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:700},

avatarWrapper:{
 display:"flex",
 justifyContent:"center",
 marginBottom:"20px",
 position:"relative"
},


avatarMask:{
 width:"92px",
 height:"92px",
 borderRadius:"50%",
 overflow:"hidden",
 background:"var(--primary-soft)",
 position:"relative"
},

avatarImage:{
 width:"100%",
 height:"100%",
 objectFit:"cover"
},



  avatar:{width:"90px",height:"90px",borderRadius:"50%",background:"var(--primary-soft)",display:"flex",alignItems:"center",justifyContent:"center",objectFit:"cover"},
plus:{
 position:"absolute",
 bottom:0,
 right:"calc(50% - 46px)",

 width:"24px",
 height:"24px",

 borderRadius:"50%",
 background:"var(--primary)",
 color:"var(--text-inverse)",

 display:"flex",
 alignItems:"center",
 justifyContent:"center",

 fontSize:"16px",
 fontWeight:700,

 zIndex:20
},
  row:{display:"flex",gap:"10px"},

inputBox:{
  background:"var(--input-bg)",
  borderRadius:"16px",
  padding:"8px 12px", // было 12px
  marginTop:"10px",   // чуть меньше отступ
  flex:1
},

label:{fontSize:"12px",color:"var(--text-secondary)"},
  input:{width:"100%",border:"none",background:"transparent",outline:"none"},

  textarea:{
  width:"100%",
  border:"none",
  background:"transparent",
  outline:"none",
  height:"70px",       // фикс высоты
  resize:"none"        // убирает растягивание
},

  block:{marginTop:"14px"},

  buttons:{display:"flex",gap:"8px"},
  option:{
    flex:1,
    padding:"8px 6px",
    borderRadius:"12px",
    border:"none",
    background:"var(--primary-soft)",
    fontSize:"12px",
    fontWeight:"500",
    whiteSpace:"nowrap"
  },

  mainBadge:{
 position:"absolute",
 left:8,
 bottom:8,
 background:"rgba(42,171,238,.95)",
 color:"#fff",
 padding:"4px 9px",
 borderRadius:"999px",
 fontSize:10,
 fontWeight:600
},
  active:{background:"var(--primary)",color:"var(--text-inverse)"},

  tags:{display:"flex",flexWrap:"wrap",gap:"8px"},
  tag:{padding:"6px 10px",borderRadius:"999px",border:"1px solid var(--primary)",color:"var(--primary)",background:"var(--surface)"},
  tagActive:{background:"var(--primary)",color:"var(--text-inverse)"},

  submit:{marginTop:"20px",width:"100%",height:"56px",borderRadius:"18px",border:"none",color:"var(--text-inverse)",background:"var(--primary)"},

  viewer:{position:"fixed",top:0,left:0,width:"100%",height:"100%",background:"rgba(0,0,0,0.8)",display:"flex",alignItems:"center",justifyContent:"center"},

  cropViewer:{
 position:"fixed",
 inset:0,
 background:"rgba(0,0,0,.82)",
 display:"flex",
 alignItems:"center",
 justifyContent:"center",
 zIndex:99999
},

galleryEmpty:{
 display:"flex",
 justifyContent:"center",
 alignItems:"center",
 height:"300px",
 width:"100%"
},

gallery:{
 display:"grid",
 gridTemplateColumns:"repeat(3,110px)",
 justifyContent:"center",
 gap:"14px",
 width:"100%",
 maxWidth:"420px",
 margin:"0 auto",
 padding:"18px"
},

  galleryItem:{
 position:"relative",
 width:"100%",
 overflow:"visible"
},

  galleryImg:{
 width:"100%",
 height:"160px",
 aspectRatio:"3/4",
 objectFit:"cover",
 borderRadius:"18px",
 display:"block"
},

addPhoto:{
 width:"110px",
 height:"160px",
 margin:"0 auto",
 borderRadius:"18px",
 background:"var(--surface-secondary)",
 display:"flex",
 alignItems:"center",
 justifyContent:"center",
 fontSize:"42px",
 justifySelf:"center"
},

deleteBtn:{
 position:"absolute",
 top:-9,
 right:-9,

 width:"30px",
 height:"30px",

 borderRadius:"50%",
 border:"none",

 background:"var(--surface)",
 color:"var(--text-primary)",

 boxShadow:"0 4px 12px rgba(0,0,0,.18)",

 display:"flex",
 alignItems:"center",
 justifyContent:"center",

 fontSize:"18px",
 zIndex:30
},


slider:{
 width:"100%",
 marginTop:"10px",
 appearance:"none",
 WebkitAppearance:"none",

 height:"8px",
 borderRadius:"999px",

 background:"var(--primary-soft)",

 outline:"none"
},



editPhotoBtn:{
 position:"absolute",

 right:-12,
 bottom:-12,

 width:"34px",
 height:"34px",

 borderRadius:"50%",
 border:"none",

 background:"var(--surface)",
 boxShadow:"0 6px 16px rgba(0,0,0,.18)",

 display:"flex",
 alignItems:"center",
 justifyContent:"center",

 fontSize:"15px",
 zIndex:999
},
cropModal:{
 background:"var(--surface)",
 color:"var(--text-primary)",
 width:"90%",
 maxWidth:"380px",
 borderRadius:"28px",
 padding:"20px"
}

};
