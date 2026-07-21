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
    marginTop: 24,
  }}
>
  <div
    style={{
      fontWeight: 600,
      marginBottom: 8,
    }}
  >
    Название встречи
  </div>

  <input
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    style={{
      width: "100%",
      height: 52,
      borderRadius: 14,
      border: "1px solid #E5E7EB",
      padding: "0 16px",
      fontSize: 16,
      boxSizing: "border-box",
      background: "#fff",
    }}
  />
</div>
    </div>
  );
}