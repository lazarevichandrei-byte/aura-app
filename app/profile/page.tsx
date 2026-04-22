"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Profile() {
  const [age, setAge] = useState(22);
  const [gender, setGender] = useState("female");
  const [search, setSearch] = useState("female");

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");

  const [selected, setSelected] = useState<string[]>([]);
  const [showMore, setShowMore] = useState(false);

  const base = ["Путешествия", "Музыка", "Спорт", "Кино"];
  const extra = [
    "Игры","Бизнес","Еда","Йога","Авто",
    "Книги","Технологии","Искусство","Танцы","Природа",
  ];

  const toggle = (item: string) => {
    if (selected.includes(item)) {
      setSelected(selected.filter((i) => i !== item));
    } else {
      setSelected([...selected, item]);
    }
  };

  // 🔥 загрузка профиля
  useEffect(() => {
    const loadProfile = async () => {
      const tg = (window as any).Telegram?.WebApp;
      const user = tg?.initDataUnsafe?.user;

      if (!user) return;

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("telegram_id", user.id)
        .maybeSingle();

      if (error) {
        console.log(error);
        return;
      }

      if (data) {
        setName(data.name || "");
        setCity(data.city || "");
        setBio(data.bio || "");
        setAge(data.age || 22);
        setGender(data.gender || "female");
        setSearch(data.looking || "female");
        setSelected(data.interests || []);
      }
    };

    loadProfile();
  }, []);

  // 🚀 сохранение
  const handleSave = async () => {
    const tg = (window as any).Telegram?.WebApp;
    const user = tg?.initDataUnsafe?.user;

    if (!user) {
      alert("Открой через Telegram");
      return;
    }

    const { error } = await supabase.from("users").upsert(
      {
        telegram_id: user.id,
        name,
        age,
        gender,
        looking: search,
        city,
        bio,
        interests: selected,
      },
      { onConflict: "telegram_id" }
    );

    if (error) {
      console.log(error);
      alert("Ошибка");
    } else {
      alert("Сохранено ✅");
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>

        <h2>Профиль</h2>

        <input
          placeholder="Имя"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={styles.input}
        />

        <input
          placeholder="Город"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          style={styles.input}
        />

        <textarea
          placeholder="О себе"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          style={styles.textarea}
        />

        <p>Возраст: {age}</p>
        <input
          type="range"
          min="18"
          max="60"
          value={age}
          onChange={(e) => setAge(Number(e.target.value))}
        />

        {/* Пол */}
        <div style={styles.buttons}>
          <button
            onClick={() => setGender("female")}
            style={{ ...styles.option, ...(gender === "female" && styles.active) }}
          >
            Женщина
          </button>

          <button
            onClick={() => setGender("male")}
            style={{ ...styles.option, ...(gender === "male" && styles.active) }}
          >
            Мужчина
          </button>
        </div>

        {/* Кого ищешь */}
        <div style={styles.buttons}>
          {["female", "male", "any"].map((item) => (
            <button
              key={item}
              onClick={() => setSearch(item)}
              style={{
                ...styles.option,
                ...(search === item && styles.active),
              }}
            >
              {item === "female"
                ? "Девушку"
                : item === "male"
                ? "Парня"
                : "Любого"}
            </button>
          ))}
        </div>

        {/* Интересы */}
        <div>
          {[...base, ...(showMore ? extra : [])].map((t) => {
            const active = selected.includes(t);

            return (
              <span
                key={t}
                onClick={() => toggle(t)}
                style={{
                  ...styles.tag,
                  ...(active && styles.tagActive),
                }}
              >
                {t}
              </span>
            );
          })}

          {!showMore && (
            <span style={styles.tag} onClick={() => setShowMore(true)}>
              +
            </span>
          )}
        </div>

        <button onClick={handleSave} style={styles.submit}>
          Сохранить
        </button>

      </div>
    </div>
  );
}

const styles: any = {
  wrapper: {
    minHeight: "100vh",
    background: "#F5F7FB",
    padding: "20px",
  },

  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "20px",
    maxWidth: "400px",
    margin: "0 auto",
  },

  input: {
    width: "100%",
    marginBottom: "10px",
    padding: "10px",
  },

  textarea: {
    width: "100%",
    marginBottom: "10px",
    padding: "10px",
  },

  buttons: {
    display: "flex",
    gap: "10px",
    marginBottom: "10px",
  },

  option: {
    flex: 1,
    padding: "10px",
    borderRadius: "10px",
    border: "none",
    background: "#EEF1F6",
    cursor: "pointer",
  },

  active: {
    background: "#2A7BFF",
    color: "#fff",
  },

  tag: {
    padding: "6px 10px",
    border: "1px solid #2A7BFF",
    margin: "4px",
    display: "inline-block",
    cursor: "pointer",
    borderRadius: "20px",
  },

  tagActive: {
    background: "#2A7BFF",
    color: "#fff",
  },

  submit: {
    marginTop: "20px",
    width: "100%",
    padding: "12px",
    borderRadius: "12px",
    border: "none",
    background: "#2A7BFF",
    color: "#fff",
    cursor: "pointer",
  },
};