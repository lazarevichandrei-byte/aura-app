
"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";

const Cropper:any = dynamic(
 () => import("react-easy-crop"),
 { ssr:false }
);
import { supabase } from "../../lib/supabase";

const BASE_INTERESTS = [
 "Путешествия",
 "Музыка",
 "Спорт",
 "Кино"
];

const EXTRA_INTERESTS = [
 "Игры",
 "Бизнес",
 "Еда",
 "Йога",
 "Авто",
 "Книги",
 "Технологии",
 "Искусство",
 "Танцы",
 "Природа"
];

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [telegramId, setTelegramId] = useState<number | null>(null);

  const [age, setAge] = useState(18);
  const [gender, setGender] = useState("female");
  const [search, setSearch] = useState("female");

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");

  const [photos, setPhotos] = useState<string[]>([]);
  const [mainIndex, setMainIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
const [uploadProgress,setUploadProgress] = useState(0);
const [lastUploadTime,setLastUploadTime] = useState(0);
const [saveStatus,setSaveStatus] =
useState("saved");
const [savingProfile,setSavingProfile] =
useState(false);

  const [selected, setSelected] = useState<string[]>([]);
  const [showMore, setShowMore] = useState(false);

  const [activePhoto, setActivePhoto] = useState(false);
  const [cropOpen,setCropOpen] = useState(false);
  const [avatarPreview,setAvatarPreview] = useState("");
const [editingPhoto,setEditingPhoto] = useState("");

const [crop,setCrop] = useState({x:0,y:0});
const [zoom,setZoom] = useState(1.2);
const [croppedAreaPixels,setCroppedAreaPixels] = useState(null);
const [photoEdits,setPhotoEdits] = useState<any>({});
const inputRef = useRef<HTMLInputElement>(null);


const base = BASE_INTERESTS;
const extra = EXTRA_INTERESTS;

  const isValid = name.trim().length > 0 && city.trim().length > 0;

useEffect(() => {
  document.body.style.overflowY = "auto";
  document.documentElement.style.overflowY = "auto";

  const init = async () => {

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
if (!user) return setLoading(false);

setTelegramId(user.id);
setName(user.first_name || "");
const { data } = 
await supabase
      .from("users")
      .select(`
telegram_id,
name,
age,
gender,
looking,
city,
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

  
  if (data) {

 // если анкета уже завершена —
 // просто показываем профиль как страницу редактирования


  setName(data.name || user.first_name || "");
  setAge(data.age || 22);
  setGender(data.gender || "female");
  setSearch(data.looking || "female");
  setCity(data.city || "");
  setBio(data.bio || "");
  setSelected(data.interests || []);
  setPhotoEdits(data.photo_edits || {});
setMainIndex(data.main_photo_index || 0);
  if (data.photos?.length) {
    setPhotos(data.photos);
  } else if (data.avatar_url) {
    setPhotos([data.avatar_url]);
  }

  localStorage.setItem(
    "profile_cache",
    JSON.stringify(data)
  );
}
else{
 setName(user.first_name || "");
}

setLoading(false);

};

init();
}, []);
useEffect(()=>{

 if(!telegramId) return;

 const timer = setTimeout(async()=>{

   if(!name.trim() || !city.trim()) return;

   setSaveStatus("saving");

   const { error } =
await supabase
.from("users")
.upsert(
{
 telegram_id:telegramId,
 name,
 age,
 gender,
 looking:search,
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
 onboarding_completed:false
},
{
 onConflict:"telegram_id"
}
);

   if(!error){

 localStorage.setItem(
   "profile_cache",
   JSON.stringify({
      name,
      age,
      gender,
      looking:search,
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
city,
bio,
selected,
photos,
mainIndex,
avatarPreview,
telegramId,
photoEdits
]);
    
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

      const maxWidth = 1200;

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
       0.82
      );

   };

   reader.readAsDataURL(file);

});
  const uploadPhoto = async (file: File) => {
 if (!telegramId) return;
 const now = Date.now();

if(now - lastUploadTime < 3000){
 alert("Подожди пару секунд");
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

 const { error } = await supabase.storage
   .from("avatars")
   .upload(
      fileName,
      compressedFile
   );

    if (!error) {

 const { data } = supabase.storage
   .from("avatars")
   .getPublicUrl(
      fileName + "?v=" + Date.now()
   );

setPhotos(prev=>{

 const updated=[...prev,data.publicUrl];

 localStorage.setItem(
   "profile_cache",
   JSON.stringify({
 name,
 age,
 gender,
 looking:search,
 city,
 bio,
 interests:selected,
 photos,
 photo_edits:photoEdits
})
 );

 return updated;
});

setUploadProgress(80);

setTimeout(()=>{
 setUploadProgress(100);
},150);

} // закрывает if (!error)

setTimeout(()=>{
 setUploading(false);
 setUploadProgress(0);
},500);
};

  const toggle = (item: string) => {
    setSelected((prev) =>
      prev.includes(item)
        ? prev.filter((i) => i !== item)
        : [...prev, item]
    );
  };
    const handleSubmit = async () => {
    if (!telegramId || savingProfile || loading) return;

setSavingProfile(true);
    setUploading(true);

if (!name.trim() || !city.trim()) {
 setSavingProfile(false);
 setUploading(false);
 alert("Заполни имя и город");
 return;
}

    const { error } = await supabase
.from("users")
.update({
 name,
 age,
 gender,
 looking:search,
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

if (error) {
 setSavingProfile(false);
 setUploading(false);
 alert(error.message);
 return;
}

setSavingProfile(false);
setUploading(false);

window.location.href="/home";
  };

  


  if (loading) {
 return (
  <div style={styles.wrapper}>
   <div style={styles.card}>

    <div style={{
      width:92,
      height:92,
      borderRadius:"50%",
      margin:"0 auto 22px",
      background:"#E9EEF5"
    }}/>

    <div style={{
      height:56,
      borderRadius:16,
      background:"#EEF3F8",
      marginBottom:14
    }}/>

    <div style={{
      height:56,
      borderRadius:16,
      background:"#EEF3F8",
      marginBottom:14
    }}/>

    <div style={{
      height:130,
      borderRadius:20,
      background:"#EEF3F8",
      marginBottom:20
    }}/>

    <div style={{
      height:56,
      borderRadius:18,
      background:"#DDEBFF"
    }}/>

   </div>
  </div>
 );
}




  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>

        <div style={styles.avatarWrapper}>

  {photos.length > 0 ? (
    <div
      style={styles.avatarMask}
      onClick={() => setActivePhoto(true)}
    >
      <img
        src={avatarPreview || photos[mainIndex]}
        loading="lazy"
        decoding="async"
        style={{
          ...styles.avatarImage,
          transform: photoEdits[mainIndex]
            ? `translate(
                ${photoEdits[mainIndex].crop.x/6}px,
                ${photoEdits[mainIndex].crop.y/6}px
              )
              scale(${photoEdits[mainIndex].zoom})`
            : "none",
          transformOrigin:"center center"
        }}
      />
    </div>
  ) : (
    <div
  style={styles.avatar}
  onClick={() => setActivePhoto(true)}
>
  👤
</div>
   
  )}

<input
  ref={inputRef}
  type="file"
  accept="image/*"
  hidden
  onChange={async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Фото до 10MB");
      return;
    }

    await uploadPhoto(file);
    e.target.value = "";
  }}
/>
        </div>

        <div style={styles.row}>
          <div style={styles.inputBox}>
            <p style={styles.label}>Имя</p>
            <input value={name} onChange={(e)=>setName(e.target.value)} style={styles.input}/>
          </div>

          <div style={styles.inputBox}>
            <p style={styles.label}>Возраст</p>
            <div>{age}</div>
<input
 type="range"
 min="16"
 max="60"
 value={age}
 onChange={(e)=>setAge(Number(e.target.value))}
 style={styles.slider}
/>
          </div>
        </div>

        <div style={styles.block}>
          <p style={styles.label}>Я</p>
          <div style={styles.buttons}>
            <button onClick={()=>setGender("female")} style={{...styles.option,...(gender==="female"&&styles.active)}}>Женщина</button>
            <button onClick={()=>setGender("male")} style={{...styles.option,...(gender==="male"&&styles.active)}}>Мужчина</button>
          </div>
        </div>

        <div style={styles.block}>
          <p style={styles.label}>Кого ищешь</p>
          <div style={styles.buttons}>
            {["male","female","any"].map(item=>(
              <button key={item} onClick={()=>setSearch(item)} style={{...styles.option,...(search===item&&styles.active)}}>
                {item==="male"?"Парня":item==="female"?"Девушку":"Без разницы"}
              </button>
            ))}
          </div>
        </div>
                <div style={styles.inputBox}>
          <p style={styles.label}>Город</p>
          <input value={city} onChange={(e)=>setCity(e.target.value)} style={styles.input}/>
        </div>

        <div style={styles.inputBox}>
          <p style={styles.label}>О себе</p>
          <textarea value={bio} onChange={(e)=>setBio(e.target.value)} style={styles.textarea}/>
        </div>

        <div style={styles.block}>
          <p style={styles.label}>Интересы</p>
          <div style={styles.tags}>
            {[...base, ...(showMore ? extra : [])].map((t) => {
              const active = selected.includes(t);
              return (
                <span key={t} onClick={() => toggle(t)} style={{...styles.tag,...(active && styles.tagActive)}}>
                  {t}
                </span>
              );
            })}
            {!showMore && <span style={styles.tag} onClick={() => setShowMore(true)}>+</span>}
          </div>
        </div>

        <button
          disabled={!isValid || uploading}
          style={{...styles.submit,opacity:isValid?1:0.5}}
          onClick={handleSubmit}
        >
{
savingProfile
 ? "Подождите..."
 : uploading
 ? `Загрузка ${uploadProgress}%`
 : "Продолжить"
}        </button>
<div
style={{
marginTop:10,
fontSize:12,
textAlign:"center",
color:"#8A94A6"
}}
>
{saveStatus==="saving"
 ? "Сохраняется..."
 : "Сохранено ✓"}
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
 onClick={()=>setCropOpen(false)}
>

<div
 onClick={(e)=>e.stopPropagation()}
 style={{
   width:"92%",
   maxWidth:"380px",
   background:"#fff",
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
 height:"320px",
 overflow:"hidden",
 borderRadius:"18px",
 background:"#111"
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
 onClick={async()=>{

 setPhotoEdits(prev=>({
 ...prev,
 [mainIndex]:{
   crop,
   zoom
 }
}));

localStorage.setItem(
 "profile_cache",
 JSON.stringify({
   name,
   age,
   gender,
   looking:search,
   city,
   bio,
   interests:selected,
   photos,
   photo_edits:{
     ...photoEdits,
     [mainIndex]:{
       crop,
       zoom
     }
   }
 })
);

setCropOpen(false);

}}
>
Готово
</button>

</div>
</div>
)}
      {/* 🔥 ВОТ ФИКС ГАЛЕРЕИ */}
      {activePhoto && !cropOpen && (
        <div style={styles.viewer} onClick={() => setActivePhoto(false)}>
          <div
            style={photos.length === 0 ? styles.galleryEmpty : styles.gallery}
            onClick={(e)=>e.stopPropagation()}
          >

            <label style={styles.addPhoto}>
  
              <input
 type="file"
 multiple
 accept="image/*"
 hidden
 onChange={async (e)=>{
   const files = e.target.files;
   for (let f of Array.from(files || [])) {
 if (f.size > 10 * 1024 * 1024){
   alert("Фото до 10MB");
   return;
 }
}
   if (!files) return;

   if (photos.length + files.length > 6){
      alert("Максимум 6 фото");
      return;
   }

   for(let i=0;i<files.length;i++){
      await uploadPhoto(files[i]);
   }

   e.target.value="";
 }}
/>
            </label>

            {photos.map((p,i)=>(
  <div key={i} style={styles.galleryItem}>

    <img
      src={p}
      loading="lazy"
decoding="async"
      onClick={()=>{
 setMainIndex(i);
 console.log("Главная фото:", i);
}}
      style={{
        ...styles.galleryImg,
        border: i===mainIndex
          ? "3px solid #2AABEE"
          : "none"
      }}
    />

    {i===mainIndex && (
      <div style={styles.mainBadge}>
        ★ Главная
      </div>
    )}

    {i===mainIndex && (
<button
 onClick={(e)=>{
   e.stopPropagation();
   setEditingPhoto(p);

if(photoEdits[i]){
 setCrop(photoEdits[i].crop);
 setZoom(photoEdits[i].zoom);
}else{
 setCrop({x:0,y:0});
 setZoom(1.2);
}

setActivePhoto(false);
setCropOpen(true);
 }}
 style={{
   position:"absolute",
   right:"-10px",
   bottom:"-10px",
   width:"34px",
   height:"34px",
   borderRadius:"50%",
   border:"2px solid #fff",
   background:"#fff",
   boxShadow:"0 4px 12px rgba(0,0,0,.18)",
   zIndex:9999
 }}
>
 ✎
</button>
)}

    <button
      style={styles.deleteBtn}
      onClick={()=>{
 setPhotos(prev =>
   prev.filter((_,index)=>index!==i)
 );

 if(i===mainIndex){
   setMainIndex(0);
 }
}}
    >
      ✕
    </button>

  </div>
))}
      

          </div>
        </div>
      )}
    </div>
  );
}




const styles:any = {
  wrapper:{
 minHeight:"100vh",
 background:"#F5F7FB",
 padding:"20px 20px 120px",
 overflowY:"auto",
 WebkitOverflowScrolling:"touch"
},
  card:{background:"#fff",borderRadius:"24px",padding:"20px",maxWidth:"420px",margin:"0 auto"},

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
 background:"#E7F3FF",
 position:"relative",

 cursor:"pointer",   
 zIndex:2            
},

avatarImage:{
 width:"100%",
 height:"100%",
 objectFit:"cover"
},



  avatar:{width:"90px",height:"90px",borderRadius:"50%",background:"#E7F3FF",display:"flex",alignItems:"center",justifyContent:"center",objectFit:"cover"},
plus:{
  position:"absolute",
  bottom:0,
  right:"calc(50% - 46px)",

  width:"24px",
  height:"24px",

  borderRadius:"50%",
  background:"#2AABEE",
  color:"#fff",

  display:"flex",
  alignItems:"center",
  justifyContent:"center",

  fontSize:"16px",
  fontWeight:700,

  zIndex:3,

  pointerEvents:"none"   // 👈 ВОТ ЭТО ГЛАВНОЕ
},
  row:{display:"flex",gap:"10px"},
inputBox:{
  background:"#F9FAFB",
  borderRadius:"16px",
  padding:"8px 10px",   // 👈 было 12px → стало меньше
  marginTop:"12px",

  flex:"0 0 48%"
},
label:{
  fontSize:"11px",      // 👈 было 12px
  color:"#6B7280"
},
input:{
  width:"100%",
  border:"none",
  background:"transparent",
  outline:"none",

  fontSize:"14px",      // 👈 чуть меньше
  height:"20px"         // 👈 фикс высоты
},
  textarea:{
  width:"100%",
  border:"none",
  background:"transparent",
  outline:"none",

  resize:"none",
  height:"22px",       
  lineHeight:"22px"
},
  block:{marginTop:"14px"},

  buttons:{display:"flex",gap:"8px"},
  option:{
    flex:1,
    padding:"8px 6px",
    borderRadius:"12px",
    border:"none",
    background:"#E7F3FF",
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
  active:{background:"linear-gradient(135deg,#2AABEE,#1C8CEB)",color:"#fff"},

  tags:{display:"flex",flexWrap:"wrap",gap:"8px"},
  tag:{padding:"6px 10px",borderRadius:"999px",border:"1px solid #2AABEE",color:"#2AABEE",background:"#fff"},
  tagActive:{background:"#2AABEE",color:"#fff"},

  submit:{marginTop:"20px",width:"100%",height:"56px",borderRadius:"18px",border:"none",color:"#fff",background:"linear-gradient(135deg,#2AABEE,#1C8CEB)"},

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
 background:"#EEF5FD",
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

 background:"#fff",
 color:"#111",

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
 height:"6px",
 borderRadius:"999px",
 background:"#FFFFFF",
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

 background:"#fff",
 boxShadow:"0 6px 16px rgba(0,0,0,.18)",

 display:"flex",
 alignItems:"center",
 justifyContent:"center",

 fontSize:"15px",
 zIndex:999
},
cropModal:{
 background:"#fff",
 width:"90%",
 maxWidth:"380px",
 borderRadius:"28px",
 padding:"20px"
}

};