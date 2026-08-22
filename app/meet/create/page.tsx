"use client";

import {
  useState,
  useEffect
} from "react";
import {
  useRouter
} from "next/navigation";
import PageWrapper from "../../../components/PageWrapper";
import PageHeader from "../../../components/PageHeader";
import { MEET_CATEGORIES } from "../../../lib/meet/categories";
import PeopleSelector from "../../../components/meet/PeopleSelector";
import LocationCard from "../../../components/meet/LocationCard";
import CategoryPicker from "../../../components/meet/CategoryPicker";
import CategoryBottomSheet from "../../../components/meet/CategoryBottomSheet";
import MeetDatePicker from "../../../components/meet/MeetDatePicker";
import MeetTimePicker from "../../../components/meet/MeetTimePicker";
import MeetDurationSelector from "../../../components/meet/MeetDurationSelector";
import { useNotification } from "../../../components/NotificationContext";
import { getTelegramInitData } from "../../../lib/telegram-init-data";
import { isMeetStartSafelyFuture, localMeetDateTimeToIso, localToday, nextMeetTimeSuggestion, type MeetDuration } from "../../../lib/meet/time";
import { useI18n } from "../../../components/I18nProvider";
export default function CreateMeetPage() {
  const { t, intlLocale } = useI18n();

  const router = useRouter();
  const { error: showError } = useNotification();
  

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
  MeetDuration
>("1h");

const [joinType, setJoinType] = useState<
  "open" | "approval"
>("open");

const [loading,setLoading] =
useState(false);

  const [category,setCategory] = useState("coffee");

const [categorySheetOpen, setCategorySheetOpen] =
useState(false);
const [datePickerOpen, setDatePickerOpen] = useState(false);
const [timePickerOpen, setTimePickerOpen] = useState(false);

useEffect(() => {
  const raw = sessionStorage.getItem("meet_draft");

  if (!raw) {
    const suggestion = nextMeetTimeSuggestion();
    setDate(suggestion.date);
    setTime(suggestion.time);
    return;
  }

  try {
    const draft = JSON.parse(raw);

    setTitle(draft.title ?? "");
    setDescription(draft.description ?? "");
    setCategory(draft.category ?? "coffee");
    const suggestion = nextMeetTimeSuggestion();
    setDate(draft.date || suggestion.date);
    setTime(draft.time || suggestion.time);
    setMaxPeople(draft.maxPeople ?? 1);
    setDuration(
  (draft.duration as MeetDuration) ?? "1h"
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
    setCity(data.address || "");
    setLatitude(data.lat ?? null);
    setLongitude(data.lng ?? null);

    sessionStorage.removeItem("meet_location");

  } catch {

    sessionStorage.removeItem("meet_location");

  }

}, []);

  

  async function createMeet(){

  if(loading) return;

  if(
    !title ||
    !date ||
    !time
  ){
    showError(t("meet.invalidData"), t("meet.requiredDate"));
    return;
  }

  const startsAt = localMeetDateTimeToIso(date, time);
  if (!startsAt) {
    showError(t("meet.invalidDate"), t("meet.invalidDateText"));
    return;
  }
  if (!isMeetStartSafelyFuture(startsAt)) {
    showError(t("meet.invalidTime"), t("meet.invalidTimeText"));
    return;
  }

  setLoading(true);

  try{

const initData = await getTelegramInitData();

if (!initData) {
  showError(
    t("meet.createError"),
    t("meet.telegramFailed")
  );
  return;
}

let eventId = sessionStorage.getItem("meet_create_event_id");
if (!eventId) {
  eventId = crypto.randomUUID();
  sessionStorage.setItem("meet_create_event_id", eventId);
}

const createResponse = await fetch(
  "/api/meet/create",
  {
    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

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
        max_people: maxPeople
      }
    })
  }
);

const createResult =
  await createResponse.json();

if (
  !createResponse.ok ||
  !createResult.ok
) {
  console.error(
    "MEET CREATE API ERROR:",
    createResult
  );

  throw new Error(
    createResult?.message ||
    createResult?.error ||
    t("meet.createFailed")
  );
}

sessionStorage.removeItem(
  "meet_draft"
);
sessionStorage.removeItem("meet_location");
sessionStorage.removeItem("meet_create_event_id");

router.replace("/meet");

  } catch (err: unknown) {

  const createError = err as { message?: string; details?: string; hint?: string; code?: string };

  console.error("CREATE MEET ERROR:", createError);
  console.error("CREATE MEET ERROR MESSAGE:", createError.message);
  console.error("CREATE MEET ERROR DETAILS:", createError.details);
  console.error("CREATE MEET ERROR HINT:", createError.hint);
  console.error("CREATE MEET ERROR CODE:", createError.code);

  showError(
    t("meet.createError"),
    createError.message || t("meet.unknownError")
  );

} finally {
  setLoading(false);

}

}

