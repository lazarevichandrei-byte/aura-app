"use client";

import { useState, useEffect } from "react";
import BottomNav from "../../components/BottomNav";
import { loadMeetEvents } from "../../lib/meet/api";
import { useRouter } from "next/navigation";
import AuraMap from "../../components/map/AuraMap";
import MeetBottomSheet from "../../components/meet/MeetBottomSheet";
import type { MeetEvent } from "../../lib/meet/types";


export default function MeetPage() {
    const router = useRouter();

    const [events,setEvents] =
useState<any[]>([]);

const [loading,setLoading] =
useState(true);

useEffect(()=>{

  load();

},[]);

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

    const [selectedEvent, setSelectedEvent] =
  useState<MeetEvent | null>(null);

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

{events.map((event:any)=>(

<div

key={event.id}

style={{

background:"#fff",

borderRadius:22,

padding:18,

boxShadow:
"0 8px 20px rgba(0,0,0,.05)"

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

</div>

))}

</div>

)}

</>

)}

        {tab === "map" && (

<div
style={{

height:"70vh",

borderRadius:24,

overflow:"hidden",

boxShadow:
"0 8px 20px rgba(0,0,0,.05)"

}}
>
<AuraMap
  mode="view"
  onMarkerClick={setSelectedEvent}
/>

</div>

)}

      </div>

      <MeetBottomSheet
  event={selectedEvent}
  onClose={() => setSelectedEvent(null)}
/>

      <BottomNav />

    </div>

  );

}