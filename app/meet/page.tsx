"use client";

import { useState, useEffect } from "react";
import { MEET_CATEGORIES } from "../../lib/meet/categories";
import BottomNav from "../../components/BottomNav";
import {
  loadMeetEvents,
  joinMeetEvent,
  leaveMeetEvent,
  deleteMeetEvent,
} from "../../lib/meet/api";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import AuraMap from "../../components/map/AuraMap";
import MeetBottomSheet from "../../components/meet/MeetBottomSheet";
import type { MeetEvent } from "../../lib/meet/types";
import { useCurrentUser } from "../../lib/useCurrentUser";


export default function MeetPage() {
    const router = useRouter();

const searchParams = useSearchParams();
    const { user: currentUser } = useCurrentUser();

    const [events,setEvents] =
useState<any[]>([]);

const [loading,setLoading] =
useState(true);

useEffect(()=>{

  load();

},[]);

async function handleJoin(eventId: string) {
  if (!currentUser) return;

  await joinMeetEvent(eventId, currentUser.id);

  const updated = (await loadMeetEvents()) ?? [];

setEvents(updated);

setSelectedEvent(
  updated.find((e: MeetEvent) => e.id === eventId) ?? null
);
}

async function handleLeave(eventId: string) {
  if (!currentUser) return;

  await leaveMeetEvent(eventId, currentUser.id);

  const updated = await loadMeetEvents();

  setEvents(updated || []);

  setSelectedEvent(
    updated.find((e: MeetEvent) => e.id === eventId) ?? null
  );
}

async function handleDelete(eventId: string) {
  try {
    await deleteMeetEvent(eventId);

    setEvents((prev) =>
      prev.filter((event) => event.id !== eventId)
    );

    setSelectedEvent(null);
  } catch (error) {
    console.error(error);
    alert("Не удалось удалить встречу.");
  }
}

async function load(){

  try{

    const data =
      await loadMeetEvents();

    setEvents(
      data || []
    );

  }finally{

    setLoading(false);

  }

}

  const [tab, setTab] =
  useState("feed");

  useEffect(() => {

  const value =
    searchParams.get("tab");

  if (
    value === "map" ||
    value === "feed" ||
    value === "ai"
  ) {

    setTab(value);

  }

}, [searchParams]);

    const [selectedEvent, setSelectedEvent] =
  useState<MeetEvent | null>(null);

const [selectedCategory, setSelectedCategory] =
  useState<string | null>(null);

const [categoryMenuOpen, setCategoryMenuOpen] =
  useState(false);



  return (

    <div
      style={{
        minHeight: "100vh",
        background: "#F5F7FB",
        paddingBottom: "110px"
      }}
    >

      {/* Header */}

      <div
        style={{
          padding: "22px 20px 10px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >

        <div>

          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "#1F2937"
            }}
          >
            Встречи
          </div>

          <div
            style={{
              marginTop: 4,
              color: "#7B8595",
              fontSize: 14
            }}
          >
            Найди компанию рядом
          </div>

        </div>

        <div

          onClick={() => {

  router.push("/meet/create");

}}

          style={{

            width: 48,
            height: 48,

            borderRadius: "50%",

            background:
              "linear-gradient(135deg,#2F80FF,#56CCF2)",

            display: "flex",
            justifyContent: "center",
            alignItems: "center",

            color: "#fff",
            fontSize: 30,
            cursor: "pointer",

            boxShadow:
              "0 8px 22px rgba(47,128,255,.25)"

          }}
        >
          +
        </div>

      </div>

      {/* Tabs */}

      <div
        style={{
          display: "flex",
          gap: 10,
          padding: "0 20px",
          marginTop: 12
        }}
      >

        {[
          {
            id: "map",
            title: "🗺 Карта"
          },
          {
            id: "feed",
            title: "📋 Лента"
          },
          {
            id: "ai",
            title: "✨ AI"
          }

        ].map(item => (

          <div

            key={item.id}

            onClick={() =>
              setTab(item.id)
            }

            style={{

              flex: 1,

              height: 42,

              borderRadius: 14,

              background:
                tab === item.id
                  ? "#2F80FF"
                  : "#fff",

              color:
                tab === item.id
                  ? "#fff"
                  : "#5F6675",

              display: "flex",
              justifyContent: "center",
              alignItems: "center",

              fontWeight: 600,

              cursor: "pointer",

              boxShadow:
                "0 2px 10px rgba(0,0,0,.05)"

            }}
          >
            {item.title}
          </div>

        ))}

      </div>

      {/* Content */}

      <div
        style={{
          padding: "20px"
        }}
      >

        {tab === "feed" && (

<>

{loading && (

<div
style={{
padding:40,
textAlign:"center"
}}
>
Загрузка...
</div>

)}

{!loading && events.length===0 && (

<div
style={{

background:"#fff",

borderRadius:24,

padding:"42px 24px",

textAlign:"center",

boxShadow:"0 8px 20px rgba(0,0,0,.05)"

}}
>

<div
style={{
fontSize:56
}}
>
📍
</div>

<div
style={{
marginTop:18,
fontSize:21,
fontWeight:700
}}
>
Пока нет встреч
</div>

<div
style={{
marginTop:10,
color:"#7B8595",
lineHeight:1.6,
fontSize:14
}}
>
Создай первую встречу
<br/>
и люди рядом смогут
присоединиться к тебе.
</div>

<div

onClick={()=>
router.push("/meet/create")
}

style={{

marginTop:28,

height:52,

borderRadius:16,

background:
"linear-gradient(135deg,#2F80FF,#56CCF2)",

color:"#fff",

display:"flex",
justifyContent:"center",
alignItems:"center",

fontWeight:700,

cursor:"pointer"

}}
>
Создать встречу
</div>

</div>

)}

{!loading && events.length>0 && (

<div
style={{
display:"flex",
flexDirection:"column",
gap:16
}}
>

{events.map((event: any) => {

  const isParticipant =
    !!currentUser &&
    (event.meet_participants ?? []).some(
      (p: any) => p.users.id === currentUser.id
    );

  const isCreator =
    currentUser?.id === event.users?.id;

  const isFull =
    (event.meet_participants?.length ?? 0) >= event.max_people;

  return (



    

<div
  key={event.id}
  onClick={() => setSelectedEvent(event)}
  style={{
    background: "#fff",
    borderRadius: 22,
    padding: 18,
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(0,0,0,.05)"
  }}
>



<div
style={{
fontSize:18,
fontWeight:700
}}
>
{event.title}
</div>

<div
style={{
marginTop:6,
color:"#6B7280"
}}
>
📍 {event.place}
</div>

<div
style={{
marginTop:4,
color:"#6B7280"
}}
>
📅 {new Date(event.starts_at).toLocaleString()}
</div>

<div
style={{
marginTop:10,
color:"#555",
lineHeight:1.5
}}
>
{event.description}
</div>

<div
  style={{
    marginTop: 14,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  }}
>
  <div
    style={{
      color: "#6B7280",
      fontWeight: 600,
    }}
  >
    👥 {event.meet_participants?.length ?? 0}/{event.max_people}
  </div>

  {isCreator ? (
    <div
      style={{
        color: "#2AABEE",
        fontWeight: 700,
      }}
    >
      👑 Моя встреча
    </div>
  ) : isParticipant ? (
    <div
      style={{
        color: "#10B981",
        fontWeight: 700,
      }}
    >
      ✅ Вы участвуете
    </div>
  ) : isFull ? (
    <div
      style={{
        color: "#EF4444",
        fontWeight: 700,
      }}
    >
      🚫 Нет мест
    </div>
  ) : (
    <button
      onClick={() => handleJoin(event.id)}
      style={{
        border: "none",
        background:
          "linear-gradient(135deg,#2AABEE,#1C8CEB)",
        color: "#fff",
        padding: "10px 18px",
        borderRadius: 12,
        cursor: "pointer",
        fontWeight: 600,
      }}
    >
      Присоединиться
    </button>
  )}
</div>

</div>

  );
})}

</div>

)}

</>

)}

        {tab === "map" && (

<>



<div
  onClick={() => {

    if (categoryMenuOpen) {
      setCategoryMenuOpen(false);
    }

  }}
  style={{
    position: "relative",
    height: "70vh",
  borderRadius: 24,
  overflow: "hidden",
  boxShadow: "0 8px 20px rgba(0,0,0,.05)",

  
}}
>

  <AuraMap
  mode="view"
  category={selectedCategory}
  selectedEvent={selectedEvent}
  onMarkerClick={(event) => {

    setCategoryMenuOpen(false);

    setSelectedEvent(event);

  }}
/>

  {selectedEvent && (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(0,0,0,.10)",
        backdropFilter: "blur(1.5px)",
        pointerEvents: "none",
        transition: "all .3s",
        zIndex: 500,
      }}
    />
  )}

  <div
  style={{
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,

    zIndex: selectedEvent ? 1 : 1000,

    opacity: selectedEvent ? 0 : 1,

    pointerEvents: selectedEvent
      ? "none"
      : "auto",

    transition:
      "opacity .25s ease",
  }}
>

    <div
      onClick={(e) => {

  e.stopPropagation();

  setCategoryMenuOpen(!categoryMenuOpen);

}}
      style={{
        height: 38,
        padding: "0 14px",
        borderRadius: 14,
        background: "rgba(255,255,255,.82)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        cursor: "pointer",
        boxShadow: "0 8px 24px rgba(0,0,0,.12)",
        fontSize: 14,
        fontWeight: 600,
      }}
    >
      <span>
        {selectedCategory
          ? `${MEET_CATEGORIES.find(c => c.id === selectedCategory)?.icon} ${MEET_CATEGORIES.find(c => c.id === selectedCategory)?.name}`
          : "🔍 Все категории"}
      </span>

      <span>
        {categoryMenuOpen ? "▲" : "▼"}
      </span>
    </div>

    <div
  onClick={(e) => e.stopPropagation()}
  style={{
    marginTop: 8,
    borderRadius: 16,
    background: "rgba(255,255,255,.88)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    boxShadow: "0 12px 28px rgba(0,0,0,.15)",

    maxHeight: categoryMenuOpen ? 260 : 0,
    opacity: categoryMenuOpen ? 1 : 0,

    transform: categoryMenuOpen
      ? "translateY(0)"
      : "translateY(-10px)",

    transition:
      "all .28s cubic-bezier(.22,.61,.36,1)",

    pointerEvents: categoryMenuOpen
      ? "auto"
      : "none",

    overflow: "hidden",
    overflowY: "auto",
  }}
>

        <div
          onClick={() => {
            setSelectedCategory(null);
            setCategoryMenuOpen(false);
          }}
          style={{
            padding: "11px 14px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          ✓ Все
        </div>

        {MEET_CATEGORIES.map((item) => (

          <div
            key={item.id}
            onClick={() => {
              setSelectedCategory(item.id);
              setCategoryMenuOpen(false);
            }}
            style={{
              padding: "11px 14px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              cursor: "pointer",
              background:
                selectedCategory === item.id
                  ? "rgba(47,128,255,.08)"
                  : "transparent",
            }}
          >
            <span>{item.icon}</span>
            <span>{item.name}</span>
          </div>

        ))}

      </div>

    

  </div>

</div>

</>

)}

      </div>

      <MeetBottomSheet
  event={selectedEvent}
  currentUserId={currentUser?.id ?? null}
  onJoin={handleJoin}
  onLeave={handleLeave}
  onDelete={handleDelete}
  onClose={() => {

  

  setSelectedEvent(null);

}}
/>

      <BottomNav />

    </div>

  );

}