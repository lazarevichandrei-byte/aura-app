"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft2 } from "iconsax-react";
import { motion } from "motion/react";

import PageWrapper from "../../../../components/PageWrapper";
import { FormSkeleton } from "../../../../components/AppSkeletons";
import {
  getMeetEvent,
  updateMeetEvent,
  deleteMeetEvent,
} from "../../../../lib/meet/api";
import LocationCard from "../../../../components/meet/LocationCard";
import PeopleSelector from "../../../../components/meet/PeopleSelector";
import CategoryPicker from "../../../../components/meet/CategoryPicker";
import CategoryBottomSheet from "../../../../components/meet/CategoryBottomSheet";
import MeetTimePicker from "../../../../components/meet/MeetTimePicker";
import MeetDurationSelector from "../../../../components/meet/MeetDurationSelector";
import { useNotification } from "../../../../components/NotificationContext";
import { isMeetStartSafelyFuture, localMeetDateTimeToIso, localToday, meetIsoToLocalInputs, type MeetDuration } from "../../../../lib/meet/time";
import { MEET_CATEGORIES } from "../../../../lib/meet/categories";
import { consumeMeetLocation, prepareMeetLocation } from "../../../../lib/meet/locationStore";
import {useI18n} from "../../../../components/I18nProvider";


