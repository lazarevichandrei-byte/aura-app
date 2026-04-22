"use client";

import { useState } from "react";

const interests = [
  "Путешествия",
  "Музыка",
  "Спорт",
  "Кино",
  "Фотография",
];

export default function Profile() {
  const [age, setAge] = useState(22);
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (item: string) => {
    setSelected((prev) =>
      prev.includes(item)
        ? prev.filter((i) => i !== item)
        : [...prev, item]
    );
  };

  return (
    <main className="min-h-screen bg-[#0B0B0F] text-white px-5 py-8">

      <h1 className="text-2xl text-center mb-6">
        Создание профиля
      </h1>

      <div className="p-5 rounded-3xl bg-white/5 border border-white/10 space-y-5">

        <input placeholder="Имя" className="w-full bg-transparent outline-none" />

        <div>
          <p>Возраст: {age}</p>
          <input
            type="range"
            min="18"
            max="60"
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            className="w-full accent-purple-500"
          />
        </div>

        <input placeholder="Город" className="w-full bg-transparent outline-none" />

        <textarea placeholder="О себе..." className="w-full bg-transparent outline-none" />

      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {interests.map((item) => {
          const active = selected.includes(item);

          return (
            <button
              key={item}
              onClick={() => toggle(item)}
              className={`px-4 py-2 rounded-full ${
                active
                  ? "bg-purple-600"
                  : "bg-white/10"
              }`}
            >
              {item}
            </button>
          );
        })}
      </div>

      <button className="mt-8 w-full h-14 rounded-2xl bg-purple-600">
        Продолжить
      </button>

    </main>
  );
}