"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MEET_CATEGORIES } from "../../lib/meet/categories";
import BottomNav from "../../components/BottomNav";
import {
  loadMeetEvents,
  loadMeetEventCard,
  joinMeetEvent,
  leaveMeetEvent,
  deleteMeetEvent,
  sendJoinRequest,
} from "../../lib/meet/api";
import { useRouter } from "next/navigation";
import AuraMap from "../../components/map/AuraMap";
import type { AuraMapRef } from "../../components/map/AuraMap";
import MapControls from "../../components/map/MapControls";
import MeetBottomSheet from "../../components/meet/MeetBottomSheet";
import MeetViewSwitcher from "../../components/meet/MeetViewSwitcher";
import MeetFeedCard from "../../components/meet/MeetFeedCard";
import MeetGridCard from "../../components/meet/MeetGridCard";
import CategoryBottomSheet from "../../components/meet/CategoryBottomSheet";
import type { MeetEvent } from "../../lib/meet/types";
import { useCurrentUser } from "../../lib/useCurrentUser";
import { useNotification } from "../../components/NotificationContext";
import { supabase } from "../../lib/supabase";
import { getMeetGuestCount } from "../../lib/meet/participants";


export default function MeetPage() {
    const router = useRouter();
    const { error: showError, success } = useNotification();
    const mapRef = useRef<AuraMapRef>(null);


    const { user: currentUser } = useCurrentUser();

    const [events,setEvents] =
useState<any[]>([]);

const [loading,setLoading] =
useState(true);
useEffect(() => {
  const nearestExpiration = events.reduce<number | null>((nearest, event) => {
    const expiresAt = new Date(event.expires_at).getTime();
    if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) return nearest;
    return nearest === null || expiresAt < nearest ? expiresAt : nearest;
  }, null);
  if (nearestExpiration === null) return;

  const timer = window.setTimeout(() => {
    const now = Date.now();
    setEvents((current) => current.filter((event) => new Date(event.expires_at).getTime() > now));
    setSelectedEvent((current) => current && new Date(current.expires_at).getTime() <= now ? null : current);
  }, Math.max(0, nearestExpiration - Date.now() + 50));

  return () => window.clearTimeout(timer);
}, [events]);

const sortAndFilterEvents = useCallback((items: any[]) => {
  const now = Date.now();
  return items
    .filter((event) => event.is_active && new Date(event.expires_at).getTime() > now)
    .sort((left, right) => new Date(left.starts_at).getTime() - new Date(right.starts_at).getTime());
}, []);

const syncEvent = useCallback(async (eventId: string) => {
  try {
    const event = await loadMeetEventCard(eventId);
    setEvents((current) => {
      if (!event || !event.is_active || new Date(event.expires_at).getTime() <= Date.now()) {
        return current.filter((item) => item.id !== eventId);
      }
      const exists = current.some((item) => item.id === eventId);
      return sortAndFilterEvents(exists
        ? current.map((item) => item.id === eventId ? event : item)
        : [...current, event]);
    });
    setSelectedEvent((current) => current?.id === eventId ? event : current);
  } catch (error) {
    console.error("MEET REALTIME SYNC ERROR:", { eventId, error });
  }
}, [sortAndFilterEvents]);

useEffect(() => {
  const channel = supabase
    .channel("meet-realtime-main")
    .on("postgres_changes", { event: "*", schema: "public", table: "meet_events" }, (payload: any) => {
      const eventId = payload.new?.id || payload.old?.id;
      if (!eventId) return;
      if (payload.eventType === "DELETE") {
        setEvents((current) => current.filter((event) => event.id !== eventId));
        setSelectedEvent((current) => current?.id === eventId ? null : current);
        return;
      }
      void syncEvent(eventId);
    })
    .on("postgres_changes", { event: "*", schema: "public", table: "meet_participants" }, (payload: any) => {
      const eventId = payload.new?.event_id || payload.old?.event_id;
      if (eventId) void syncEvent(eventId);
    })
    .on("postgres_changes", { event: "*", schema: "public", table: "meet_join_requests" }, (payload: any) => {
      const eventId = payload.new?.event_id || payload.old?.event_id;
      if (eventId) void syncEvent(eventId);
    })
    .subscribe((status) => {
      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        void load();
      }
    });

  return () => {
    void supabase.removeChannel(channel);
  };
}, [currentUser?.id, syncEvent]);

useEffect(() => {
  const reconcile = () => {
    if (!document.hidden) void load();
  };
  document.addEventListener("visibilitychange", reconcile);
  window.addEventListener("online", reconcile);
  return () => {
    document.removeEventListener("visibilitychange", reconcile);
    window.removeEventListener("online", reconcile);
  };
}, []);

useEffect(()=>{

  load();

},[]);

async function handleJoin(eventId: string) {
  if (!currentUser) return;

  setEvents((prev) =>
    prev.map((event) => {

      if (event.id !== eventId) return event;

      return {
        ...event,
        meet_participants: [
          ...(event.meet_participants ?? []),
          {
            users: {
              id: currentUser.id,
            },
          },
        ],
      };

    })
  );

  try {

    await joinMeetEvent(eventId, currentUser.id);

    await syncEvent(eventId);
    success("Вы присоединились", "Теперь вам доступен общий чат встречи.");

  } catch (e) {

    console.error(e);
    showError("Не удалось присоединиться", "Попробуйте ещё раз.");

    await load();

  }
}

