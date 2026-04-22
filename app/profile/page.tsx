"use client";

import { useState } from "react";

export default function Profile() {
  const [age, setAge] = useState(22);
  const [gender, setGender] = useState("female");
  const [search, setSearch] = useState("female");

  const [selected, setSelected] = useState<string[]>([]);
  const [showMore, setShowMore] = useState(false);

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
            <input placeholder="Введите имя" style={styles.input} />
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
        <button style={styles.submit}>Продолжить</button>

      </div>
    </div>
  );
}