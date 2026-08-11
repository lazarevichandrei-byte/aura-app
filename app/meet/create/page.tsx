"use client";

import {
  useState,
  useEffect
} from "react";
import {
  useRouter,
  useSearchParams
} from "next/navigation";
import PageWrapper from "../../../components/PageWrapper";
import PageHeader from "../../../components/PageHeader";
import { MEET_CATEGORIES } from "../../../lib/meet/categories";
import PeopleSelector from "../../../components/meet/PeopleSelector";
import LocationCard from "../../../components/meet/LocationCard";
import CategoryPicker from "../../../components/meet/CategoryPicker";
import CategoryBottomSheet from "../../../components/meet/CategoryBottomSheet";
import { useNotification } from "../../../components/NotificationContext";
import { localMeetDateTimeToIso, localToday } from "../../../lib/meet/time";
import { getTelegramInitData } from "../../../lib/telegram-init-data";
export default function CreateMeetPage() {
    

  const router = useRouter();
  const { error: showError, success } = useNotification();
  

  const [title,setTitle] =
useState("");

const [description,setDescription] =
useState("");

const [place,setPlace] =
useState("");

const [latitude,setLatitude] =
useState<number | null>(null);

const [longitude,setLongitude] =
useState<number | null>(null);

const [city,setCity] =
useState("");

const [date,setDate] =
useState("");

const [time,setTime] =
useState("");

const [maxPeople,setMaxPeople] =
useState(1);

const [duration, setDuration] = useState<
  "30m" | "1h" | "2h" | "day"
>("1h");

const [joinType, setJoinType] = useState<
  "open" | "approval"
>("open");

const [loading,setLoading] =
useState(false);

  const [category,setCategory] = useState("coffee");

  const [categorySheetOpen, setCategorySheetOpen] =
useState(false);

useEffect(() => {
  const raw = sessionStorage.getItem("meet_draft");

  if (!raw) return;

  try {
    const draft = JSON.parse(raw);

    setTitle(draft.title ?? "");
    setDescription(draft.description ?? "");
    setCategory(draft.category ?? "coffee");
    setDate(draft.date ?? "");
    setTime(draft.time ?? "");
    setMaxPeople(draft.maxPeople ?? 1);
    setDuration(
  (draft.duration as "30m" | "1h" | "2h" | "day") ?? "1h"
);

setJoinType(
  (draft.joinType as "open" | "approval") ?? "open"
);
  } catch {}
}, []);

useEffect(() => {
  sessionStorage.setItem(
    "meet_draft",
    JSON.stringify({
  title,
  description,
  category,
  date,
  time,
  maxPeople,
  duration,
  joinType,
})
  );
}, 
[
  title,
  description,
  category,
  date,
  time,
  maxPeople,
  duration,
  joinType,
]
);

useEffect(() => {
  const raw = sessionStorage.getItem("meet_location");



  if (!raw) return;

  try {

    const data = JSON.parse(raw);

    setPlace(data.title || "");
    setCity(data.city || data.address || "");
    setLatitude(data.lat ?? null);
    setLongitude(data.lng ?? null);

    sessionStorage.removeItem("meet_location");

  } catch {

    sessionStorage.removeItem("meet_location");

  }

}, []);

  

  async function createMeet(){

  if(loading) return;

  if(!title || !date || !time){
    showError("Заполните данные", "Укажите дату и время встречи.");
    return;
  }

  const startsAt = localMeetDateTimeToIso(date, time);
  if (!startsAt) {
    showError("Некорректная дата", "Проверьте дату и время встречи.");
    return;
  }
  if (new Date(startsAt).getTime() <= Date.now()) {
    showError("Время уже прошло", "Выберите время позже текущего.");
    return;
  }

  setLoading(true);

  try{

    const initData = await getTelegramInitData();
    if (!initData) throw new Error("Не удалось подтвердить пользователя Telegram");
    let eventId = sessionStorage.getItem("meet_create_event_id");
    if (!eventId) {
      eventId = crypto.randomUUID();
      sessionStorage.setItem("meet_create_event_id", eventId);
    }

    const response = await fetch("/api/meet/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        initData,
        eventId,
        values: {
      title,
      description,
      category,
      city,
      place,
      latitude,
      longitude,
      starts_at: startsAt,
      duration,
      join_type: joinType,
      max_people: maxPeople,
        },
      }),
    });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.message || "Не удалось создать встречу. Попробуйте ещё раз.");

    sessionStorage.removeItem("meet_draft");
sessionStorage.removeItem("meet_location");
sessionStorage.removeItem("meet_create_event_id");
success("Встреча создана", "Общий чат встречи готов.");

router.replace("/meet");

  } catch (err: any) {

  console.error("CREATE MEET ERROR:", err);
  console.error("CREATE MEET ERROR MESSAGE:", err?.message);
  console.error("CREATE MEET ERROR DETAILS:", err?.details);
  console.error("CREATE MEET ERROR HINT:", err?.hint);
  console.error("CREATE MEET ERROR CODE:", err?.code);

  showError(
    "Ошибка создания",
    err?.message || "Неизвестная ошибка"
  );

} finally {
  setLoading(false);

}

}

