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
  const [selected, setSelected] = useState<string[]>([]);
  const [age, setAge] = useState(22);

  const toggle = (item: string) => {
    setSelected((prev) =>
      prev.includes(item)
        ? prev.filter((i) => i !== item)
        : [...prev, item]
    );
  };

  return (
    <main className="relative min-h-screen text-white px-5 pt-10 pb-32 overflow-y-auto bg-[#0B0B0F]">

      {/* 🔥 Glow (как вчера) */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-purple-600 opacity-20 blur-[120px] rounded-full" />
      </div>

      {/* Заголовок */}
      <h1 className="text-2xl font-semibold text-center mb-6">
        Создание профиля
      </h1>

      {/* Фото */}
      <div className="flex justify-center mb-6">
        <div className="w-32 h-32 rounded-full border-4 border-purple-500 shadow-[0_0_25px_rgba(123,47,247,0.6)] bg-gray-700" />
      </div>

      {/* КАРТОЧКА */}
      <div className="bg-[#15151c] border border-white/10 rounded-3xl p-5 space-y-5">

        <div>
          <p className="text-sm text-gray-400 mb-1">Имя</p>
          <input className="w-full bg-transparent outline-none text-white" />
        </div>

        <div>
          <p className="text-sm text-gray-400 mb-1">Возраст: {age}</p>
          <input
            type="range"
            min="18"
            max="60"
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            className="w-full accent-purple-500"
          />
        </div>

        <div>
          <p className="text-sm text-gray-400 mb-1">Город</p>
          <input className="w-full bg-transparent outline-none text-white" />
        </div>

        <div>
          <p className="text-sm text-gray-400 mb-1">О себе</p>
          <textarea
            rows={3}
            className="w-full bg-transparent outline-none text-white"
          />
        </div>

      </div>

      {/* Интересы */}
      <div className="mt-6">
        <p className="text-gray-400 mb-3">Интересы</p>

        <div className="flex flex-wrap gap-3">
          {interests.map((item) => {
            const active = selected.includes(item);

            return (
              <button
                key={item}
                onClick={() => toggle(item)}
                className={`px-4 py-2 rounded-full text-sm ${
                  active
                    ? "bg-purple-600 shadow-[0_0_15px_rgba(123,47,247,0.6)]"
                    : "bg-[#1c1c24] border border-white/10 text-gray-300"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      {/* КНОПКА */}
      <div className="fixed bottom-0 left-0 w-full px-5 pb-6 bg-gradient-to-t from-black via-black/80 to-transparent">
        <button className="w-full h-14 rounded-2xl bg-purple-600 shadow-[0_0_30px_rgba(123,47,247,0.7)] text-lg">
          Продолжить
        </button>
      </div>

    </main>
  );
}