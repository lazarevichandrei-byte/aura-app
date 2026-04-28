"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import Cropper from "react-easy-crop";
export default function Profile() {
  
  const [loading, setLoading] = useState(true);
  const [telegramId, setTelegramId] = useState<number | null>(null);

  const [age, setAge] = useState(22);
  const [gender, setGender] = useState("female");
  const [search, setSearch] = useState("female");

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");

  const [photos, setPhotos] = useState<string[]>([]);
  const [mainIndex, setMainIndex] = useState(0);
  const [uploading, setUploading] = useState(false);

  const [selected, setSelected] = useState<string[]>([]);
  const [showMore, setShowMore] = useState(false);

  const [activePhoto, setActivePhoto] = useState(false);
  const [avatarCrop,setAvatarCrop] = useState({
 x:0,
 y:0,
 zoom:1.2
});
  const [cropOpen,setCropOpen] = useState(false);
const [editingPhoto,setEditingPhoto] = useState("");
const [tempIndex,setTempIndex] = useState(0);

const [crop,setCrop] = useState({x:0,y:0});
const [zoom,setZoom] = useState(1.2);
const [avatarFrame,setAvatarFrame] = useState({
 x:0,
 y:0,
 zoom:1.2
});

const [croppedAreaPixels,setCroppedAreaPixels] =
 useState<any>(null);

  const base = ["Путешествия", "Музыка", "Спорт", "Кино"];
  const extra = [
    "Игры","Бизнес","Еда","Йога","Авто",
    "Книги","Технологии","Искусство","Танцы","Природа",
  ];

  const isValid = name.trim().length > 0 && city.trim().length > 0;

useEffect(() => {
  document.body.style.overflowY = "auto";
  document.documentElement.style.overflowY = "auto";

  const init = async () => {
    const tg = (window as any).Telegram?.WebApp;

    if (tg) {
      tg.ready();
      tg.expand();
    }

    const user = tg?.initDataUnsafe?.user;
    if (!user) return setLoading(false);

    setTelegramId(user.id);
    setName(user.first_name || "");

    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("telegram_id", user.id)
      .maybeSingle();

    if (data) {
      setName(data.name || "");
      setAge(data.age || 22);
      setGender(data.gender || "female");
      setSearch(data.looking || "female");
      setCity(data.city || "");
      setBio(data.bio || "");
      setSelected(data.interests || []);

      if (data.photos?.length) {
  setPhotos(data.photos);
} else if (data.avatar_url) {
  setPhotos([data.avatar_url]);
}
    }

    setLoading(false);
  };

  init();
}, []);

    

  const uploadPhoto = async (file: File) => {
    if (!telegramId) return;

    setUploading(true);

    const fileName = `${telegramId}_${Date.now()}.jpg`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(fileName, file);

    if (!error) {
      const { data } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      setPhotos((prev) => [...prev, data.publicUrl]);
    }

    setUploading(false);
  };

  const toggle = (item: string) => {
    setSelected((prev) =>
      prev.includes(item)
        ? prev.filter((i) => i !== item)
        : [...prev, item]
    );
  };
    const handleSubmit = async () => {
    if (!telegramId || uploading) return;

    if (!name.trim() || !city.trim()) {
      alert("Заполни имя и город");
      return;
    }

    const { error } = await supabase.from("users").upsert({
      telegram_id: telegramId,
      name,
      age,
      gender,
      looking: search,
      city,
      bio,
      interests: selected,
      avatar_url: photos[mainIndex] || null,
photos: photos,
    });

    if (error) {
      alert(error.message);
    } else {
      window.location.href = "/home";
    }
  };

  if (loading) return <div>Loading...</div>;
const getCroppedImg = async (
 imageSrc:any,
 pixelCrop:any
)=>{
 const image = new Image();
 image.crossOrigin="anonymous";
 image.src=imageSrc;

 await new Promise(resolve=>{
   image.onload=resolve;
 });

 const size = 600;

 const canvas=document.createElement("canvas");
 const ctx=canvas.getContext("2d");

 if(!ctx) return imageSrc;

 canvas.width=size;
 canvas.height=size;

 ctx.drawImage(
   image,
   pixelCrop.x,
   pixelCrop.y,
   pixelCrop.width,
   pixelCrop.height,

   0,
   0,
   size,
   size
 );

 return canvas.toDataURL(
   "image/jpeg",
   0.95
 );
};


const saveCrop = async ()=>{

 const croppedUrl = await getCroppedImg(
   editingPhoto,
   croppedAreaPixels
 );

 setPhotos(prev=>{
   const copy=[...prev];
   copy[tempIndex]=croppedUrl;
   return copy;
 });

 setMainIndex(tempIndex);

 setCropOpen(false);

};
  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>

        <div style={styles.avatarWrapper} onClick={() => setActivePhoto(true)}>
          {photos.length > 0 ? (
  <div style={styles.avatarMask}>
  <img
    src={photos[mainIndex]}
    style={{
      ...styles.avatarImage,

      transform:`
        translate(${avatarCrop.x}px,
                  ${avatarCrop.y}px)
        scale(${avatarCrop.zoom})
      `
    }}
  />
</div>
) : (
            <div style={styles.avatar}>👤</div>
          )}
          <div style={styles.plus}>+</div>
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
 min="18"
 max="60"
 value={age}
 onChange={(e)=>setAge(Number(e.target.value))}
 style={styles.slider}
/>
          </div>
        </div>

        <div style={styles.block}>
          <p style={styles.label}>Пол</p>
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
          Продолжить
        </button>

      </div>

      {/* 🔥 ВОТ ФИКС ГАЛЕРЕИ */}
{activePhoto && (
<div style={styles.viewer} onClick={() => setActivePhoto(false)}>
  <div
    style={photos.length===0 ? styles.galleryEmpty : styles.gallery}
    onClick={(e)=>e.stopPropagation()}
  >

    <label style={styles.addPhoto}>
      +
      <input
        type="file"
        multiple
        accept="image/*"
        hidden
        onChange={async(e)=>{
          const files=e.target.files;
          if(!files) return;

          if(photos.length + files.length > 6){
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
          onClick={()=>setMainIndex(i)}
          style={{
            ...styles.galleryImg,
            border:i===mainIndex
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
            style={styles.editPhotoBtn}
            onClick={(e)=>{
              e.stopPropagation();
              setEditingPhoto(p);
              setTempIndex(i);
              setCropOpen(true);
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
          ×
        </button>

      </div>
    ))}

  </div>
</div>
)}

{cropOpen && (
<div
 style={styles.viewer}
 onClick={()=>setCropOpen(false)}
>
<div
 style={styles.cropModal}
 onClick={(e)=>e.stopPropagation()}
>

<div style={{
 position:"relative",
 height:"320px"
}}>

  
<Cropper
 image={editingPhoto}
 crop={crop}
 zoom={zoom}
 aspect={1}
 cropShape="round"
 onCropChange={setCrop}
 onZoomChange={setZoom}
 onCropComplete={(a,p)=>
   setCroppedAreaPixels(p)
 }
/>
</div>

<input
 type="range"
 min="1"
 max="3"
 step="0.1"
 value={zoom}
 onChange={(e)=>
   setZoom(Number(e.target.value))
 }
 style={styles.slider}
/>

<button
 style={styles.submit}
 onClick={()=>{
 setAvatarCrop({
   x:crop.x,
   y:crop.y,
   zoom:zoom
 });

 setMainIndex(tempIndex);

 setCropOpen(false);
}}
>
 Готово
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
 background:"#F5F7FB",
 padding:"20px 20px 120px",
 overflowY:"auto",
 WebkitOverflowScrolling:"touch"
},
  card:{background:"#fff",borderRadius:"24px",padding:"20px",maxWidth:"420px",margin:"0 auto"},

  avatarWrapper:{display:"flex",justifyContent:"center",marginBottom:"20px",position:"relative"},
avatarMask:{
 width:"90px",
 height:"90px",
 borderRadius:"50%",
 overflow:"hidden",
 position:"relative",
 background:"#E7F3FF"
},

avatarImage:{
 width:"100%",
 height:"100%",
 objectFit:"cover",
 transformOrigin:"center center"
},

plus:{position:"absolute",bottom:0,right:"calc(50% - 45px)",background:"#2AABEE",color:"#fff",borderRadius:"50%",width:"20px",height:"20px",display:"flex",alignItems:"center",justifyContent:"center"},

  row:{display:"flex",gap:"10px"},
  inputBox:{background:"#F9FAFB",borderRadius:"16px",padding:"12px",marginTop:"12px",flex:1},
  label:{fontSize:"12px",color:"#6B7280"},
  input:{width:"100%",border:"none",background:"transparent",outline:"none"},
  textarea:{width:"100%",border:"none",background:"transparent",outline:"none"},

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

 padding:"3px 8px",
 borderRadius:"999px",

 fontSize:9,
 fontWeight:600,
 letterSpacing:0.2
},

  active:{background:"linear-gradient(135deg,#2AABEE,#1C8CEB)",color:"#fff"},

  tags:{display:"flex",flexWrap:"wrap",gap:"8px"},
  tag:{padding:"6px 10px",borderRadius:"999px",border:"1px solid #2AABEE",color:"#2AABEE",background:"#fff"},
  tagActive:{background:"#2AABEE",color:"#fff"},

  submit:{marginTop:"20px",width:"100%",height:"56px",borderRadius:"18px",border:"none",color:"#fff",background:"linear-gradient(135deg,#2AABEE,#1C8CEB)"},

  viewer:{position:"fixed",top:0,left:0,width:"100%",height:"100%",background:"rgba(0,0,0,0.8)",display:"flex",alignItems:"center",justifyContent:"center"},

  galleryEmpty:{display:"flex",justifyContent:"center",alignItems:"center",height:"300px",width:"100%"},

gallery:{
 display:"grid",
 gridTemplateColumns:"repeat(3,1fr)",
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
 objectPosition:"center",
 borderRadius:"18px",
 display:"block"
},

addPhoto:{
 width:"110px",
 height:"160px",
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

 top:-7,
 right:-7,

 width:"24px",
 height:"24px",

 borderRadius:"50%",
 border:"none",

 background:"#fff",
 color:"#111",

 boxShadow:"0 3px 8px rgba(0,0,0,.14)",

 display:"flex",
 alignItems:"center",
 justifyContent:"center",

 fontSize:"14px",
 fontWeight:600,
 lineHeight:1,

 zIndex:50
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

 fontSize:15,
 cursor:"pointer",

 zIndex:999
},

cropModal:{
 background:"#fff",
 width:"90%",
 maxWidth:"380px",
 borderRadius:"28px",
 padding:"20px",
 position:"relative",
 zIndex:9999
}

};