const DURATION_OPTIONS = [
  { id: "30m", label: "30 минут" },
  { id: "1h", label: "1 час" },
  { id: "2h", label: "2 часа" },
  { id: "day", label: "До конца дня" },
] as const;

  return (

    <PageWrapper>

      <div
        style={{
          minHeight:"100vh",
          background:"#F5F7FB",
          padding:"20px",
          paddingBottom:"120px"
        }}
      >

        <PageHeader title="Создать встречу" onBack={() => router.back()} />

        {/* Название встречи */}

        <div style={labelStyle}>
          Название встречи
        </div>

        <input
value={title}
onChange={(e)=>
setTitle(e.target.value)
}
placeholder="Например: Вечерний кофе ☕"
style={inputStyle}
/>

        {/* Категория */}

<div
  style={{
    ...labelStyle,
    marginTop: 16,
  }}
>
  Категория
</div>

<CategoryPicker
  value={
    MEET_CATEGORIES.find(
      item => item.id === category
    ) ?? null
  }
  onClick={() => setCategorySheetOpen(true)}
/>

<CategoryBottomSheet
  open={categorySheetOpen}
  onClose={() => setCategorySheetOpen(false)}
  value={category}
  onSelect={(id) => {
    setCategory(id);
    setCategorySheetOpen(false);
  }}
/>

{/* О встрече */}

        <div
          style={{
            ...labelStyle,
            marginTop:16
          }}
        >
          О встрече
        </div>

        <textarea

value={description}

onChange={(e)=>
setDescription(e.target.value)
}

placeholder={`Например:
Выпьем кофе,погуляем
и познакомимся ☕`}

style={{
...inputStyle,
minHeight:90,
resize:"none",
paddingTop:14
}}
/>

        

        <div
style={{
display:"flex",
gap:12,
marginTop:16
}}
>

<div
style={{
flex:1
}}
>

<div style={labelStyle}>
📅 Дата
</div>

<input

type="date"
min={localToday()}

value={date}

onChange={(e)=>
setDate(e.target.value)
}

style={inputStyle}

/>

</div>

<div
style={{
flex:1
}}
>

<div style={labelStyle}>
🕒 Время
</div>

<input

type="time"

value={time}

onChange={(e)=>
setTime(e.target.value)
}

style={inputStyle}

/>

</div>

</div>

<div
  style={{
    ...labelStyle,
    marginTop: 16,
  }}
>
⏱️ Встреча доступна
</div>

<div
  style={{
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
  }}
>
  {DURATION_OPTIONS.map((item) => (
    <div
      key={item.id}
      onClick={() => setDuration(item.id)}
      style={{
        height: 48,
        borderRadius: 14,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: ".15s",
        fontWeight: 600,
        background: duration === item.id ? "#2F80FF" : "#fff",
        color: duration === item.id ? "#fff" : "#222",
        boxShadow: "0 2px 8px rgba(0,0,0,.04)",
      }}
    >
      {item.label}
    </div>
  ))}
</div>

<div
  style={{
    ...labelStyle,
    marginTop: 16,
  }}
>
  Тип участия
</div>

<div
  style={{
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
  }}
>
  <div
    onClick={() => setJoinType("open")}
    style={{
      height: 52,
      borderRadius: 16,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      cursor: "pointer",
      fontWeight: 600,
      transition: ".15s",
      background: joinType === "open" ? "#2F80FF" : "#fff",
      color: joinType === "open" ? "#fff" : "#222",
      boxShadow: "0 2px 8px rgba(0,0,0,.04)",
    }}
  >
    🌍 Открытая
  </div>

  <div
    onClick={() => setJoinType("approval")}
    style={{
      height: 52,
      borderRadius: 16,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      cursor: "pointer",
      fontWeight: 600,
      transition: ".15s",
      background: joinType === "approval" ? "#2F80FF" : "#fff",
      color: joinType === "approval" ? "#fff" : "#222",
      boxShadow: "0 2px 8px rgba(0,0,0,.04)",
    }}
  >
    📨 По заявкам
  </div>
</div>


        <div
style={{
...labelStyle,
marginTop:16
}}
>
Где встречаемся
</div>

<LocationCard
  place={place}
  city={city}
  onMapClick={() => {
    router.push("/meet/location");
  }}
/>

        {/* Участники */}

        <div

style={{

...labelStyle,

marginTop:16

}}

>

Количество участников

</div>

<PeopleSelector

value={maxPeople}

onChange={setMaxPeople}

/>



        {/* Кнопка */}

        <div

  onClick={createMeet}

  style={{

            marginTop:24,

            height:56,

            borderRadius:18,

            background:
              "linear-gradient(135deg,#2F80FF,#56CCF2)",

            color:"#fff",

            display:"flex",
            justifyContent:"center",
            alignItems:"center",

            fontWeight:700,
            fontSize:17,

            cursor:"pointer"

          }}

        >
          {
loading
? "⏳ Создаем..."
: "🚀 Создать встречу"
}
        </div>

      </div>


      



    </PageWrapper>

  );

}

const labelStyle = {

  fontSize:15,

  fontWeight:600,

  marginBottom:10

};

const inputStyle = {

  width:"100%",

  height:52,

  border:"none",

  outline:"none",

  borderRadius:18,
  
  padding:"0 16px",

  background:"#fff",

  fontSize:15,


boxShadow:"0 2px 8px rgba(0,0,0,.03)",

  boxSizing:"border-box" as const

};
