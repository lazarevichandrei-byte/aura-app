"use client";

import { useState } from "react";

export default function Profile() {
  const [age, setAge] = useState(22);
  const [gender, setGender] = useState("female");
  const [search, setSearch] = useState("female");

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
            <input defaultValue="Алина" style={styles.input} />
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
        <div style={styles.block}>
          <p style={styles.label}>Город</p>
          <input defaultValue="Москва" style={styles.input} />
        </div>

        {/* О СЕБЕ */}
        <div style={styles.block}>
          <p style={styles.label}>О себе</p>
          <textarea
            defaultValue="Люблю путешествия и новые впечатления ✈️✨"
            style={styles.textarea}
          />
        </div>

        {/* ИНТЕРЕСЫ */}
        <div style={styles.block}>
          <p style={styles.label}>Интересы</p>

          <div style={styles.tags}>
            {["Путешествия", "Музыка", "Спорт", "Кино"].map((t) => (
              <span key={t} style={styles.tag}>
                {t}
              </span>
            ))}

            <span style={styles.tag}>+</span>
          </div>
        </div>

        {/* КНОПКА */}
        <button style={styles.submit}>Продолжить</button>

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

  avatarWrapper: {
    position: "relative",
  },

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

  title: {
    fontSize: "20px",
    fontWeight: "600",
  },

  subtitle: {
    fontSize: "14px",
    color: "#6B7280",
  },

  row: {
    display: "flex",
    gap: "10px",
  },

  inputBox: {
    flex: 1,
    background: "#F9FAFB",
    borderRadius: "16px",
    padding: "12px",
  },

  label: {
    fontSize: "12px",
    color: "#6B7280",
    marginBottom: "6px",
  },

  input: {
    width: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: "16px",
  },

  textarea: {
    width: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    resize: "none",
    fontSize: "16px",
  },

  slider: {
    width: "100%",
    accentColor: "#2A7BFF",
  },

  block: {
    marginTop: "14px",
  },

  buttons: {
    display: "flex",
    gap: "10px",
    marginTop: "8px",
  },

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

  tags: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },

  tag: {
    padding: "8px 12px",
    borderRadius: "999px",
    border: "1px solid #2A7BFF",
    color: "#2A7BFF",
    fontSize: "14px",
  },

  submit: {
    marginTop: "20px",
    width: "100%",
    height: "56px",
    borderRadius: "16px",
    border: "none",
    color: "white",
    fontSize: "16px",
    background: "linear-gradient(90deg,#2A7BFF,#1C5EFF)",
    boxShadow: "0 8px 20px rgba(42,123,255,0.3)",
  },
};