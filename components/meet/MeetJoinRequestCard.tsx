"use client";

import { useRouter } from "next/navigation";

export type MeetJoinRequest = {
  id: string;
  event_id: string;
  user_id: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  users: {
    id: string;
    name: string | null;
    age: number | null;
    city: string | null;
    avatar_url: string | null;
    photos: string[] | null;
  } | null;
};

type Props = {
  request: MeetJoinRequest;
  processing: boolean;
  compact?: boolean;
  onApprove: () => void;
  onReject: () => void;
};

export default function MeetJoinRequestCard({
  request,
  processing,
  compact = false,
  onApprove,
  onReject,
}: Props) {
  const router = useRouter();
  const profile = request.users;
  const avatar = profile?.avatar_url || profile?.photos?.[0] || null;
  const name = profile?.name || "Пользователь";
  const profileId = profile?.id || request.user_id;
  const openProfile = () => router.push(`/user/${profileId}`);

  return (
    <article style={{ ...cardStyle, margin: compact ? "0 0 10px" : "14px 4px" }}>
      {!compact && <div style={eyebrowStyle}>👤 Новая заявка на встречу</div>}
      <button type="button" onClick={openProfile} style={profileRowStyle} aria-label={`Открыть профиль: ${name}`}>
        {avatar ? (
          <img src={avatar} alt="" style={avatarStyle} />
        ) : (
          <div style={{ ...avatarStyle, display: "grid", placeItems: "center", background: "#EEF2F7" }}>👤</div>
        )}
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>
            {name}{profile?.age ? `, ${profile.age}` : ""}
          </div>
          {profile?.city && <div style={metaStyle}>{profile.city}</div>}
          {!compact && <div style={{ ...metaStyle, marginTop: 5 }}>Хочет присоединиться к встрече</div>}
        </div>
      </button>

      <button type="button" onClick={openProfile} style={profileButtonStyle}>
        Профиль
      </button>
      <div style={actionsStyle}>
        <button type="button" disabled={processing} onClick={onReject} style={rejectButtonStyle}>
          Отклонить
        </button>
        <button type="button" disabled={processing} onClick={onApprove} style={approveButtonStyle}>
          {processing ? "Обработка…" : "Принять"}
        </button>
      </div>
    </article>
  );
}

const cardStyle = { padding: 16, borderRadius: 20, border: "1px solid #DCE8FF", background: "linear-gradient(180deg,#F8FBFF 0%,#F2F7FF 100%)", boxShadow: "0 6px 18px rgba(47,128,255,.08)" };
const eyebrowStyle = { marginBottom: 12, color: "#2F80FF", fontSize: 13, fontWeight: 700 };
const profileRowStyle = { width: "100%", padding: 0, border: 0, background: "transparent", color: "inherit", textAlign: "left" as const, display: "flex", alignItems: "center", gap: 12, cursor: "pointer" };
const avatarStyle = { width: 48, height: 48, borderRadius: "50%", objectFit: "cover" as const, flexShrink: 0 };
const metaStyle = { marginTop: 2, color: "#7A8699", fontSize: 13 };
const profileButtonStyle = { marginTop: 12, padding: 0, border: 0, background: "transparent", color: "#2F80FF", fontSize: 13, fontWeight: 700, cursor: "pointer" };
const actionsStyle = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 };
const rejectButtonStyle = { height: 42, border: 0, borderRadius: 13, background: "#FFF0F1", color: "#D14343", fontWeight: 700, cursor: "pointer" };
const approveButtonStyle = { height: 42, border: 0, borderRadius: 13, background: "#2F80FF", color: "#fff", fontWeight: 700, cursor: "pointer" };
