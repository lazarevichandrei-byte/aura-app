"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";

export default function Profile() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [age, setAge] = useState(22);
  const [gender, setGender] = useState<"male" | "female">("female");
  const [search, setSearch] = useState<"male" | "female" | "any">("female");

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");

  const [selected, setSelected] = useState<string[]>([]);

  const interests = ["Путешествия", "Музыка", "Спорт", "Кино"];

  useEffect(() => {
    const load = async () => {
      try {
        const tg = (window as any)?.Telegram?.WebApp;
        const user = tg?.initDataUnsafe?.user;

        if (!user) {
          setLoading(false);
          return;
        }

        const { data } = await supabase
          .from("users")
          .select("*")
          .eq("telegram_id", user.id)
          .maybeSingle();

        if (data) {
          setName(data.name ?? "");
          setAge(data.age ?? 22);
          setGender(data.gender ?? "female");
          setSearch(data.looking ?? "female");
          setCity(data.city ?? "");
          setBio(data.bio ?? "");
          setSelected(data.interests ?? []);
        } else {
          setName(user.first_name ?? "");
        }
      } catch (e) {
        console.error("LOAD PROFILE ERROR:", e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const toggle = (item: string) => {
    setSelected((prev) =>
      prev.includes(item)
        ? prev.filter((i) => i !== item)
        : [...prev, item]
    );
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;

    setSaving(true);

    try {
      const tg = (window as any)?.Telegram?.WebApp;
      const userId = tg?.initDataUnsafe?.user?.id;

      if (!userId) return;

      const { error } = await supabase
        .from("users")
        .upsert(
          [
            {
              telegram_id: userId,
              name,
              age,
              gender,
              looking: search,
              city,
              bio,
              interests: selected,
            },
          ],
          { onConflict: "telegram_id" }
        );

      if (!error) {
        router.replace("/home");
      } else {
        console.error("SAVE ERROR:", error);
      }
    } catch (e) {
      console.error("SUBMIT ERROR:", e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p>Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-4 py-6">
      <div className="max-w-md mx-auto space-y-6">
        
        <h2 className="text-2xl font-bold">Профиль</h2>

        {/* NAME */}
        <input
          className="w-full p-3 rounded-xl border"
          placeholder="Имя"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* AGE */}
        <div>
          <p className="mb-2">Возраст: {age}</p>
          <input
            type="range"
            min="18"
            max="60"
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            className="w-full"
          />
        </div>

        {/* GENDER */}
        <div>
          <p className="mb-2">Я:</p>
          <div className="flex gap-2">
            <button
              onClick={() => setGender("female")}
              className={`flex-1 p-3 rounded-xl ${
                gender === "female"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100"
              }`}
            >
              Женщина
            </button>
            <button
              onClick={() => setGender("male")}
              className={`flex-1 p-3 rounded-xl ${
                gender === "male"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100"
              }`}
            >
              Мужчина
            </button>
          </div>
        </div>

        {/* SEARCH */}
        <div>
          <p className="mb-2">Ищу:</p>
          <div className="flex gap-2">
            {["male", "female", "any"].map((item) => (
              <button
                key={item}
                onClick={() => setSearch(item as any)}
                className={`flex-1 p-3 rounded-xl ${
                  search === item
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100"
                }`}
              >
                {item === "male"
                  ? "Парня"
                  : item === "female"
                  ? "Девушку"
                  : "Любого"}
              </button>
            ))}
          </div>
        </div>

        {/* CITY */}
        <input
          className="w-full p-3 rounded-xl border"
          placeholder="Город"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />

        {/* BIO */}
        <textarea
          className="w-full p-3 rounded-xl border"
          placeholder="О себе"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />

        {/* INTERESTS */}
        <div>
          <p className="mb-2">Интересы:</p>
          <div className="flex flex-wrap gap-2">
            {interests.map((i) => (
              <button
                key={i}
                onClick={() => toggle(i)}
                className={`px-3 py-2 rounded-full text-sm ${
                  selected.includes(i)
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100"
                }`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>

        {/* SAVE */}
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="w-full p-4 rounded-xl bg-blue-500 text-white font-semibold"
        >
          {saving ? "Сохранение..." : "Сохранить"}
        </button>
      </div>
    </div>
  );
}