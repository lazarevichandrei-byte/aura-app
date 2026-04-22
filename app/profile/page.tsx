"use client";

import { useState, useEffect } from "react";

const interests = [
  "Путешествия",
  "Музыка",
  "Спорт",
  "Кино",
  "Фотография",
  "Игры",
  "Еда",
  "Технологии",
];

export default function Profile() {
  const [selected, setSelected] = useState<string[]>([]);
  const [age, setAge] = useState(22);

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp;

    if (tg) {
      tg.ready();
      tg.expand();
    }
  }, []);

  const toggle = (item: string) => {
    if (selected.includes(item)) {
      setSelected(selected.filter((i) => i !== item));
    } else {
      setSelected([...selected, item]);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "20px",
        paddingBottom: "120px",
        background: "#0B0B0F",
        color: "white",
      }}
    >
      {/* 🔥 Заголовок */}
      <h1
        style={{
          fontSize: "24px",
          textAlign: "center",
          marginBottom: "20px",
        }}
      >
        Создание профиля
      </h1>

      {/* 📸 Фото */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
        <div
          style={{
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            background: "#1A1A22",
            border: "3px solid #7B2FF7",
          }}
        />
      </div>

      {/* 🔥 КАРТОЧКА */}
      <div
        style={{
          background: "#15151C",
          borderRadius: "20px",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "15px",
        }}
      >
        {/* Имя */}
        <input
          placeholder="Имя"
          style={{
            background: "#1F1F27",
            border: "none",
            borderRadius: "12px",
            padding: "12px",
            color: "white",
          }}
        />

        {/* Возраст */}
        <div>
          <p style={{ color: "#aaa", marginBottom: "5px" }}>
            Возраст: {age}
          </p>
          <input
            type="range"
            min="18"
            max="60"
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            style={{ width: "100%" }}
          />
        </div>

        {/* Город */}
        <input
          placeholder="Город"
          style={{
            background: "#1F1F27",
            border: "none",
            borderRadius: "12px",
            padding: "12px",
            color: "white",
          }}
        />

        {/* О себе */}
        <textarea
          placeholder="О себе"
          rows={3}
          style={{
            background: "#1F1F27",
            border: "none",
            borderRadius: "12px",
            padding: "12px",
            color: "white",
            resize: "none",
          }}
        />
      </div>

      {/* 🔥 ИНТЕРЕСЫ */}
      <div style={{ marginTop: "25px" }}>
        <p style={{ marginBottom: "10px", color: "#aaa" }}>
          Интересы
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {interests.map((item) => {
            const active = selected.includes(item);

            return (
              <button
                key={item}
                onClick={() => toggle(item)}
                style={{
                  padding: "8px 14px",
                  borderRadius: "20px",
                  border: "none",
                  fontSize: "14px",
                  background: active
                    ? "linear-gradient(90deg, #7B2FF7, #F107A3)"
                    : "#1F1F27",
                  color: "white",
                }}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      {/* 🔥 КНОПКА СНИЗУ */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          padding: "15px",
          background: "linear-gradient(to top, #0B0B0F, transparent)",
        }}
      >
        <button
          style={{
            width: "100%",
            height: "55px",
            borderRadius: "16px",
            border: "none",
            fontSize: "16px",
            fontWeight: "600",
            background: "linear-gradient(90deg, #7B2FF7, #F107A3)",
            color: "white",
          }}
        >
          Продолжить
        </button>
      </div>
    </main>
  );
}