"use client";

import { useState } from "react";

export default function Profile() {
  const [age, setAge] = useState(22);

  return (
    <main className="min-h-screen text-white flex items-center justify-center bg-black">
      <div className="text-center">
        <h1 className="text-2xl mb-4">Проверка</h1>

        <p>Возраст: {age}</p>

        <input
          type="range"
          min="18"
          max="60"
          value={age}
          onChange={(e) => setAge(Number(e.target.value))}
        />

        <button className="block mt-4 px-4 py-2 bg-purple-500 rounded">
          OK
        </button>
      </div>
    </main>
  );
}