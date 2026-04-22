"use client";

import { useState, useEffect } from "react";

export default function Profile() {
  const [age, setAge] = useState(22);

  useEffect(() => {
    document.body.style.background = "#0B0B0F";
  }, []);

  return (
    <div style={styles.wrapper}>
      {/* glow */}
      <div style={styles.glowTop}></div>
      <div style={styles.glowBottom}></div>

      <div style={styles.container}>

        {/* HEADER */}
        <div style={styles.header}>
          <div style={styles.avatar}></div>

          <h1 style={styles.title}>Создание профиля</h1>

          <p style={styles.subtitle}>
            Расскажи о себе, чтобы найти близких по духу 💜
          </p>
        </div>

        {/* КАРТОЧКИ */}
        <div style={styles.card}>
          <p style={styles.label}>Имя</p>
          <input placeholder="Алина" style={styles.input} />
        </div>

        <div style={styles.card}>
          <div style={styles.row}>
            <p style={styles.label}>Возраст</p>
            <span style={styles.age}>{age}</span>
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

        <div style={styles.card}>
          <p style={styles.label}>Город</p>
          <input placeholder="Москва" style={styles.input} />
        </div>

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
    fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
    position: "relative",
  },

  container: {
    maxWidth: "420px",
    margin: "0 auto",
  },

  header: {
    textAlign: "center",
    marginBottom: "25px",
  },

  avatar: {
    width: "110px",
    height: "110px",
    borderRadius: "50%",
    margin: "0 auto 15px",
    background: "linear-gradient(145deg,#2a2a2f,#1a1a1f)",
    border: "3px solid #a855f7",
    boxShadow: "0 0 30px rgba(168,85,247,0.7)",
  },

  title: {
    fontSize: "22px",
    fontWeight: "600",
  },

  subtitle: {
    fontSize: "14px",
    color: "#aaa",
    marginTop: "6px",
  },

  card: {
    background: "rgba(255,255,255,0.04)",
    padding: "18px",
    borderRadius: "20px",
    border: "1px solid rgba(255,255,255,0.08)",
    backdropFilter: "blur(16px)",
    marginBottom: "14px",
  },

  label: {
    fontSize: "13px",
    color: "#aaa",
    marginBottom: "6px",
  },

  input: {
    width: "100%",
    background: "transparent",
    border: "none",
    borderBottom: "1px solid #333",
    color: "white",
    fontSize: "16px",
    outline: "none",
    paddingBottom: "6px",
  },

  textarea: {
    width: "100%",
    background: "transparent",
    border: "none",
    borderBottom: "1px solid #333",
    color: "white",
    fontSize: "16px",
    outline: "none",
    resize: "none",
    paddingBottom: "6px",
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  age: {
    fontSize: "16px",
    fontWeight: "600",
  },

  slider: {
    width: "100%",
    marginTop: "10px",
    accentColor: "#a855f7",
  },

  button: {
    marginTop: "20px",
    width: "100%",
    height: "60px",
    borderRadius: "20px",
    border: "none",
    fontSize: "18px",
    fontWeight: "600",
    color: "white",
    background: "linear-gradient(90deg,#7B2FF7,#F107A3)",
    boxShadow: "0 10px 40px rgba(123,47,247,0.6)",
  },

  glowTop: {
    position: "absolute",
    top: "-120px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "300px",
    height: "300px",
    background: "purple",
    filter: "blur(120px)",
    opacity: 0.2,
  },

  glowBottom: {
    position: "absolute",
    bottom: "-120px",
    right: "-100px",
    width: "300px",
    height: "300px",
    background: "pink",
    filter: "blur(120px)",
    opacity: 0.2,
  },
};