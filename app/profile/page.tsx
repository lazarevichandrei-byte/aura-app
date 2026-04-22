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
    <main className="relative min-h-screen px-5 pt-10 pb-32 text-white overflow-y-auto">

      {/* 🔥 ФОН */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#0B0B0F] via-[#120F1F] to-[#0B0B0F]" />

      {/* glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-purple-600 opacity-20 blur-[120px] rounded-full" />
      </div>

      {/* title */}
      <h1 className="text-2xl font-semibold text-center mb-6">
        Создание профиля
      </h1>

      {/* avatar */}
      <div className="flex justify-center mb-6">
        <div className="w-32 h-32 rounded-full border-4 border-purple-500 shadow-[0_0_25px_rgba(123,47,247,0.6)] bg-gray-700" />
      </div>

      {/* card */}
      <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 space-y-5">

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

      {/* interests */}
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
                    ? "bg-gradient-to-r from-purple-600 to-pink-500 shadow-[0_0_15px_rgba(123,47,247,0.6)]"
                    : "bg-white/5 border border-white/10 text-gray-300"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      {/* button */}
      <div className="fixed bottom-0 left-0 w-full px-5 pb-6 bg-gradient-to-t from-[#0B0B0F] via-[#0B0B0F]/80 to-transparent">
        <button className="w-full h-14 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 shadow-[0_0_30px_rgba(123,47,247,0.7)] text-lg">
          Продолжить
        </button>
      </div>

    </main>
  );
}