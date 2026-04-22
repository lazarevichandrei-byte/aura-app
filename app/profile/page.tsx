"use client";

import { useState } from "react";

export default function Profile() {
  const [gender, setGender] = useState("Женщина");
  const [looking, setLooking] = useState("Девушку");
  const [selected, setSelected] = useState<string[]>([]);
  const [showMore, setShowMore] = useState(false);

  const base = ["Путешествия", "Музыка", "Спорт", "Кино", "Фотография"];
  const extra = ["Игры", "Бизнес", "Еда", "Йога", "Авто"];

  const toggle = (item: string) => {
    if (selected.includes(item)) {
      setSelected(selected.filter((i) => i !== item));
    } else {
      setSelected([...selected, item]);
    }
  };

  return (
    <div style={styles.wrapper}>
      
      {/* glow */}
      <div style={styles.glow1}></div>
      <div style={styles.glow2}></div>

      <div style={styles.container}>

        {/* HEADER */}
        <div style={styles.header}>
          <div style={styles.avatar}></div>

          <div>
            <h1 style={styles.title}>Создание профиля</h1>
            <p style={styles.subtitle}>
              Расскажи о себе, чтобы найти близких по духу людей 💜
            </p>
          </div>
        </div>

        {/* ИМЯ + ВОЗРАСТ */}
        <div style={styles.row}>
          <div style={styles.card}>
            <p style={styles.label}>Имя</p>
            <input placeholder="Алина" style={styles.input} />
          </div>

          <div style={styles.card}>
            <p style={styles.label}>Возраст</p>
            <input type="range" min="18" max="60" style={{ width: "100%" }} />
          </div>
        </div>

        {/* ПОЛ */}
        <div style={styles.card}>
          <p style={styles.label}>Пол</p>
          <div style={styles.flex}>
            {["Женщина", "Мужчина"].map((g) => (
              <button
                key={g}
                onClick={() => setGender(g)}
                style={{
                  ...styles.choice,
                  ...(gender === g ? styles.active : {}),
                }}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* КОГО ИЩЕШЬ */}
        <div style={styles.card}>
          <p style={styles.label}>Кого ищешь</p>
          <div style={styles.flex}>
            {["Парня", "Девушку", "Без разницы"].map((g) => (
              <button
                key={g}
                onClick={() => setLooking(g)}
                style={{
                  ...styles.choice,
                  ...(looking === g ? styles.active : {}),
                }}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* ГОРОД */}
        <div style={styles.card}>
          <p style={styles.label}>Город</p>
          <input placeholder="Москва" style={styles.input} />
        </div>

        {/* О СЕБЕ */}
        <div style={styles.card}>
          <p style={styles.label}>О себе</p>
          <textarea
            placeholder="Люблю путешествия ✈️✨"
            style={styles.textarea}
          />
        </div>

        {/* ИНТЕРЕСЫ */}
        <div style={styles.card}>
          <p style={styles.label}>Интересы</p>

          <div style={styles.tags}>
            {[...base, ...(showMore ? extra : [])].map((item) => {
              const active = selected.includes(item);

              return (
                <div
                  key={item}
                  onClick={() => toggle(item)}
                  style={{
                    ...styles.tag,
                    ...(active ? styles.tagActive : {}),
                  }}
                >
                  {item}
                </div>
              );
            })}

            {!showMore && (
              <div onClick={() => setShowMore(true)} style={styles.tag}>
                +
              </div>
            )}
          </div>
        </div>

        {/* КНОПКА */}
        <button style={styles.button}>
          Продолжить
        </button>

      </div>
    </div>
  );
}

const styles: any = {
  wrapper: {
    minHeight: "100vh",
    background: "#0B0B0F",
    color: "white",
    padding: "20px",
    position: "relative",
    fontFamily: "Arial",
  },

  container: {
    maxWidth: "420px",
    margin: "0 auto",
  },

  header: {
    display: "flex",
    gap: "15px",
    alignItems: "center",
    marginBottom: "20px",
  },

  avatar: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: "#333",
    border: "2px solid #a855f7",
    boxShadow: "0 0 20px rgba(168,85,247,0.7)",
  },

  title: {
    fontSize: "20px",
    fontWeight: "bold",
  },

  subtitle: {
    fontSize: "13px",
    color: "#aaa",
  },

  row: {
    display: "flex",
    gap: "10px",
  },

  card: {
    background: "rgba(255,255,255,0.05)",
    padding: "15px",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.1)",
    backdropFilter: "blur(10px)",
    marginBottom: "10px",
    flex: 1,
  },

  label: {
    fontSize: "12px",
    color: "#aaa",
    marginBottom: "5px",
  },

  input: {
    width: "100%",
    background: "transparent",
    border: "none",
    borderBottom: "1px solid #333",
    color: "white",
  },

  textarea: {
    width: "100%",
    background: "transparent",
    border: "none",
    borderBottom: "1px solid #333",
    color: "white",
  },

  flex: {
    display: "flex",
    gap: "10px",
  },

  choice: {
    flex: 1,
    padding: "10px",
    borderRadius: "20px",
    background: "#222",
    border: "none",
    color: "white",
    cursor: "pointer",
  },

  active: {
    background: "linear-gradient(90deg,#7B2FF7,#F107A3)",
    boxShadow: "0 0 15px rgba(123,47,247,0.7)",
  },

  tags: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },

  tag: {
    padding: "8px 14px",
    borderRadius: "20px",
    background: "#222",
    cursor: "pointer",
  },

  tagActive: {
    background: "linear-gradient(90deg,#7B2FF7,#F107A3)",
  },

  button: {
    marginTop: "20px",
    width: "100%",
    height: "56px",
    borderRadius: "20px",
    border: "none",
    fontSize: "18px",
    color: "white",
    background: "linear-gradient(90deg,#7B2FF7,#F107A3)",
    boxShadow: "0 0 30px rgba(123,47,247,0.7)",
  },

  glow1: {
    position: "absolute",
    top: "-100px",
    left: "-100px",
    width: "300px",
    height: "300px",
    background: "purple",
    filter: "blur(120px)",
    opacity: 0.2,
  },

  glow2: {
    position: "absolute",
    bottom: "-100px",
    right: "-100px",
    width: "300px",
    height: "300px",
    background: "pink",
    filter: "blur(120px)",
    opacity: 0.2,
  },
};