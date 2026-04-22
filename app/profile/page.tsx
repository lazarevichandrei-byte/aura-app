"use client";

import { useState } from "react";

const baseInterests = [
  "Путешествия",
  "Музыка",
  "Спорт",
  "Кино",
  "Фотография",
];

const extraInterests = [
  "Игры",
  "Бизнес",
  "Технологии",
  "Еда",
  "Искусство",
  "Йога",
  "Авто",
  "Книги",
];

export default function Profile() {
  const [selected, setSelected] = useState<string[]>([]);
  const [age, setAge] = useState(22);
  const [showMore, setShowMore] = useState(false);

  const toggleInterest = (item: string) => {
    if (selected.includes(item)) {
      setSelected(selected.filter((i) => i !== item));
    } else {
      setSelected([...selected, item]);
    }
  };

  return (
    <main className="relative min-h-screen overflow-y-auto text-white px-5 pt-10 pb-32">

      {/* ФОН */}
      <div className="absolute inset-0 -z-10 bg-[#0B0B0F]" />

      {/* Glow */}
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
          <div className="w-32 h-32 rounded-full border-4 border-purple-500 shadow-[0_0_25px_rgba(123,47,247,0.6)] bg-gray-700" />
          <div className="absolute bottom-0 right-0 bg-white/10 backdrop-blur-md p-2 rounded-full border border-white/20">
            📷
          </div>
        </div>
      </div>

      {/* КАРТОЧКА */}
      <div className="p-5 rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 space-y-5">

        <div>
          <p className="text-sm text-gray-400 mb-1">Имя</p>
          <input
            placeholder="Например: Алина"
            className="w-full bg-transparent outline-none text-white placeholder-gray-500"
          />
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
          <input
            placeholder="Например: Москва"
            className="w-full bg-transparent outline-none text-white placeholder-gray-500"
          />
        </div>

        <div>
          <p className="text-sm text-gray-400 mb-1">О себе</p>
          <textarea
            rows={3}
            placeholder="Расскажи немного о себе... ✨"
            className="w-full bg-transparent outline-none text-white placeholder-gray-500 resize-none"
          />
        </div>
      </div>

      {/* ИНТЕРЕСЫ */}
      <div className="mt-6">
        <p className="mb-3 text-gray-400">Интересы</p>

        <div className="flex flex-wrap gap-3">
          {[...baseInterests, ...(showMore ? extraInterests : [])].map((item) => {
            const active = selected.includes(item);

            return (
              <button
                key={item}
                onClick={() => toggleInterest(item)}
                className={`px-4 py-2 rounded-full text-sm transition ${
                  active
                    ? "bg-gradient-to-r from-purple-600 to-pink-500 shadow-[0_0_15px_rgba(123,47,247,0.6)]"
                    : "bg-white/5 border border-white/10 text-gray-300"
                }`}
              >
                {item}
              </button>
            );
          })}

          {!showMore && (
            <button
              onClick={() => setShowMore(true)}
              className="px-4 py-2 rounded-full bg-white/5 border border-white/10"
            >
              +
            </button>
          )}
        </div>
      </div>

      {/* КНОПКА */}
      <div className="fixed bottom-0 left-0 w-full px-5 pb-6 bg-gradient-to-t from-black via-black/80 to-transparent">
        <button
          className="w-full h-14 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 shadow-[0_0_30px_rgba(123,47,247,0.7)] text-lg font-medium active:scale-95 transition"
        >
          Продолжить
        </button>
      </div>

    </main>
  );
}