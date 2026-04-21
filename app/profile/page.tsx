"use client";

import { useState } from "react";

const interestsList = [
  "Путешествия",
  "Музыка",
  "Спорт",
  "Кино",
  "Фотография",
];

export default function Profile() {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleInterest = (item: string) => {
    if (selected.includes(item)) {
      setSelected(selected.filter((i) => i !== item));
    } else {
      setSelected([...selected, item]);
    }
  };

  return (
    <main className="relative h-screen overflow-hidden text-white flex flex-col px-5 pt-10
      bg-gradient-to-b from-[#0B0B0F] via-[#120F1F] to-[#0B0B0F]">

      {/* 🔥 Фиолетовое свечение */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-purple-600 opacity-20 blur-[120px] rounded-full" />
      </div>

      {/* Заголовок */}
      <h1 className="text-2xl font-semibold mb-6 text-center">
        Создание профиля
      </h1>

      {/* Фото */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <div className="w-32 h-32 rounded-full border-4 border-purple-500 overflow-hidden shadow-[0_0_25px_rgba(123,47,247,0.6)]">
            <div className="w-full h-full bg-gray-700" />
          </div>

          <div className="absolute bottom-0 right-0 bg-white/10 backdrop-blur-md p-2 rounded-full border border-white/20">
            📷
          </div>
        </div>
      </div>

      {/* Поля */}
      <div className="space-y-4">

        <input
          placeholder="Имя"
          className="w-full p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 placeholder-gray-400"
        />

        <input
          placeholder="Возраст"
          className="w-full p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 placeholder-gray-400"
        />

        <input
          placeholder="Город"
          className="w-full p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 placeholder-gray-400"
        />

        <textarea
          placeholder="О себе"
          rows={3}
          className="w-full p-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 placeholder-gray-400"
        />

      </div>

      {/* Интересы */}
      <div className="mt-6">
        <p className="mb-3 text-gray-400">Интересы</p>

        <div className="flex flex-wrap gap-3">
          {interestsList.map((item) => {
            const active = selected.includes(item);

            return (
              <button
                key={item}
                onClick={() => toggleInterest(item)}
                className={`
                  px-4 py-2 rounded-full text-sm transition
                  ${
                    active
                      ? "bg-gradient-to-r from-purple-600 to-pink-500 shadow-[0_0_15px_rgba(123,47,247,0.6)]"
                      : "bg-white/5 backdrop-blur-md border border-white/10 text-gray-300"
                  }
                `}
              >
                {item}
              </button>
            );
          })}

          {/* + кнопка */}
          <button className="px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10">
            +
          </button>
        </div>
      </div>

      {/* Кнопка */}
      <button
        className="
          mt-auto mb-6 h-14 rounded-2xl
          bg-gradient-to-r from-purple-600 to-pink-500
          shadow-[0_0_30px_rgba(123,47,247,0.7)]
          text-lg font-medium
          active:scale-95 transition
        "
      >
        Продолжить
      </button>

    </main>
  );
}