const today = localToday();
const minimumTime = date === today ? nextMeetTimeSuggestion().time : undefined;
const formattedDate = date
  ? new Intl.DateTimeFormat(intlLocale, { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${date}T12:00:00`))
  : t("meet.date");

  return (

    <PageWrapper>

      <div
        style={{
          minHeight:"100vh",
          background:"var(--app-bg)",
          color:"var(--text-primary)",
          padding:"20px",
          paddingBottom:"120px"
        }}
      >

        <PageHeader title={t("meet.create")} onBack={() => router.back()} />

        {/* Название встречи */}

        <div style={labelStyle}>
          {t("meet.name")}
        </div>

        <input
value={title}
onChange={(e)=>
setTitle(e.target.value)
}
placeholder={t("meet.namePlaceholder")}
style={inputStyle}
/>

        {/* Категория */}

<div
  style={{
    ...labelStyle,
    marginTop: 16,
  }}
>
  {t("category.label")}
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
          {t("meet.description")}
        </div>

        <textarea

value={description}

onChange={(e)=>
setDescription(e.target.value)
}

placeholder={t("meet.descriptionPlaceholder")}

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
📅 {t("meet.date")}
</div>

<button type="button" onClick={() => setDatePickerOpen(true)} style={{...inputStyle,textAlign:"left",cursor:"pointer"}}>
  {formattedDate}
</button>

<MeetDatePicker
  open={datePickerOpen}
  value={date}
  min={today}
  onClose={() => setDatePickerOpen(false)}
  onChange={(nextDate) => {
    setDate(nextDate);
    if (nextDate === today && (!time || !isMeetStartSafelyFuture(localMeetDateTimeToIso(nextDate, time) ?? ""))) {
      setTime(nextMeetTimeSuggestion().time);
    }
  }}
/>

</div>

<div
style={{
flex:1
}}
>

<div style={labelStyle}>
🕒 {t("meet.time")}
</div>

<button type="button" onClick={() => setTimePickerOpen(true)} style={{...inputStyle,textAlign:"left",cursor:"pointer"}}>
  {time || t("meet.chooseTime")}
</button>

<MeetTimePicker
  open={timePickerOpen}
  value={time}
  minimum={minimumTime}
  onClose={() => setTimePickerOpen(false)}
  onChange={setTime}
/>

</div>

</div>

<div
  style={{
    ...labelStyle,
    marginTop: 16,
  }}
>
⏱️ {t("meet.duration")}
</div>

<MeetDurationSelector value={duration} onChange={setDuration} date={date} time={time} />

<div
  style={{
    ...labelStyle,
    marginTop: 16,
  }}
>
  {t("meet.joinType")}
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
      background: joinType === "open" ? "var(--brand-gradient)" : "var(--surface)",
      color: joinType === "open" ? "var(--text-inverse)" : "var(--text-primary)",
      border: `1px solid ${joinType === "open" ? "var(--brand-primary)" : "var(--border-subtle)"}`,
      boxShadow: "var(--shadow-sm)",
    }}
  >
    🌍 {t("meet.open")}
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
      background: joinType === "approval" ? "var(--brand-gradient)" : "var(--surface)",
      color: joinType === "approval" ? "var(--text-inverse)" : "var(--text-primary)",
      border: `1px solid ${joinType === "approval" ? "var(--brand-primary)" : "var(--border-subtle)"}`,
      boxShadow: "var(--shadow-sm)",
    }}
  >
    📨 {t("meet.approval")}
  </div>
</div>


        <div
style={{
...labelStyle,
marginTop:16
}}
>
{t("meet.place")}
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

{t("meet.capacity")}

</div>

<PeopleSelector

value={maxPeople}

onChange={setMaxPeople}

/>



        {/* Кнопка */}

        <button
          type="button"
          className="aura-primary-button"
          disabled={loading}
          onClick={createMeet}
          style={{marginTop:24}}
        >
          {
loading
? `⏳ ${t("meet.creating")}`
: `🚀 ${t("meet.create")}`
}
        </button>

      </div>


      



    </PageWrapper>

  );

}

const labelStyle = {

  fontSize:15,

  fontWeight:600,

  color:"var(--text-primary)",

  marginBottom:10

};

const inputStyle = {

  width:"100%",

  height:52,

  border:"1px solid var(--border-subtle)",

  outline:"none",

  borderRadius:18,
  
  padding:"0 16px",

  background:"var(--surface)",

  color:"var(--text-primary)",

  fontSize:15,


boxShadow:"var(--shadow-sm)",

  boxSizing:"border-box" as const

};
