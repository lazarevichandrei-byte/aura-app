import type { CSSProperties } from "react";
import type { MeetEvent } from "../../lib/meet/types";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import { useState, useEffect } from "react";

import {
  sendJoinRequest,
  cancelJoinRequest,
  getJoinRequest,
} from "../../lib/meet/api";
import { getOnlineStatus } from "../../lib/user/getOnlineStatus";
import MeetManageSheet from "./MeetManageSheet";
import { getMeetGuests } from "../../lib/meet/participants";
import MeetDeleteSlider from "./MeetDeleteSlider";
import { meetCountdown } from "../../lib/meet/time";
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
  const guests = getMeetGuests(event);

  const isParticipant =
    !!currentUserId &&
    (event.meet_participants ?? []).some(
      (participant) => participant.users.id === currentUserId
    );

const isFull =
  guests.length >= event.max_people;

const isCreator =
  currentUserId === event.users?.id;

  const [manageOpen, setManageOpen] = useState(false);

const [joinRequest, setJoinRequest] = useState<any>(null);
const [loadingRequest, setLoadingRequest] = useState(false);
  

  const eventDate = new Date(event.starts_at).toLocaleString("ru-RU", {
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
});

const onlineStatus = getOnlineStatus(event.users ?? {});

const [now, setNow] = useState(Date.now());

useEffect(() => {
  const timer = setInterval(() => {
    setNow(Date.now());
  }, 60000);

  return () => clearInterval(timer);
}, []);

const countdown = meetCountdown(event.starts_at, event.expires_at, now);

useEffect(() => {
  if (!currentUserId || isParticipant) return;

  getJoinRequest(event.id, currentUserId)
    .then(setJoinRequest)
    .catch(console.error);
}, [
  currentUserId,
  event.id,
  isParticipant,
]);

const isApproval =
  event.join_type === "approval";

const hasPendingRequest =
  joinRequest?.status === "pending";

const hasRejectedRequest =
  joinRequest?.status === "rejected";

const hasApprovedRequest =
  joinRequest?.status === "approved";

useEffect(() => {
  if (!currentUserId || !isApproval || isCreator) return;
  const handleRequest = (eventPayload: Event) => {
    const payload = (eventPayload as CustomEvent<any>).detail;
    const row = payload?.new || payload?.old;
    if (row?.event_id !== event.id || row?.user_id !== currentUserId) return;
    setJoinRequest(payload.eventType === "DELETE" ? null : payload.new);
  };
  window.addEventListener("aura-meet-request-user", handleRequest);

  return () => {
    window.removeEventListener("aura-meet-request-user", handleRequest);
  };
}, [currentUserId, event.id, isApproval, isCreator]);

  const buttonStyle: CSSProperties = {
    width: "100%",
    height: 52,
    borderRadius: 16,
    border: "1px solid var(--border)",
    background: "var(--surface)",
    color:"var(--text-primary)",
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
              background: "var(--primary-soft)",
              color: "var(--brand-primary)",
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
            color: "var(--text-secondary)",
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
      background: "var(--surface-secondary)",
      borderRadius: 12,
      fontSize: 13,
      color: "var(--text-secondary)",
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
      background: "var(--surface-secondary)",
      borderRadius: 12,
      fontSize: 13,
      color: "var(--text-secondary)",
      fontWeight: 500,
    }}
  >
    📅 {eventDate}
  </div>

  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 6,
      padding: "6px 10px",
      background:
        countdown.urgent
          ? "#FEE2E2"
          : "#ECFDF5",
      color:
        countdown.urgent
          ? "#DC2626"
          : "#059669",
      borderRadius: 12,
      fontSize: 13,
      fontWeight: 700,
    }}
  >
    ⏳ {countdown.text}
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
      {guests.slice(0, 5).map((participant, index) => (
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
            border: "2px solid var(--surface)",
            background: "var(--surface-secondary)",
          }}
        />
      ))}

      {guests.length > 5 && (
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: "var(--surface-secondary)",
            display: "grid",
            placeItems: "center",
            fontWeight: 600,
            fontSize: 13,
            marginLeft: -12,
            border: "2px solid var(--surface)",
          }}
        >
          +{guests.length - 5}
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
    background: "var(--surface-secondary)",
    borderRadius: 14,
    border: "1px solid var(--border-subtle)",
  }}
