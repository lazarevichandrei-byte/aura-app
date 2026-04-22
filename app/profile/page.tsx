"use client";

import { useState } from "react";

export default function Profile() {
  const [selected, setSelected] = useState<string[]>([]);
  const [showMore, setShowMore] = useState(false);

  const base = ["Путешествия", "Музыка", "Спорт", "Кино", "Фото"];
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

      <div style={styles.content}>
        
        <h1 style={styles.title}>Создание профиля</h1>

        {/* Аватар */}
        <div style={styles.avatarWrapper}>
          <div style={styles.avatar}></div>
          <div style={styles.camera}>📷</div>
        </div>

        {/* CARD */}
        <div style={styles.card}>

          <div>
            <p style={styles.label}>Имя</p>
            <input placeholder="Например: Алина" style={styles.input} />
          </div>

          <div>
            <p style={styles.label}>Город</p>
            <input placeholder="Например: Москва" style={styles.input} />
          </div>

          <div>
            <p style={styles.label}>О себе</p>
            <textarea
              placeholder="Расскажи немного о себе... ✨"
              style={styles.textarea}
            />
          </div>

        </div>

        {/* Интересы */}
        <div style={{ marginTop: 20 }}>
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
              <div
                onClick={() => setShowMore(true)}
                style={styles.tag}
              >
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

  content: {
    maxWidth: "400px",
    margin: "0 auto",
  },

  title: {
    textAlign: "center",
    fontSize: "22px",
    marginBottom: "20px",
  },

  avatarWrapper: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "20px",
    position: "relative",
  },

  avatar: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    background: "#333",
    border: "3px solid #a855f7",
    boxShadow: "0 0 25px rgba(168,85,247,0.6)",
  },

  camera: {
    position: "absolute",
    bottom: "0",
    right: "calc(50% - 60px)",
    background: "#222",
    borderRadius: "50%",
    padding: "8px",
  },

  card: {
    background: "rgba(255,255,255,0.05)",
    borderRadius: "20px",
    padding: "15px",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255,255,255,0.1)",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },

  label: {
    fontSize: "13px",
    color: "#aaa",
    marginBottom: "5px",
  },

  input: {
    width: "100%",
    background: "transparent",
    border: "none",
    borderBottom: "1px solid #333",
    color: "white",
    padding: "6px 0",
  },

  textarea: {
    width: "100%",
    background: "transparent",
    border: "none",
    borderBottom: "1px solid #333",
    color: "white",
    padding: "6px 0",
    resize: "none",
  },

  tags: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "10px",
  },

  tag: {
    padding: "8px 14px",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    fontSize: "13px",
    cursor: "pointer",
  },

  tagActive: {
    background: "linear-gradient(90deg,#7B2FF7,#F107A3)",
    boxShadow: "0 0 15px rgba(123,47,247,0.7)",
  },

  button: {
    marginTop: "30px",
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