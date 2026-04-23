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
          setMainIndex(0);
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
        <div style={styles.avatarWrapper}>
          <img
            src={photos[mainIndex] || "/placeholder.png"}
            style={styles.mainAvatar}
            onClick={() => setActivePhoto(true)}
          />
          <div style={styles.camera}>📷</div>
        </div>
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

        <div style={styles.block}>
          <p style={styles.label}>Пол</p>
          <div style={styles.buttons}>
            <button onClick={()=>setGender("female")} style={{...styles.option,...(gender==="female"&&styles.active)}}>♀ Женщина</button>
            <button onClick={()=>setGender("male")} style={{...styles.option,...(gender==="male"&&styles.active)}}>♂ Мужчина</button>
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

            <label style={styles.addPhoto}>
              +
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
            </label>

            {photos.map((p, i) => (
              <div key={i} style={styles.galleryItem}>
                <img src={p} style={styles.galleryImg} />

                <button
                  style={styles.starBtn}
                  onClick={() => setMainIndex(i)}
                >
                  ⭐
                </button>

                <button
                  style={styles.deleteBtn}
                  onClick={() => {
                    setPhotos((prev) =>
                      prev.filter((_, index) => index !== i)
                    );
                    if (mainIndex === i) setMainIndex(0);
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
  wrapper:{minHeight:"100vh",background:"#F5F7FB",padding:"20px"},
  card:{background:"#fff",borderRadius:"24px",padding:"20px",maxWidth:"420px",margin:"0 auto"},

  avatarWrapper:{display:"flex",justifyContent:"center",marginBottom:"20px",position:"relative"},
  mainAvatar:{width:"90px",height:"90px",borderRadius:"50%",objectFit:"cover",cursor:"pointer"},
  camera:{position:"absolute",bottom:0,right:"calc(50% - 45px)",background:"#2AABEE",color:"#fff",borderRadius:"50%",padding:"6px"},

  row:{display:"flex",gap:"10px"},
  inputBox:{background:"#F9FAFB",borderRadius:"16px",padding:"12px",marginTop:"12px",flex:1},
  label:{fontSize:"12px",color:"#6B7280"},
  input:{width:"100%",border:"none",background:"transparent",outline:"none"},
  textarea:{width:"100%",border:"none",background:"transparent",outline:"none"},

  block:{marginTop:"14px"},
  buttons:{display:"flex",gap:"10px"},
  option:{flex:1,padding:"10px",borderRadius:"14px",border:"none",background:"#E7F3FF"},
  active:{background:"linear-gradient(135deg,#2AABEE,#1C8CEB)",color:"#fff"},

  submit:{marginTop:"20px",width:"100%",height:"56px",borderRadius:"18px",border:"none",color:"#fff",background:"linear-gradient(135deg,#2AABEE,#1C8CEB)"},

  viewer:{position:"fixed",top:0,left:0,width:"100%",height:"100%",background:"rgba(0,0,0,0.9)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000},
  gallery:{display:"flex",gap:"10px",overflowX:"auto",padding:"20px"},
  galleryItem:{position:"relative"},
  galleryImg:{width:"120px",height:"120px",borderRadius:"12px",objectFit:"cover"},

  addPhoto:{width:"70px",height:"70px",borderRadius:"50%",background:"#E7F3FF",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"},

  starBtn:{position:"absolute",bottom:5,left:5,background:"#fff",border:"none",borderRadius:"50%",width:"24px",height:"24px"},
  deleteBtn:{position:"absolute",top:5,right:5,background:"rgba(0,0,0,0.6)",color:"#fff",border:"none",borderRadius:"50%",width:"24px",height:"24px"}
};