>
  <div>
    <div
      style={{
        fontSize: 15,
        fontWeight: 700,
        color: "var(--text-primary)",
      }}
    >
      👥 {guests.length} / {event.max_people}
    </div>

    <div
      style={{
        marginTop: 2,
        fontSize: 12,
        color: "var(--text-secondary)",
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
      background: isFull ? "var(--danger-soft)" : "var(--success-soft)",
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
            color: "var(--text-secondary)",
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
  <>
  <div
    onClick={() => setManageOpen(true)}
    style={{
      ...buttonStyle,
      height: 56,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--primary-soft)",
      color: "var(--primary)",
      border: "1px solid var(--primary)",
      borderRadius: 16,
      marginBottom: 16,
      fontWeight: 600,
      cursor: "pointer",
    }}
  >
    ⚙️ Управление встречей
  </div>
  <div style={{marginBottom:16}}>
    <MeetDeleteSlider onDelete={() => onDelete(event.id)} />
  </div>
  </>
) : (
  <>
    <button
      onClick={async () => {
        if (loadingRequest) return;

        if (isParticipant) {
          await onLeave(event.id);
          return;
        }

        if (isFull) return;

        if (!isApproval) {
          await onJoin(event.id);
          return;
        }

        if (hasPendingRequest) {
          setLoadingRequest(true);

          try {
            await cancelJoinRequest(
              event.id,
              currentUserId
            );

            setJoinRequest(null);
          } finally {
            setLoadingRequest(false);
          }

          return;
        }

        setLoadingRequest(true);

        try {
          await sendJoinRequest(
            event.id,
            currentUserId
          );

          const request =
            await getJoinRequest(
              event.id,
              currentUserId
            );

          setJoinRequest(request);
        } finally {
          setLoadingRequest(false);
        }
      }}
      disabled={
        (!isParticipant && isFull) ||
        loadingRequest
      }
      style={{
        ...buttonStyle,
        height: 56,
        border: "none",
        background: isParticipant
          ? "#EF4444"
          : hasPendingRequest
          ? "#F59E0B"
          : "var(--brand-gradient)",
        color: "var(--text-inverse)",
        fontSize: 17,
        marginBottom: 16,
        opacity:
          (!isParticipant && isFull) ||
          loadingRequest
            ? 0.6
            : 1,
        cursor:
          (!isParticipant && isFull) ||
          loadingRequest
            ? "not-allowed"
            : "pointer",
      }}
    >
      {isParticipant
        ? "🚪 Покинуть встречу"
        : isFull
        ? "🚫 Нет мест"
        : isApproval
        ? hasPendingRequest
          ? "❌ Отменить заявку"
          : hasRejectedRequest
          ? "📨 Отправить заявку повторно"
          : "📨 Отправить заявку"
        : "🤝 Присоединиться"}
    </button>

    {isApproval && hasPendingRequest && (
      <div
        style={{
          marginTop: -6,
          marginBottom: 16,
          textAlign: "center",
          color: "#D97706",
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        ⏳ Заявка отправлена. Ожидайте решения организатора.
      </div>
    )}

    {isApproval && hasApprovedRequest && isParticipant && (
      <div style={{marginTop:-6,marginBottom:16,textAlign:"center",color:"#059669",fontSize:14,fontWeight:700}}>
        ✅ Вы участник встречи
      </div>
    )}

    {isApproval && hasRejectedRequest && !isParticipant && (
      <div style={{marginTop:-6,marginBottom:16,textAlign:"center",color:"#DC2626",fontSize:14,fontWeight:600}}>
        Заявка отклонена
      </div>
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

  {(isParticipant || isCreator) && (
  <button
    onClick={async () => {

      const { data: chat, error } =
        await supabase
          .from("chats")
          .select("id")
          .eq("event_id", event.id)
          .maybeSingle();

      if (error) {
        console.error(
          "MEET CHAT LOAD ERROR:",
          error
        );
        return;
      }

      if (!chat) {
        console.error(
          "MEET CHAT NOT FOUND:",
          event.id
        );
        return;
      }

      router.push(`/chat/${chat.id}`);
    }}
    style={{
      ...buttonStyle,
      flex: 1,
      marginBottom: 0,
      height: 48,
    }}
  >
    💬 Чат встречи
  </button>
)}
</div>
  </>
)}
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
  onChat={async () => {
    const { data: chat } = await supabase.from("chats").select("id").eq("event_id", event.id).maybeSingle();
    if (chat) router.push(`/chat/${chat.id}`);
  }}
/>

    </>
  );
}
