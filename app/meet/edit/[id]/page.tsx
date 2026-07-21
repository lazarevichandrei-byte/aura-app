"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getMeetEvent,
  updateMeetEvent,
} from "../../../../lib/meet/api";

export default function EditMeetPage() {
  const { id } = useParams();

  const router = useRouter();

const [loading, setLoading] = useState(true);

const [title, setTitle] = useState("");
const [description, setDescription] = useState("");
const [category, setCategory] = useState("");
const [city, setCity] = useState("");
const [place, setPlace] = useState("");
const [startsAt, setStartsAt] = useState("");
const [maxPeople, setMaxPeople] = useState(2);

useEffect(() => {
  load();
}, []);

async function load() {
  const event = await getMeetEvent(id as string);

  setTitle(event.title);
  setDescription(event.description);
  setCategory(event.category);
  setCity(event.city);
  setPlace(event.place);
  setStartsAt(event.starts_at);
  setMaxPeople(event.max_people);

  setLoading(false);
}

async function handleSave() {
  try {
    await updateMeetEvent(id as string, {
      title,
      description,
      category,
      city,
      place,
      starts_at: startsAt,
      max_people: maxPeople,
    });

    router.back();
  } catch (error) {
    console.error(error);
    alert("Не удалось сохранить изменения.");
  }
}

const inputStyle = {
  width: "100%",
  height: 52,
  borderRadius: 14,
  border: "1px solid #E5E7EB",
  padding: "0 16px",
  fontSize: 16,
  background: "#fff",
  boxSizing: "border-box" as const,
};

if (loading) {
  return (
    <div
      style={{
        padding: 40,
      }}
    >
      Загрузка...
    </div>
  );
}

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F5F7FB",
        padding: 24,
      }}
    >
      <h1>✏️ Редактирование встречи</h1>

      <div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: 18,
    marginTop: 24,
  }}
>
  <div>
    <div style={{ fontWeight: 600, marginBottom: 8 }}>
      Название
    </div>

    <input
      value={title}
      onChange={(e) => setTitle(e.target.value)}
      style={inputStyle}
    />
  </div>

  <div>
    <div style={{ fontWeight: 600, marginBottom: 8 }}>
      Описание
    </div>

    <textarea
      value={description}
      onChange={(e) => setDescription(e.target.value)}
      style={{
        ...inputStyle,
        height: 120,
        paddingTop: 14,
        resize: "none",
      }}
    />
  </div>

  <div>
    <div style={{ fontWeight: 600, marginBottom: 8 }}>
      Город
    </div>

    <input
      value={city}
      onChange={(e) => setCity(e.target.value)}
      style={inputStyle}
    />
  </div>

  <div>
    <div style={{ fontWeight: 600, marginBottom: 8 }}>
      Место
    </div>

    <input
      value={place}
      onChange={(e) => setPlace(e.target.value)}
      style={inputStyle}
    />
  </div>

  <div>
    <div style={{ fontWeight: 600, marginBottom: 8 }}>
      Максимум участников
    </div>

    <input
      type="number"
      value={maxPeople}
      onChange={(e) =>
        setMaxPeople(Number(e.target.value))
      }
      style={inputStyle}
    />
  </div>

  <button
    onClick={handleSave}
    style={{
      marginTop: 32,
      width: "100%",
      height: 52,
      border: "none",
      borderRadius: 14,
      background: "#7C3AED",
      color: "#fff",
      fontSize: 16,
      fontWeight: 600,
      cursor: "pointer",
    }}
  >
    💾 Сохранить изменения
  </button>
</div>
    </div>
  );
}