"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft2 } from "iconsax-react";
import { motion } from "motion/react";

import PageWrapper from "../../../../components/PageWrapper";
import AuraLoader from "../../../../components/AuraLoader";
import {
  getMeetEvent,
  updateMeetEvent,
  deleteMeetEvent,
} from "../../../../lib/meet/api";
import LocationCard from "../../../../components/meet/LocationCard";
import PeopleSelector from "../../../../components/meet/PeopleSelector";

export default function EditMeetPage() {
  const { id } = useParams();

  const router = useRouter();

const [loading, setLoading] = useState(true);

const [title, setTitle] = useState("");
const [description, setDescription] = useState("");
const [category, setCategory] = useState("");
const [city, setCity] = useState("");
const [place, setPlace] = useState("");

const [latitude, setLatitude] =
  useState<number | null>(null);

const [longitude, setLongitude] =
  useState<number | null>(null);

const [startsAt, setStartsAt] = useState("");

const [maxPeople, setMaxPeople] = useState(1);

const restoredLocation = useRef(false);

useEffect(() => {
  load();
}, []);

useEffect(() => {
  function restoreLocation() {
  const raw = sessionStorage.getItem("meet_location");

  
  if (!raw) return;

    try {
      const data = JSON.parse(raw);

restoredLocation.current = true;

setPlace(data.title || "");
setCity(data.address || "");
setLatitude(data.lat ?? null);
setLongitude(data.lng ?? null);

      sessionStorage.removeItem("meet_location");
    } catch {
      sessionStorage.removeItem("meet_location");
    }
  }

  restoreLocation();

  window.addEventListener("pageshow", restoreLocation);

  return () => {
    window.removeEventListener("pageshow", restoreLocation);
  };
}, []);

async function load() {
  
  const event = await getMeetEvent(id as string);

    setTitle(event.title);
  setDescription(event.description);
  setCategory(event.category);
  if (!restoredLocation.current) {
  setCity(event.city);
  setPlace(event.place);
  setLatitude(event.latitude);
  setLongitude(event.longitude);
}
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
  latitude,
  longitude,
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
    <PageWrapper>
      <AuraLoader
        fullscreen
        text="Загрузка встречи..."
      />
    </PageWrapper>
  );
}



  return (
<PageWrapper>

    <div
      style={{
        minHeight: "100vh",
        background: "#F5F7FB",
        padding: 24,
      }}
    >
      <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.22 }}
    style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 14,
        marginBottom: 24,
    }}
>
    <motion.div
        onClick={() => router.back()}
        whileTap={{ scale: 0.92 }}
        transition={{ duration: 0.15 }}
        style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            paddingRight: 10,
            cursor: "pointer",
            flexShrink: 0,
        }}
    >
        <ArrowLeft2
            size="28"
            color="#2E7BFF"
            variant="Outline"
        />
    </motion.div>

    <div>
        <div
            style={{
                fontSize: 24,
                fontWeight: 700,
                color: "#111827",
            }}
        >
            Редактирование
        </div>

        <div
            style={{
                marginTop: 4,
                fontSize: 13,
                color: "#7B8595",
            }}
        >
            Измените данные встречи
        </div>
    </div>
</motion.div>

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
    📍 Где встречаемся
  </div>

  <LocationCard
    place={place}
    city={city}
    onMapClick={() => {
  router.push("/meet/location");
}}
    onCurrentLocationClick={() => {
      if (!navigator.geolocation) {
        alert("Геолокация не поддерживается");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);

          setPlace("Моё местоположение");
          setCity("Определяется...");
        },
        () => {
          alert("Не удалось получить геолокацию");
        }
      );
    }}
  />
</div>

  <div>
  <div style={{ fontWeight: 600, marginBottom: 8 }}>
    Максимум участников
  </div>

  <PeopleSelector
    value={maxPeople}
    onChange={setMaxPeople}
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
     background: "linear-gradient(135deg,#2F80FF,#56CCF2)",
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

</PageWrapper>
  );
}