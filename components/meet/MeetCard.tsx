import type { CSSProperties } from "react";
import type { MeetEvent } from "../../lib/meet/types";

type Props = {
  event: MeetEvent;
  expanded: boolean;
};

export default function MeetCard({ event, expanded }: Props) {
  const organizerName = event.users?.name || "Организатор";
  const organizerAvatar = event.users?.avatar_url;
  const eventDate = new Date(event.starts_at).toLocaleString("ru-RU", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

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
          marginBottom: expanded ? 20 : 12,
        }}
      >
        {organizerAvatar ? (
          <img
            src={organizerAvatar}
            alt={`Фото ${organizerName}`}
            style={{
              width: expanded ? 52 : 44,
              height: expanded ? 52 : 44,
              borderRadius: "50%",
              objectFit: "cover",
              flexShrink: 0,
            }}
          />
        ) : (
          <div
            style={{
              width: expanded ? 52 : 44,
              height: expanded ? 52 : 44,
              borderRadius: "50%",
              background: "#EDE9FE",
              color: "#7C3AED",
              display: "grid",
              placeItems: "center",
              fontSize: expanded ? 20 : 18,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {organizerName.slice(0, 1).toUpperCase()}
          </div>
        )}

        <div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            {organizerName}
          </div>

          {expanded && (
            <div
              style={{
                fontSize: 14,
                color: "#10B981",
                marginTop: 2,
              }}
            >
              ● Онлайн
            </div>
          )}
        </div>
      </div>

      <h2
        style={{
          margin: 0,
          fontSize: expanded ? 22 : 20,
          fontWeight: 700,
        }}
      >
        {event.title}
      </h2>

      {!expanded && event.description && (
        <p
          style={{
            marginTop: 10,
            color: "#555",
            lineHeight: 1.5,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {event.description}
        </p>
      )}

      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          marginTop: 12,
          color: "#555",
          fontSize: 14,
        }}
      >
        <span>📍 {event.place}</span>
        <span>📅 {eventDate}</span>
      </div>

      {expanded && (
        <div style={{ marginTop: 12 }}>👥 2 из {event.max_people} участников</div>
      )}

      {expanded && event.description && (
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

      {expanded && (
        <div
          style={{
            marginTop: 28,
            borderTop: "1px solid #ECECEC",
            paddingTop: 24,
          }}
        >
          <button
            style={{
              ...buttonStyle,
              height: 56,
              border: "none",
              background: "#7C3AED",
              color: "#fff",
              fontSize: 17,
              marginBottom: 16,
            }}
          >
            💜 Присоединиться
          </button>

          <button style={buttonStyle}>👤 Посмотреть профиль</button>

          <button style={buttonStyle}>💬 Написать организатору</button>
        </div>
      )}
    </>
  );
}