async function handleCardAction(event: MeetEvent) {
  if (!currentUser) return;
  if (event.join_type === "open") {
    await handleJoin(event.id);
    return;
  }
  try {
    await sendJoinRequest(event.id, currentUser.id);
    await syncEvent(event.id);
    success("Заявка отправлена", "Организатор увидит вашу заявку.");
    setSelectedEvent((current) => current?.id === event.id ? { ...current } : current);
  } catch (error) {
    console.error("MEET REQUEST ERROR:", error);
    showError("Не удалось отправить заявку", "Попробуйте ещё раз.");
  }
}

async function handleLeave(eventId: string) {
  if (!currentUser) return;

  setEvents((prev) =>
    prev.map((event) => {

      if (event.id !== eventId) return event;

      return {
        ...event,
        meet_participants: (event.meet_participants ?? []).filter(
          (p: any) => p.users.id !== currentUser.id
        ),
      };

    })
  );

  try {

    await leaveMeetEvent(eventId, currentUser.id);

    await syncEvent(eventId);
    success("Вы покинули встречу", "Доступ к общему чату закрыт.");

  } catch (e) {

    console.error(e);
    showError("Не удалось покинуть встречу", "Попробуйте ещё раз.");

    await load();

  }
}

async function handleDelete(eventId: string) {
  try {
    await deleteMeetEvent(eventId);

    setEvents((prev) =>
      prev.filter((event) => event.id !== eventId)
    );

    setSelectedEvent(null);
    success("Встреча удалена", "Встреча и связанный чат удалены.");
  } catch (error) {
    console.error(error);
    showError("Не удалось удалить встречу", "Попробуйте ещё раз.");
    throw error;
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
  useState("map");

  const [view, setView] = useState<"list" | "grid">("list");

  useEffect(() => {

  if (typeof window === "undefined") return;

  const params = new URLSearchParams(
    window.location.search
  );

  const value = params.get("tab");

  if (
    value === "map" ||
    value === "feed"
  ) {
    setTab(value);
  }

}, []);


useEffect(() => {

  if (typeof window === "undefined") return;

  const saved =
    localStorage.getItem("meet_view");

  if (
    saved === "list" ||
    saved === "grid"
  ) {
    setView(saved);
  }

}, []);

useEffect(() => {

  if (typeof window === "undefined") return;

  localStorage.setItem(
    "meet_view",
    view
  );

}, [view]);

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
        background: "var(--app-bg)",
        color:"var(--text-primary)",
        paddingBottom: "calc(90px + env(safe-area-inset-bottom, 0px))"
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
              color: "var(--text-primary)"
            }}
          >
            Встречи
          </div>

          <div
            style={{
              marginTop: 4,
              color: "var(--text-secondary)",
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
              "var(--primary)",

            display: "flex",
            justifyContent: "center",
            alignItems: "center",

            color: "var(--text-inverse)",
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
  padding: "12px 20px 20px"
}}
      >

        {tab === "feed" && (

<>

<MeetViewSwitcher
    view={view}
    onChange={setView}
/>

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

background:"var(--surface)",
color:"var(--text-primary)",

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
color:"var(--text-secondary)",
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
"var(--primary)",

color:"var(--text-inverse)",

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

<motion.div

layout

style={{
display:"grid",
gridTemplateColumns:
view === "grid"
? "repeat(2,minmax(0,1fr))"
: "1fr",
gap:16,
alignItems:"start",
}}

transition={{
duration:.28,
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
    getMeetGuestCount(event) >= event.max_people;
  const requestStatus = event.meet_join_requests?.find(
    (request: any) => request.user_id === currentUser?.id
  )?.status ?? null;

  return (

view === "list" ? (

<MeetFeedCard
    key={event.id}
    event={event}
    isCreator={isCreator}
    isParticipant={isParticipant}
    isFull={isFull}
    onClick={() => setSelectedEvent(event)}
    onJoin={() => handleCardAction(event)}
    requestStatus={requestStatus}
/>

) : (

<MeetGridCard
    key={event.id}
    event={event}
    isCreator={isCreator}
    isParticipant={isParticipant}
    isFull={isFull}
    onClick={() => setSelectedEvent(event)}
    onJoin={() => handleCardAction(event)}
    requestStatus={requestStatus}
/>

)

);

})}

</motion.div>

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
    height: "calc(var(--tg-viewport-stable-height, 100dvh) - 250px - env(safe-area-inset-bottom, 0px))",
    minHeight: 380,
  borderRadius: 24,
  overflow: "hidden",
  boxShadow: "0 8px 20px rgba(0,0,0,.05)",

  
}}
>

  <AuraMap
  ref={mapRef}
  mode="view"
  events={events}
  category={selectedCategory}
  selectedEvent={selectedEvent}
  onMarkerClick={(event) => {

    setCategoryMenuOpen(false);

    setSelectedEvent(event);

  }}
/>

  {!selectedEvent && (
    <MapControls
      onLocation={() => { void mapRef.current?.flyToUser(); }}
      onZoomIn={() => mapRef.current?.zoomIn()}
      onZoomOut={() => mapRef.current?.zoomOut()}
    />
  )}

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
        background: "var(--nav-bg)",
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

  </div>

</div>

<CategoryBottomSheet
  open={categoryMenuOpen}
  value={selectedCategory}
  allowAll
  onClose={() => setCategoryMenuOpen(false)}
  onSelect={(categoryId) => {
    setSelectedCategory(categoryId);
    setCategoryMenuOpen(false);
  }}
/>

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
