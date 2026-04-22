"use client";

import { useState } from "react";

export default function Profile() {
  const [age, setAge] = useState(22);
  const [selected, setSelected] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const interests = [
    "Путешествия",
    "Музыка",
    "Спорт",
    "Кино",
    "Фотография",
    "Игры",
    "Бизнес",
    "Еда",
    "Йога",
    "Авто",
  ];

  const toggle = (item: string) => {
    if (selected.includes(item)) {
      setSelected(selected.filter((i) => i !== item));
    } else {
      setSelected([...selected, item]);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>

        {/* HEADER */}
        <div style={styles.header}>
          <div style={styles.avatar}></div>

          <div>
            <h2 style={styles.title}>Создание профиля</h2>
            <p style={styles.subtitle}>
              Расскажи о себе, чтобы найти близких по духу 💙
            </p>
          </div>
        </div>

        {/* ИМЯ */}
        <div style={styles.block}>
          <p style={styles.label}>Имя</p>
          <input placeholder="Введите имя" style={styles.input} />
        </div>

        {/* ВОЗРАСТ */}
        <div style={styles.block}>
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

        {/* ГОРОД */}
        <div style={styles.block}>
          <p style={styles.label}>Город</p>
          <input placeholder="Введите город" style={styles.input} />
        </div>

        {/* О СЕБЕ */}
        <div style={styles.block}>
          <p style={styles.label}>О себе</p>
          <textarea
            placeholder="Расскажите о себе..."
            style={styles.textarea}
          />
        </div>

        {/* ИНТЕРЕСЫ */}
        <div style={styles.block}>
          <p style={styles.label}>Интересы</p>

          <div style={styles.tags}>
            {selected.map((item) => (
              <span key={item} style={styles.tagActive}>
                {item}
              </span>
            ))}

            <span style={styles.tagAdd} onClick={() => setOpen(true)}>
              +
            </span>
          </div>
        </div>

        {/* КНОПКА */}
        <button style={styles.submit}>
          Продолжить
        </button>

      </div>

      {/* МОДАЛКА */}
      {open && (
        <div style={styles.modalBg} onClick={() => setOpen(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>

            <h3 style={{ marginBottom: 12 }}>Выбери интересы</h3>

            <div style={styles.tags}>
              {interests.map((item) => (
                <span
                  key={item}
                  onClick={() => toggle(item)}
                  style={{
                    ...styles.tag,
                    ...(selected.includes(item) && styles.tagActive),
                  }}
                >
                  {item}
                </span>
              ))}
            </div>

            <button
              style={{ ...styles.submit, marginTop: 16 }}
              onClick={() => setOpen(false)}
            >
              Готово
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: any = {
  wrapper: {
    minHeight: "100vh",
    background: "#F5F7FB",
    padding: "20px",
    fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
  },

  card: {
    background: "#FFFFFF",
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

  avatar: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: "#E5E7EB",
  },

  title: {
    fontSize: "20px",
    fontWeight: "600",
  },

  subtitle: {
    fontSize: "14px",
    color: "#6B7280",
  },

  block: {
    marginBottom: "16px",
  },

  label: {
    fontSize: "12px",
    color: "#6B7280",
    marginBottom: "6px",
  },

  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "14px",
    border: "1px solid #E5E7EB",
    fontSize: "15px",
  },

  textarea: {
    width: "100%",
    padding: "12px",
    borderRadius: "14px",
    border: "1px solid #E5E7EB",
    fontSize: "15px",
    resize: "none",
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  age: {
    fontWeight: "600",
  },

  slider: {
    width: "100%",
    marginTop: "8px",
    accentColor: "#2A7BFF",
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
    cursor: "pointer",
  },

  tagActive: {
    padding: "8px 12px",
    borderRadius: "999px",
    background: "#2A7BFF",
    color: "#fff",
    fontSize: "14px",
  },

  tagAdd: {
    padding: "8px 12px",
    borderRadius: "999px",
    border: "1px dashed #9CA3AF",
    cursor: "pointer",
  },

  submit: {
    width: "100%",
    height: "56px",
    borderRadius: "16px",
    border: "none",
    color: "white",
    fontSize: "16px",
    fontWeight: "500",
    background: "linear-gradient(90deg,#2A7BFF,#1C5EFF)",
    boxShadow: "0 8px 20px rgba(42,123,255,0.3)",
  },

  modalBg: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  modal: {
    background: "#fff",
    padding: "20px",
    borderRadius: "20px",
    width: "90%",
    maxWidth: "400px",
  },
};