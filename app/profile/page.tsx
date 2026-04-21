"use client";

export default function Profile() {
  return (
    <main className="h-screen bg-[#0B0B0F] text-white px-5 pt-10 flex flex-col">

      {/* Заголовок */}
      <h1 className="text-3xl font-bold mb-8">
        Создание профиля
      </h1>

      {/* Фото */}
      <div className="flex justify-center mb-8">
        <div className="
          w-32 h-32 rounded-3xl
          bg-[#1A1A22]
          flex items-center justify-center
          text-4xl
          shadow-[0_0_30px_rgba(123,47,247,0.2)]
        ">
          +
        </div>
      </div>

      {/* Поля */}
      <div className="space-y-4">

        <input
          placeholder="Имя"
          className="
            w-full p-4 rounded-2xl
            bg-[#1A1A22]
            border border-white/5
            focus:outline-none
            focus:border-purple-500
          "
        />

        <input
          placeholder="Возраст"
          className="
            w-full p-4 rounded-2xl
            bg-[#1A1A22]
            border border-white/5
            focus:outline-none
            focus:border-purple-500
          "
        />

        <textarea
          placeholder="О себе"
          rows={3}
          className="
            w-full p-4 rounded-2xl
            bg-[#1A1A22]
            border border-white/5
            focus:outline-none
            focus:border-purple-500
          "
        />

      </div>

      {/* Кнопка */}
      <button
        className="
          mt-auto mb-6
          h-14 rounded-2xl
          bg-gradient-to-r from-purple-600 to-pink-500
          shadow-[0_0_30px_rgba(123,47,247,0.7)]
          text-lg font-medium
          active:scale-95 transition
        "
      >
        Сохранить
      </button>

    </main>
  );
}