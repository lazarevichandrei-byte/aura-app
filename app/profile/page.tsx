export default function Profile() {
  return (
    <main className="h-screen bg-[#0B0B0F] text-white p-5 flex flex-col">

      <h1 className="text-2xl font-bold mb-6">
        Создание профиля
      </h1>

      {/* Фото */}
      <div className="w-32 h-32 bg-gray-800 rounded-2xl mb-6 flex items-center justify-center">
        +
      </div>

      {/* Имя */}
      <input
        placeholder="Имя"
        className="mb-4 p-3 rounded-xl bg-[#1A1A22] outline-none"
      />

      {/* Возраст */}
      <input
        placeholder="Возраст"
        className="mb-4 p-3 rounded-xl bg-[#1A1A22] outline-none"
      />

      {/* О себе */}
      <textarea
        placeholder="О себе"
        className="mb-6 p-3 rounded-xl bg-[#1A1A22] outline-none"
      />

      <button className="mt-auto h-14 rounded-xl 
        bg-gradient-to-r from-purple-600 to-pink-500 
        shadow-[0_0_20px_rgba(123,47,247,0.6)]">
        Сохранить
      </button>

    </main>
  );
}