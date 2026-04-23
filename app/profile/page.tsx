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

  const [selected, setSelected] = useState<string[]>([]);
  const [showMore, setShowMore] = useState(false);

  // ✅ ошибки
  const [errors, setErrors] = useState({
    name: false,
    city: false,
    bio: false,
  });

  const base = ["Путешествия", "Музыка", "Спорт", "Кино"];
  const extra = [
    "Игры",
    "Бизнес",
    "Еда",
    "Йога",
    "Авто",
    "Книги",
    "Технологии",
    "Искусство",
    "Танцы",
    "Природа",
  ];

  // ✅ валидация
  const isValid =
    name.trim().length > 0 &&
    city.trim().length > 0;

  useEffect(() => {
    const init = async () => {
      const tg = (window as any).Telegram?.WebApp;
      const user = tg?.initDataUnsafe?.user;

      if (!user) {
        setLoading(false);
        return;
      }

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
      }

      setLoading(false);
    };

    init();
  }, []);

  const toggle = (item: string) => {
    if (selected.includes(item)) {
      setSelected(selected.filter((i) => i !== item));
    } else {
      setSelected([...selected, item]);
    }
  };

  const handleSubmit = async () => {
    if (!telegramId) return;

    const newErrors = {
      name: name.trim().length === 0,
      city: city.trim().length === 0,
      bio: bio.trim().length < 10,
    };

    setErrors(newErrors);

    if (newErrors.name || newErrors.city || newErrors.bio) {
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
    });

    if (error) {
      alert("Ошибка: " + error.message);
    } else {
      window.location.href = window.location.origin + "/home";
    }
  };

  if (loading) {
    return <div style={{ padding: 20 }}>Loading...</div>;
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        {/* HEADER */}
        <div style={styles.header}>
          <div style={styles.avatarWrapper}>
            <div style={styles.avatar}></div>
            <div style={styles.camera}>📷</div>
          </div>

          <div>
            <h2 style={styles.title}>Создание профиля</h2>
            <p style={styles.subtitle}>
              Расскажи о себе, чтобы найти близких по духу 💙
            </p>
          </div>
        </div>

        {/* ИМЯ + ВОЗРАСТ */}
        <div style={styles.row}>
          <div style={styles.inputBox}>
            <p style={styles.label}>Имя</p>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Введите имя"
              style={{
                ...styles.input,
                border: errors.name ? "1px solid red" : "none",
              }}
            />
            {errors.name && <p style={styles.error}>Введите имя</p>}
          </div>

          <div style={styles.inputBox}>
            <p style={styles.label}>Возраст</p>
            <div style={{ fontWeight: 600 }}>{age}</div>
            <input
              type="range"
              min="18"
              max="60"
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              style={styles.slider}
            />
          </div>
        </div>

        {/* ПОЛ */}
        <div style={styles.block}>
          <p style={styles.label}>Пол</p>
          <div style={styles.buttons}>
            <button
              onClick={() => setGender("female")}
              style={{
                ...styles.option,
                ...(gender === "female" && styles.active),
              }}
            >
              ♀ Женщина
            </button>

            <button
              onClick={() => setGender("male")}
              style={{
                ...styles.option,
                ...(gender === "male" && styles.active),
              }}
            >
              ♂ Мужчина
            </button>
          </div>
        </div>

        {/* КОГО ИЩЕШЬ */}
        <div style={styles.block}>
          <p style={styles.label}>Кого ищешь</p>
          <div style={styles.buttons}>
            {["male", "female", "any"].map((item) => (
              <button
                key={item}
                onClick={() => setSearch(item)}
                style={{
                  ...styles.option,
                  ...(search === item && styles.active),
                }}
              >
                {item === "male"
                  ? "Парня"
                  : item === "female"
                  ? "Девушку"
                  : "Без разницы"}
              </button>
            ))}
          </div>
        </div>

        {/* ГОРОД */}
        <div style={styles.inputBox}>
          <p style={styles.label}>Город</p>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Введите город"
            style={{
              ...styles.input,
              border: errors.city ? "1px solid red" : "none",
            }}
          />
          {errors.city && <p style={styles.error}>Введите город</p>}
        </div>

        {/* BIO */}
        <div style={styles.inputBox}>
          <p style={styles.label}>О себе</p>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Расскажите о себе..."
            style={{
              ...styles.textarea,
              border: errors.bio ? "1px solid red" : "none",
            }}
          />
          {errors.bio && (
            <p style={styles.error}>Минимум 10 символов</p>
          )}
        </div>

        {/* ИНТЕРЕСЫ */}
        <div style={styles.block}>
          <p style={styles.label}>Интересы</p>
          <div style={styles.tags}>
            {[...base, ...(showMore ? extra : [])].map((t) => {
              const active = selected.includes(t);

              return (
                <span
                  key={t}
                  onClick={() => toggle(t)}
                  style={{
                    ...styles.tag,
                    ...(active ? styles.tagActive : {}),
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
        </div>

        {/* КНОПКА */}
        <button
          style={{
            ...styles.submit,
            opacity: isValid ? 1 : 0.5,
            pointerEvents: isValid ? "auto" : "none",
          }}
          onClick={handleSubmit}
        >
          Продолжить
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
    fontFamily: "-apple-system, sans-serif",
  },

  card: {
    background: "#fff",
    borderRadius: "24px",
    padding: "20px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
    maxWidth: "420px",
    margin: "0 auto",
  },

  header: {
    display: "flex",
    gap: "15px",
    marginBottom: "20px",
  },

  avatarWrapper: { position: "relative" },

  avatar: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: "#ddd",
    border: "3px solid #2A7BFF",
  },

  camera: {
    position: "absolute",
    bottom: 0,
    right: 0,
    background: "#2A7BFF",
    color: "#fff",
    borderRadius: "50%",
    padding: "6px",
    fontSize: "12px",
  },

  title: { fontSize: "20px", fontWeight: "600" },
  subtitle: { fontSize: "14px", color: "#6B7280" },

  row: { display: "flex", gap: "10px" },

  inputBox: {
    background: "#F9FAFB",
    borderRadius: "16px",
    padding: "12px",
    marginTop: "12px",
    flex: 1,
  },

  label: { fontSize: "12px", color: "#6B7280" },

  input: {
    width: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
  },

  textarea: {
    width: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
  },

  error: {
    color: "red",
    fontSize: "12px",
    marginTop: "4px",
  },

  slider: { width: "100%" },

  block: { marginTop: "14px" },

  buttons: { display: "flex", gap: "10px" },

  option: {
    flex: 1,
    padding: "10px",
    borderRadius: "14px",
    border: "none",
    background: "#EEF1F6",
  },

  active: {
    background: "linear-gradient(90deg,#2A7BFF,#1C5EFF)",
    color: "white",
  },

  tags: { display: "flex", flexWrap: "wrap", gap: "8px" },

  tag: {
    padding: "6px 10px",
    borderRadius: "999px",
    border: "1px solid #2A7BFF",
    color: "#2A7BFF",
  },

  tagActive: { background: "#2A7BFF", color: "#fff" },

  submit: {
    marginTop: "20px",
    width: "100%",
    height: "56px",
    borderRadius: "16px",
    border: "none",
    color: "white",
    background: "linear-gradient(90deg,#2A7BFF,#1C5EFF)",
  },
};