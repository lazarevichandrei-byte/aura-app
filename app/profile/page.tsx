"use client";

import { useState } from "react";

const interestsList = [
  "Путешествия",
  "Музыка",
  "Спорт",
  "Кино",
  "Фотография",
  "Игры",
  "Бизнес",
  "Технологии",
  "Еда",
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
    <main className="min-h-screen bg-[#0B0B0F] text-white px-5 py-8">

      <h1 className="text-2xl text-center mb-6 font-semibold">
        Создание профиля
      </h1>

      {/* Аватар */}
      <div className="flex justify-center mb-6">
        <div className="w-32 h-32 rounded-full border-4 border-purple-500 bg-gray-700" />
      </div>

      {/* Карточка */}
      <div className="p-5 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 space-y-5">

        <input
          placeholder="Имя"
          className="w-full bg-transparent outline-none"
        />

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

        <input
          placeholder="Город"
          className="w-full bg-transparent outline-none"
        />

        <textarea
          placeholder="О себе..."
          className="w-full bg-transparent outline-none"
        />

      </div>

      {/* Интересы */}
      <div className="mt-6">
        <p className="mb-3">Интересы</p>

        <div className="flex flex-wrap gap-2">
          {interestsList.map((item) => {
            const active = selected.includes(item);

            return (
              <button
                key={item}
                onClick={() => toggle(item)}
                className={`
                  px-4 py-2 rounded-full text-sm
                  ${
                    active
                      ? "bg-gradient-to-r from-purple-600 to-pink-500"
                      : "bg-white/5 border border-white/10"
                  }
                `}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      {/* КНОПКА */}
      <button
        className="
          mt-8
          w-full h-14 rounded-2xl
          text-white

          !bg-gradient-to-r
          !from-purple-600
          !to-pink-500

          shadow-[0_0_30px_rgba(123,47,247,0.8)]
        "
      >
        Продолжить
      </button>

    </main>
  );
}