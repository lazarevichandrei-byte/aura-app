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

    if (!error) {
      window.location.href = "/home";
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}></div>
              {/* АВАТАР */}
        <label style={styles.avatarWrapper}>
          {photos.length > 0 ? (
            <img src={photos[mainIndex]} style={styles.avatar} />
          ) : (
            <div style={styles.avatar}>👤</div>
          )}

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
            }}
          />
        </label>

        {/* ИМЯ + ВОЗРАСТ */}
        <div style={styles.row}>
          <div style={styles.inputBox}>
            <p>Имя</p>
            <input value={name} onChange={(e)=>setName(e.target.value)} />
          </div>

          <div style={styles.inputBox}>
            <p>Возраст</p>
            <input type="range" min="18" max="60" value={age} onChange={(e)=>setAge(Number(e.target.value))}/>
          </div>
        </div>

        {/* ПОЛ */}
        <div style={styles.block}>
          <p>Пол</p>
          <div style={styles.buttons}>
            <button onClick={()=>setGender("female")} style={gender==="female"?styles.active:styles.option}>Женщина</button>
            <button onClick={()=>setGender("male")} style={gender==="male"?styles.active:styles.option}>Мужчина</button>
          </div>
        </div>

        {/* КОГО ИЩЕШЬ */}
        <div style={styles.block}>
          <p>Кого ищешь</p>
          <div style={styles.buttons}>
            {["male","female","any"].map(item=>(
              <button key={item} onClick={()=>setSearch(item)} style={search===item?styles.active:styles.option}>
                {item==="male"?"Парня":item==="female"?"Девушку":"Любого"}
              </button>
            ))}
          </div>
        </div>

        {/* ГОРОД */}
        <div style={styles.inputBox}>
          <p>Город</p>
          <input value={city} onChange={(e)=>setCity(e.target.value)} />
        </div>

        {/* ИНТЕРЕСЫ */}
        <div style={styles.tags}>
          {[...base, ...(showMore ? extra : [])].map(t=>(
            <span key={t} onClick={()=>toggle(t)} style={selected.includes(t)?styles.tagActive:styles.tag}>
              {t}
            </span>
          ))}
        </div>

        <button style={styles.submit} onClick={handleSubmit}>
          Продолжить
        </button>

      </div>
    </div>
  );
}