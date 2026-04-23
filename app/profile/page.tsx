"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";

export default function Profile() {
  const router = useRouter();

  const [age, setAge] = useState(22);
  const [gender, setGender] = useState("female");
  const [search, setSearch] = useState("female");

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");

  const [selected, setSelected] = useState<string[]>([]);

  const interests = ["Путешествия","Музыка","Спорт","Кино"];

  useEffect(() => {
    const load = async () => {
      const tg = (window as any).Telegram?.WebApp;
      const user = tg?.initDataUnsafe?.user;

      if (!user) return;

      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("telegram_id", user.id)
        .single();

      if (data) {
        setName(data.name || "");
        setAge(data.age || 22);
        setGender(data.gender || "female");
        setSearch(data.looking || "female");
        setCity(data.city || "");
        setBio(data.bio || "");
        setSelected(data.interests || []);
      } else {
        setName(user.first_name || "");
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
    const tg = (window as any).Telegram?.WebApp;
    const userId = tg?.initDataUnsafe?.user?.id ?? null;

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

    if (!error) router.push("/home");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Профиль</h2>

      <input value={name} onChange={(e) => setName(e.target.value)} />

      <p>Возраст: {age}</p>
      <input
        type="range"
        min="18"
        max="60"
        value={age}
        onChange={(e) => setAge(Number(e.target.value))}
      />

      <div>
        <button onClick={() => setGender("female")}>Женщина</button>
        <button onClick={() => setGender("male")}>Мужчина</button>
      </div>

      <div>
        <button onClick={() => setSearch("male")}>Парня</button>
        <button onClick={() => setSearch("female")}>Девушку</button>
        <button onClick={() => setSearch("any")}>Любого</button>
      </div>

      <input
        placeholder="Город"
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />

      <textarea
        placeholder="О себе"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
      />

      <div>
        {interests.map((i) => (
          <span key={i} onClick={() => toggle(i)}>
            {i}
          </span>
        ))}
      </div>

      <button onClick={handleSubmit}>Сохранить</button>
    </div>
  );
}