import type { CSSProperties } from "react";
import type { MeetEvent } from "../../lib/meet/types";

type Props = {
  event: MeetEvent;
  expanded: boolean;
};

export default function MeetCard({ event, expanded }: Props) {
  const buttonStyle: CSSProperties = {
    width: "100%",
    height: 52,
    borderRadius: 16,
    border: "1px solid #E5E7EB",
    background: "#fff",
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
    marginBottom: 12,
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "#E5E7EB",
            flexShrink: 0,
          }}
        />

        <div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            Александр
          </div>

          <div
            style={{
              fontSize: 14,
              color: "#10B981",
              marginTop: 2,
            }}
          >
            ● Онлайн
          </div>
        </div>
      </div>

      <h2
        style={{
          margin: 0,
          fontSize: 22,
          fontWeight: 700,
        }}
      >
        {event.title}
      </h2>

      <div style={{ marginTop: 16 }}>📍 {event.place}</div>

      <div style={{ marginTop: 10 }}>
        📅 {new Date(event.starts_at).toLocaleString()}
      </div>

      <div style={{ marginTop: 10 }}>👥 2 из 5 участников</div>

      {event.description && (
        <p
          style={{
            marginTop: 18,
            color: "#555",
            lineHeight: 1.6,
          }}
        >
          {event.description}
        </p>
      )}

      <button
        style={{
          marginTop: 22,
          width: "100%",
          height: 56,
          borderRadius: 18,
          border: "none",
          background: "#7C3AED",
          color: "#fff",
          fontSize: 17,
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        💜 Присоединиться
      </button>

      {expanded && (
        <div
          style={{
            marginTop: 28,
            borderTop: "1px solid #ECECEC",
            paddingTop: 24,
          }}
        >
          <button style={buttonStyle}>👤 Посмотреть профиль</button>

          <button style={buttonStyle}>💬 Написать организатору</button>

          <button style={buttonStyle}>📤 Поделиться встречей</button>

          <button
            style={{
              ...buttonStyle,
              color: "#DC2626",
            }}
          >
            🚩 Пожаловаться
          </button>
        </div>
      )}
    </>
  );
}