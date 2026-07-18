"use client";

import type { MeetEvent } from "../../lib/meet/types";

type Props = {
  event: MeetEvent | null;
  onClose: () => void;
};

export default function MeetBottomSheet({
  event,
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
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        padding: "18px 20px 26px",
        zIndex: 999,
        boxShadow: "0 -10px 40px rgba(0,0,0,.18)"
      }}
    >

      {/* Drag Handle */}

      <div
        style={{
          width: 58,
          height: 6,
          borderRadius: 999,
          background: "#D6D6D6",
          margin: "0 auto 18px"
        }}
      />

      {/* Header */}

      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "center"
        }}
      >

        <div
          style={{
            width: 68,
            height: 68,
            borderRadius: "50%",
            background:
              "linear-gradient(135deg,#8B5CF6,#6366F1)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "#fff",
            fontSize: 30,
            flexShrink: 0
          }}
        >
          👤
        </div>

        <div style={{ flex: 1 }}>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >

            <div
              style={{
                fontSize: 20,
                fontWeight: 700
              }}
            >
              Александр
            </div>

            <div
              style={{
                color: "#22C55E",
                fontWeight: 600,
                fontSize: 14
              }}
            >
              ● Онлайн
            </div>

          </div>

          <div
            style={{
              marginTop: 6,
              color: "#6B7280",
              fontSize: 14
            }}
          >
            Организатор встречи
          </div>

        </div>

      </div>

      {/* Title */}

      <div
        style={{
          marginTop: 24,
          fontSize: 24,
          fontWeight: 700,
          color: "#111827"
        }}
      >
        {event.title}
      </div>

      {/* Info */}

      <div
        style={{
          marginTop: 18,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          color: "#4B5563",
          fontSize: 15
        }}
      >

        <div>
          📍 {event.place}
        </div>

        <div>
          📅 {new Date(event.starts_at).toLocaleString()}
        </div>

        <div>
          👥 2 из 5 участников
        </div>

      </div>

      {/* Description */}

      {event.description && (

        <div
          style={{
            marginTop: 20,
            color: "#555",
            lineHeight: 1.6,
            fontSize: 15
          }}
        >
          {event.description}
        </div>

      )}

      {/* Join */}

      <button
        style={{
          marginTop: 26,
          width: "100%",
          height: 56,
          border: "none",
          borderRadius: 18,
          background:
            "linear-gradient(135deg,#7C3AED,#8B5CF6)",
          color: "#fff",
          fontWeight: 700,
          fontSize: 17,
          cursor: "pointer",
          boxShadow:
            "0 10px 22px rgba(124,58,237,.35)"
        }}
      >
        💜 Присоединиться
      </button>

    </div>
  );

}