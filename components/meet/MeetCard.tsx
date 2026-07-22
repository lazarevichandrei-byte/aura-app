import type { CSSProperties } from "react";
import type { MeetEvent } from "../../lib/meet/types";
import { useRouter } from "next/navigation";
import { createChatIfNotExists } from "../../lib/chat/api";

import { useState } from "react";
import { getOnlineStatus } from "../../lib/user/getOnlineStatus";
import MeetManageSheet from "./MeetManageSheet";
import DeleteMeetSheet from "./DeleteMeetSheet";
type Props = {
  event: MeetEvent;
  expanded: boolean;
  currentUserId: string;
  onJoin: (id: string) => Promise<void>;
  onLeave: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export default function MeetCard({
  event,
  expanded,
  currentUserId,
  onJoin,
  onLeave,
  onDelete,
}: Props) {

  const router = useRouter();

  const organizerName = event.users?.name || "Организатор";
  const organizerAvatar = event.users?.avatar_url;

  const isParticipant =
    !!currentUserId &&
    (event.meet_participants ?? []).some(
      (participant) => participant.users.id === currentUserId
    );

const isFull =
  (event.meet_participants?.length ?? 0) >= event.max_people;

  const isCreator =
  currentUserId === event.users?.id;

  const [manageOpen, setManageOpen] = useState(false);
const [deleteOpen, setDeleteOpen] = useState(false);
  

  const eventDate = new Date(event.starts_at).toLocaleString("ru-RU", {
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
});

const onlineStatus = getOnlineStatus(event.users ?? {});

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
    gap: 12,
    marginBottom: expanded ? 12 : 10,
  }}
>
        {organizerAvatar ? (
          <img
            src={organizerAvatar}
            alt={`Фото ${organizerName}`}
            style={{
              width: expanded ? 46 : 42,
              height: expanded ? 46 : 42,
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
              fontSize: 17,
              fontWeight: 700,
              lineHeight: 1.2,
            }}
          >
            {organizerName}
          </div>

          {expanded && (
  <div
    style={{
      fontSize: 12,
      color: onlineStatus.color,
      marginTop: 1,
    }}
  >
    ● {onlineStatus.text}
  </div>
)}
        </div>
      </div>

      <h2
        style={{
          margin: 0,
          fontSize: expanded ? 20 : 19,
fontWeight: 700,
lineHeight: 1.25,
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
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  }}
>
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 6,
      padding: "6px 10px",
      background: "#F5F7FA",
      borderRadius: 12,
      fontSize: 13,
      color: "#444",
      fontWeight: 500,
    }}
  >
    📍 {event.place}
  </div>

  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 6,
      padding: "6px 10px",
      background: "#F5F7FA",
      borderRadius: 12,
      fontSize: 13,
      color: "#444",
      fontWeight: 500,
    }}
  >
    📅 {eventDate}
  </div>
</div>

      {expanded && (
  <>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginTop: 14,
        marginBottom: 8,
      }}
    >
      {event.meet_participants?.slice(0, 5).map((participant, index) => (
        <img
          key={participant.users.id}
          src={participant.users.avatar_url || "/avatar-placeholder.png"}
          alt={participant.users.name}
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            objectFit: "cover",
            marginLeft: index === 0 ? 0 : -12,
            border: "2px solid #fff",
            background: "#F3F4F6",
          }}
        />
      ))}

      {(event.meet_participants?.length ?? 0) > 5 && (
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: "#F3F4F6",
            display: "grid",
            placeItems: "center",
            fontWeight: 600,
            fontSize: 13,
            marginLeft: -12,
            border: "2px solid #fff",
          }}
        >
          +{(event.meet_participants?.length ?? 0) - 5}
        </div>
      )}
    </div>

    <div
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 12,
    padding: "10px 14px",
    background: "#F8F9FB",
    borderRadius: 14,
    border: "1px solid #EEF1F4",
  }}
>
  <div>
    <div
      style={{
        fontSize: 15,
        fontWeight: 700,
        color: "#111827",
      }}
    >
      👥 {event.meet_participants?.length ?? 0} / {event.max_people}
    </div>

    <div
      style={{
        marginTop: 2,
        fontSize: 12,
        color: "#6B7280",
      }}
    >
      участников встречи
    </div>
  </div>

  <div
    style={{
      fontSize: 12,
      fontWeight: 600,
      color: isFull ? "#EF4444" : "#10B981",
      background: isFull ? "#FEE2E2" : "#DCFCE7",
      padding: "5px 10px",
      borderRadius: 999,
    }}
  >
    {isFull ? "Мест нет" : "Есть места"}
  </div>
</div>
  </>
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
          {isCreator ? (
  <div
  onClick={() => setManageOpen(true)}
  style={{
    ...buttonStyle,
    height: 56,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(42,171,238,.15)",
    color: "#2AABEE",
    border: "1px solid rgba(42,171,238,.35)",
    borderRadius: 16,
    marginBottom: 16,
    fontWeight: 600,
    cursor: "pointer",
  }}
>
  ⚙️ Управление встречей
</div>
) : (
  <button
    onClick={() =>
      isParticipant
        ? onLeave(event.id)
        : onJoin(event.id)
    }
    disabled={!isParticipant && isFull}
    style={{
      ...buttonStyle,
      height: 56,
      border: "none",
      background: isParticipant
        ? "#EF4444"
        : "linear-gradient(135deg,#2AABEE,#1C8CEB)",
      color: "#fff",
      fontSize: 17,
      marginBottom: 16,
      opacity: !isParticipant && isFull ? 0.6 : 1,
      cursor:
        !isParticipant && isFull
          ? "not-allowed"
          : "pointer",
    }}
  >
    {isParticipant
      ? "🚪 Покинуть встречу"
      : isFull
      ? "🚫 Нет мест"
      : " Присоединиться"}
  </button>
)}

          <div
  style={{
    display: "flex",
    gap: 10,
    marginBottom: 14,
  }}
>
  <button
    onClick={() =>
      router.push(`/user/${event.users?.id}`)
    }
    style={{
      ...buttonStyle,
      flex: 1,
      marginBottom: 0,
      height: 48,
    }}
  >
    👤 Профиль
  </button>

  <button
    onClick={async () => {
      if (!currentUserId || !event.users?.id) return;

      const chatId = await createChatIfNotExists(
        currentUserId,
        event.users.id
      );

      if (chatId) {
        router.push(`/chat/${chatId}`);
      }
    }}
    style={{
      ...buttonStyle,
      flex: 1,
      marginBottom: 0,
      height: 48,
    }}
  >
    💬 Написать
  </button>
</div>
        </div>
      )}

      <MeetManageSheet
        open={manageOpen}
        onClose={() => setManageOpen(false)}
        onEdit={() => {
          setManageOpen(false);
          router.push(`/meet/edit/${event.id}?tab=map`);
        }}
        onParticipants={() => {
          setManageOpen(false);
          router.push(`/meet/participants/${event.id}?tab=map`);
        }}
        onDelete={() => {
          setManageOpen(false);
          setDeleteOpen(true);
        }}
      />

      <DeleteMeetSheet
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={async () => {
  setDeleteOpen(false);
  await onDelete(event.id);
}}
      />
    </>
  );
}
