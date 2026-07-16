"use client";

import { useState, useEffect } from "react";
import BottomNav from "../../components/BottomNav";
import { loadMeetEvents } from "../../lib/meet/api";

export default function MeetPage() {

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

            alert("Создание встречи скоро подключим 🚀");

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

          <div
            style={{

              background: "#fff",

              borderRadius: 24,

              padding: "42px 24px",

              textAlign: "center",

              boxShadow:
                "0 8px 20px rgba(0,0,0,.05)"

            }}
          >

            <div
              style={{
                fontSize: 56
              }}
            >
              📍
            </div>

            <div
              style={{
                marginTop: 18,
                fontSize: 21,
                fontWeight: 700
              }}
            >
              Пока нет встреч
            </div>

            <div
              style={{
                marginTop: 10,
                color: "#7B8595",
                lineHeight: 1.6,
                fontSize: 14
              }}
            >
              Создай первую встречу
              <br />
              и люди рядом смогут
              присоединиться к тебе.
            </div>

            <div

              onClick={() => {

                alert("Создание встречи скоро подключим 🚀");

              }}

              style={{

                marginTop: 28,

                height: 52,

                borderRadius: 16,

                background:
                  "linear-gradient(135deg,#2F80FF,#56CCF2)",

                color: "#fff",

                display: "flex",
                justifyContent: "center",
                alignItems: "center",

                fontWeight: 700,

                cursor: "pointer"

              }}
            >
              Создать встречу
            </div>

          </div>

        )}

        {tab === "map" && (

          <div
            style={{

              background: "#fff",

              borderRadius: 24,

              padding: 60,

              textAlign: "center",

              boxShadow:
                "0 8px 20px rgba(0,0,0,.05)"

            }}
          >

            <div
              style={{
                fontSize: 56
              }}
            >
              🗺
            </div>

            <div
              style={{
                marginTop: 16,
                fontSize: 20,
                fontWeight: 700
              }}
            >
              Карта встреч
            </div>

            <div
              style={{
                marginTop: 8,
                color: "#7B8595"
              }}
            >
              Скоро здесь появится карта.
            </div>

          </div>

        )}

        {tab === "ai" && (

          <div
            style={{

              background: "#fff",

              borderRadius: 24,

              padding: 60,

              textAlign: "center",

              boxShadow:
                "0 8px 20px rgba(0,0,0,.05)"

            }}
          >

            <div
              style={{
                fontSize: 56
              }}
            >
              ✨
            </div>

            <div
              style={{
                marginTop: 16,
                fontSize: 20,
                fontWeight: 700
              }}
            >
              AI рекомендации
            </div>

            <div
              style={{
                marginTop: 8,
                color: "#7B8595"
              }}
            >
              Скоро AI будет подбирать встречи специально для тебя.
            </div>

          </div>

        )}

      </div>

      <BottomNav />

    </div>

  );

}