export default function EditMeetPage() {
  const {t}=useI18n();
  const { id } = useParams();

  const router = useRouter();
  const { error: showError } = useNotification();

const [loading, setLoading] = useState(true);

const [title, setTitle] = useState("");
const [description, setDescription] = useState("");
const [category, setCategory] = useState("");
const [city, setCity] = useState("");
const [place, setPlace] = useState("");
const [address, setAddress] = useState("");

const [latitude, setLatitude] =
  useState<number | null>(null);

const [longitude, setLongitude] =
  useState<number | null>(null);

const [date, setDate] = useState("");
const [time, setTime] = useState("");
const [duration, setDuration] = useState<MeetDuration>("1h");
const [categorySheetOpen, setCategorySheetOpen] = useState(false);
const [timePickerOpen, setTimePickerOpen] = useState(false);

const [maxPeople, setMaxPeople] = useState(1);

const restoredLocation = useRef(false);

useEffect(() => {
  load();
}, []);

useEffect(() => {
  function restoreLocation() {
    const data = consumeMeetLocation();
    if (!data) return;
    restoredLocation.current = true;
    setPlace(data.title);
    setAddress(data.address);
    setCity(data.city);
    setLatitude(data.lat);
    setLongitude(data.lng);
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
  setAddress(event.city);
  setLatitude(event.latitude);
  setLongitude(event.longitude);
}
  const localStartsAt = meetIsoToLocalInputs(event.starts_at);
  setDate(localStartsAt.date);
  setTime(localStartsAt.time);
  setDuration(event.duration ?? "1h");
  setMaxPeople(event.max_people);

  setLoading(false);
}

async function handleSave() {
  try {
    const startsAt = localMeetDateTimeToIso(date, time);
    if (!startsAt) {
      showError(t("meet.invalidDate"), t("meet.requiredDate"));
      return;
    }
    if (!isMeetStartSafelyFuture(startsAt)) {
      showError(t("meet.invalidTime"), t("meet.invalidTimeText"));
      return;
    }
    await updateMeetEvent(id as string, {
  title,
  description,
  category,
  city: address || city,
  place,
  latitude,
  longitude,
  starts_at: startsAt,
  duration,
  max_people: maxPeople,
});

    router.back();
  } catch (error) {
    console.error(error);
    showError(t("meet.updatedFailed"), t("meet.tryAgain"));
  }
}



const inputStyle = {
  width: "100%",
  height: 52,
  borderRadius: 14,
  border: "1px solid var(--border)",
  padding: "0 16px",
  fontSize: 16,
  background: "var(--input-bg)",
  color:"var(--text-primary)",
  boxSizing: "border-box" as const,
};

if (loading) {
  return <FormSkeleton />;
}



  return (
<PageWrapper>

    <div
      style={{
        minHeight: "100vh",
        background: "var(--app-bg)",
        color:"var(--text-primary)",
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
            color="var(--brand-primary)"
            variant="Outline"
        />
    </motion.div>

    <div>
        <div
            style={{
                fontSize: 24,
                fontWeight: 700,
                color: "var(--text-primary)",
            }}
        >
            {t("meet.edit")}
        </div>

        <div
            style={{
                marginTop: 4,
                fontSize: 13,
                color: "var(--text-secondary)",
            }}
        >
            {t("meet.editHint")}
        </div>
    </div>
</motion.div>

      <div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: 16,
    marginTop: 12,
  }}
>
  <div
  style={{
    background: "var(--surface)",
    borderRadius: 18,
    padding: 18,
    border: "1px solid var(--border-subtle)",
    boxShadow: "0 4px 12px rgba(15,23,42,.04)",
  }}
>
  <div
    style={{
      fontSize: 13,
      fontWeight: 600,
      color: "var(--text-secondary)",
      marginBottom: 10,
    }}
  >
    {t("meet.name")}
  </div>

  <input
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    style={inputStyle}
  />
</div>

  <div
    style={{
      background: "var(--surface)",
      borderRadius: 18,
      padding: 18,
      border: "1px solid var(--border-subtle)",
      boxShadow: "0 4px 12px rgba(15,23,42,.04)",
    }}
  >
    <div style={{fontSize:13,fontWeight:600,color:"var(--text-secondary)",marginBottom:10}}>{t("category.label")}</div>
    <CategoryPicker
      value={MEET_CATEGORIES.find((item) => item.id === category) ?? null}
      onClick={() => setCategorySheetOpen(true)}
    />
    <CategoryBottomSheet
      open={categorySheetOpen}
      value={category}
      onClose={() => setCategorySheetOpen(false)}
      onSelect={(nextCategory) => {
        setCategory(nextCategory);
        setCategorySheetOpen(false);
      }}
    />
  </div>

  <div
  style={{
    background: "var(--surface)",
    borderRadius: 18,
    padding: 18,
    border: "1px solid var(--border-subtle)",
    boxShadow: "0 4px 12px rgba(15,23,42,.04)",
  }}
>
  <div
    style={{
      fontSize: 13,
      fontWeight: 600,
      color: "var(--text-secondary)",
      marginBottom: 10,
    }}
  >
    {t("meet.description")}
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

  <div
  style={{
    background: "var(--surface)",
    borderRadius: 18,
    padding: 18,
    border: "1px solid var(--border-subtle)",
    boxShadow: "0 4px 12px rgba(15,23,42,.04)",
  }}
>
  <div
    style={{
      fontSize: 13,
      fontWeight: 600,
      color: "var(--text-secondary)",
      marginBottom: 10,
    }}
  >
    {t("meet.place")}
  </div>

  <LocationCard
  place={place}
  city={city}
  address={address}
  onMapClick={() => {
    prepareMeetLocation(latitude !== null && longitude !== null ? {
      title: place,
      address,
      city,
      lat: latitude,
      lng: longitude,
    } : null);
    router.push("/meet/location");
  }}
/>
</div>

  <div
  style={{
    background: "var(--surface)",
    borderRadius: 18,
    padding: 18,
    border: "1px solid var(--border-subtle)",
    boxShadow: "0 4px 12px rgba(15,23,42,.04)",
  }}
>
  <div
    style={{
      fontSize: 13,
      fontWeight: 600,
      color: "var(--text-secondary)",
      marginBottom: 10,
    }}
  >
    {t("meet.capacity")}
  </div>

  <PeopleSelector
    value={maxPeople}
    onChange={setMaxPeople}
  />
</div>

<div style={{display:"flex",gap:12}}>
  <div style={{flex:1}}>
    <div style={{fontSize:13,fontWeight:600,color:"var(--text-secondary)",marginBottom:10}}>{t("meet.date")}</div>
    <input type="date" min={localToday()} value={date} onChange={(event)=>setDate(event.target.value)} style={inputStyle} />
  </div>
  <div style={{flex:1}}>
    <div style={{fontSize:13,fontWeight:600,color:"var(--text-secondary)",marginBottom:10}}>{t("meet.time")}</div>
    <button type="button" onClick={() => setTimePickerOpen(true)} style={{...inputStyle,textAlign:"left",cursor:"pointer"}}>{time || t("meet.chooseTime")}</button>
    <MeetTimePicker open={timePickerOpen} value={time} onClose={() => setTimePickerOpen(false)} onChange={setTime} />
  </div>
</div>

<div>
  <div style={{fontSize:13,fontWeight:600,color:"var(--text-secondary)",marginBottom:10}}>{t("meet.duration")}</div>
  <MeetDurationSelector value={duration} onChange={setDuration} date={date} time={time} />
</div>

  <button
    onClick={handleSave}
    style={{
      marginTop: 32,
      width: "100%",
      height: 52,
      border: "none",
      borderRadius: 14,
     background: "var(--brand-gradient)",
      color: "var(--text-inverse)",
      fontSize: 16,
      fontWeight: 600,
      cursor: "pointer",
    }}
  >
    💾 {t("meet.saveChanges")}
  </button>
  


</div>
    </div>

</PageWrapper>
  );
}
