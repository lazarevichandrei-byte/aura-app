"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

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

  const base = ["Путешествия", "Музыка", "Спорт", "Кино"];
  const extra = [
    "Игры","Бизнес","Еда","Йога","Авто",
    "Книги","Технологии","Искусство","Танцы","Природа",
  ];

  const isValid = name.trim().length > 0 && city.trim().length > 0;

  useEffect(() => {
    const init = async () => {
      const tg = (window as any).Telegram?.WebApp;

      if (tg) {
        tg.ready();
        tg.expand();
        tg.setBackgroundColor("#ffffff");
        tg.setHeaderColor("#ffffff");
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

        if (data.avatar_url) {
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
    } else {
      alert("Ошибка загрузки: " + error.message);
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
    });

    if (error) {
      alert("Ошибка: " + error.message);
    } else {
      window.location.href = window.location.origin + "/home";
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>

        {/* АВАТАР */}
        <label style={styles.avatarWrapper}>
          {photos.length > 0 ? (
            <img src={photos[mainIndex]} style={styles.mainAvatar} />
          ) : (
            <div style={styles.emptyAvatar}>👤</div>
          )}

          <div style={styles.plus}>+</div>

          <input
            type="file"
            multiple
            hidden
            onChange={async (e) => {
              const files = e.target.files;
              if (!files) return;

              for (let i = 0; i < files.length; i++) {
                await uploadPhoto(files[i]);
              }

              e.target.value = "";
            }}
          />

          <div
            style={{ position: "absolute", inset: 0 }}
            onClick={(e) => {
              e.stopPropagation();
              setActivePhoto(true);
            }}
          />
        </label>
                <div style={styles.row}>
          <div style={styles.inputBox}>
            <p style={styles.label}>Имя</p>
            <input value={name} onChange={(e)=>setName(e.target.value)} style={styles.input}/>
          </div>

          <div style={styles.inputBox}>
            <p style={styles.label}>Возраст</p>
            <div>{age}</div>
            <input type="range" min="18" max="60" value={age} onChange={(e)=>setAge(Number(e.target.value))}/>
          </div>
        </div>

        <button
          disabled={!isValid || uploading}
          style={{...styles.submit,opacity:isValid?1:0.5}}
          onClick={handleSubmit}
        >
          {uploading ? "Загрузка..." : "Продолжить"}
        </button>

      </div>

      {/* ГАЛЕРЕЯ */}
      {activePhoto && (
        <div style={styles.viewer} onClick={() => setActivePhoto(false)}>
          <div style={styles.gallery} onClick={(e)=>e.stopPropagation()}>

            {photos.map((p, i) => {
              const isMain = i === mainIndex;

              return (
                <div key={i} style={styles.galleryItem}>
                  <img
                    src={p}
                    style={{
                      ...styles.galleryImg,
                      border: isMain ? "3px solid #2AABEE" : "none"
                    }}
                    onClick={() => setMainIndex(i)}
                  />

                  <button
                    style={styles.deleteBtn}
                    onClick={() => {
                      setPhotos((prev) => {
                        const newArr = prev.filter((_, index) => index !== i);
                        if (mainIndex >= newArr.length) setMainIndex(0);
                        return newArr;
                      });
                    }}
                  >
                    ✕
                  </button>
                </div>
              );
            })}

          </div>
        </div>
      )}
    </div>
  );
}

const styles:any = {
  wrapper:{minHeight:"100vh",background:"#F5F7FB",padding:"20px"},
  card:{background:"#fff",borderRadius:"24px",padding:"20px",maxWidth:"420px",margin:"0 auto"},

  avatarWrapper:{display:"flex",justifyContent:"center",marginBottom:"20px",position:"relative"},
  mainAvatar:{width:"100px",height:"100px",borderRadius:"50%",objectFit:"cover"},
  emptyAvatar:{width:"100px",height:"100px",borderRadius:"50%",background:"#E7F3FF",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"32px"},
  plus:{position:"absolute",bottom:0,right:"calc(50% - 50px)",background:"#2AABEE",color:"#fff",borderRadius:"50%",width:"24px",height:"24px",display:"flex",alignItems:"center",justifyContent:"center"},

  row:{display:"flex",gap:"10px"},
  inputBox:{background:"#F9FAFB",borderRadius:"16px",padding:"12px",marginTop:"12px",flex:1},
  label:{fontSize:"12px",color:"#6B7280"},
  input:{width:"100%",border:"none",background:"transparent",outline:"none"},

  submit:{marginTop:"20px",width:"100%",height:"56px",borderRadius:"18px",border:"none",color:"#fff",background:"linear-gradient(135deg,#2AABEE,#1C8CEB)"},

  viewer:{position:"fixed",top:0,left:0,width:"100%",height:"100%",background:"rgba(0,0,0,0.9)",display:"flex",alignItems:"center",justifyContent:"center"},
  
  gallery:{
    display:"grid",
    gridTemplateColumns:"repeat(4, 1fr)",
    gap:"10px",
    padding:"20px",
    maxHeight:"80vh",
    overflowY:"auto"
  },

  galleryItem:{position:"relative"},

  galleryImg:{
    width:"100%",
    aspectRatio:"3/4",
    borderRadius:"12px",
    objectFit:"cover"
  },

  deleteBtn:{
    position:"absolute",
    inset:0,
    background:"rgba(0,0,0,0.6)",
    color:"#fff",
    border:"none",
    fontSize:"24px",
    display:"flex",
    alignItems:"center",
    justifyContent:"center",
    borderRadius:"12px"
  }
};