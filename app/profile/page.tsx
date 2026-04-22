"use client";

import { useState, useEffect } from "react";

export default function Profile() {
  const [age, setAge] = useState(22);
  const [gender, setGender] = useState("Женщина");

  useEffect(() => {
    document.body.style.background = "#0B0B0F";
  }, []);

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
              Расскажи о себе 💜
            </p>
          </div>
        </div>

        {/* ИМЯ */}
        <div style={styles.card}>
          <p style={styles.label}>Имя</p>
          <input placeholder="Алина" style={styles.input} />
        </div>

        {/* ВОЗРАСТ */}
        <div style={styles.card}>
          <div style={styles.ageRow}>
            <p style={styles.label}>Возраст</p>
            <span style={styles.ageValue}>{age}</span>
          </div>

          <input
            type="range"
            min="18"
            max="60"
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            style={styles.slider}
          />
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
    fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
  },

  container: {
    maxWidth: "420px",
    margin: "0 auto",
    animation: "fade 0.6s ease",
  },

  header: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "25px",
  },

  avatar: {
    width: "90px",
    height: "90px",
    borderRadius: "50%", // 🔥 теперь идеально круглый
    background: "linear-gradient(145deg,#2a2a2f,#1a1a1f)",
    border: "3px solid #a855f7",
    boxShadow: "0 0 25px rgba(168,85,247,0.6)",
  },

  title: {
    fontSize: "20px",
    fontWeight: "600",
  },

  subtitle: {
    fontSize: "13px",
    color: "#aaa",
  },

  card: {
    background: "rgba(255,255,255,0.05)",
    padding: "16px",
    borderRadius: "18px",
    border: "1px solid rgba(255,255,255,0.08)",
    backdropFilter: "blur(14px)",
    marginBottom: "14px",
    transition: "0.3s",
  },

  label: {
    fontSize: "12px",
    color: "#aaa",
    marginBottom: "6px",
  },

  input: {
    width: "100%",
    background: "transparent",
    border: "none",
    borderBottom: "1px solid #333",
    color: "white",
    fontSize: "15px",
    outline: "none",
  },

  textarea: {
    width: "100%",
    background: "transparent",
    border: "none",
    borderBottom: "1px solid #333",
    color: "white",
    fontSize: "15px",
    outline: "none",
  },

  ageRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  ageValue: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#fff",
  },

  slider: {
    width: "100%",
    marginTop: "10px",
    accentColor: "#a855f7",
  },

  button: {
    marginTop: "25px",
    width: "100%",
    height: "58px",
    borderRadius: "20px",
    border: "none",
    fontSize: "18px",
    fontWeight: "600",
    color: "white",
    background: "linear-gradient(90deg,#7B2FF7,#F107A3)",
    boxShadow: "0 10px 40px rgba(123,47,247,0.5)",
    transition: "0.2s",
  },

  glow1: {
    position: "absolute",
    top: "-120px",
    left: "-120px",
    width: "300px",
    height: "300px",
    background: "purple",
    filter: "blur(120px)",
    opacity: 0.2,
  },

  glow2: {
    position: "absolute",
    bottom: "-120px",
    right: "-120px",
    width: "300px",
    height: "300px",
    background: "pink",
    filter: "blur(120px)",
    opacity: 0.2,
  },
};