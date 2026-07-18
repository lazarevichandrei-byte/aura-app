"use client";

import type { MeetEvent } from "../../lib/meet/types";

type Props = {
  event: MeetEvent | null;
  onClose: () => void;
};

export default function MeetBottomSheet({
  event,
  onClose
}: Props) {

  if (!event) return null;

  return (

    <div
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        background: "#fff",
        borderTopLeftRadius: 26,
        borderTopRightRadius: 26,
        padding: 20,
        zIndex: 999,
        boxShadow: "0 -10px 35px rgba(0,0,0,.18)"
      }}
    >

      <div
        style={{
          width: 60,
          height: 5,
          borderRadius: 999,
          background: "#ddd",
          margin: "0 auto 18px"
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14
        }}
      >

        <div
          style={{
            width: 58,
            height: 58,
            borderRadius: "50%",
            background: "#ECECEC"
          }}
        />

        <div>

          <div
            style={{
              fontWeight: 700,
              fontSize: 18
            }}
          >
            Организатор
          </div>

          <div
            style={{
              color: "#777",
              marginTop: 2
            }}
          >
            Здесь будет имя
          </div>

        </div>

      </div>

      <div
        style={{
          marginTop: 24,
          fontSize: 22,
          fontWeight: 700
        }}
      >
        {event.title}
      </div>

      <div style={{marginTop:10}}>
        📍 {event.place}
      </div>

      <div style={{marginTop:6}}>
        📅 {new Date(event.starts_at).toLocaleString()}
      </div>

      <div
        style={{
          marginTop:18,
          color:"#555",
          lineHeight:1.6
        }}
      >
        {event.description}
      </div>

      <div
        style={{
          display:"flex",
          gap:12,
          marginTop:24
        }}
      >

        <button
          style={{
            flex:1,
            height:50,
            borderRadius:16,
            border:"none",
            background:"#7C3AED",
            color:"#fff",
            fontWeight:700,
            cursor:"pointer"
          }}
        >
          💜 Присоединиться
        </button>

        <button
          style={{
            flex:1,
            height:50,
            borderRadius:16,
            border:"1px solid #ddd",
            background:"#fff",
            cursor:"pointer"
          }}
        >
          👤 Профиль
        </button>

      </div>

    </div>

  );

}