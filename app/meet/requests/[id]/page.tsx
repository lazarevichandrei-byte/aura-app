"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft2 } from "iconsax-react";
import {
  loadMeetJoinRequests,
  approveJoinRequest,
  rejectJoinRequest,
  joinMeetEvent,
} from "../../../../lib/meet/api";
import { useNotification } from "../../../../components/NotificationContext";
import PageWrapper from "../../../../components/PageWrapper";
export default function MeetRequestsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { error: showError } = useNotification();

const [requests, setRequests] = useState<any[]>([]);
const [loading, setLoading] = useState(true);

async function refresh() {
  setLoading(true);

  try {
    const data = await loadMeetJoinRequests(id);
    setRequests(data);
  } finally {
    setLoading(false);
  }
}

useEffect(() => {
  refresh();
}, [id]);

async function approve(request: any) {
  try {
    await approveJoinRequest(request.id);

    await joinMeetEvent(
      request.event_id,
      request.user_id
    );

    await refresh();
  } catch (e) {
    console.error(e);
    showError("Не удалось одобрить заявку", "Попробуйте ещё раз.");
  }
}

async function reject(request: any) {
  try {
    await rejectJoinRequest(request.id);

    await refresh();
  } catch (e) {
    console.error(e);
    showError("Не удалось отклонить заявку", "Попробуйте ещё раз.");
  }
}

  return (
    <PageWrapper>
    <main
      style={{
        minHeight: "100vh",
        background: "#F5F7FB",
        padding: 20,
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <button
          type="button"
          aria-label="Назад"
          onClick={() => router.back()}
          style={{
            width: 40,
            height: 40,
            display: "grid",
            placeItems: "center",
            borderRadius: "50%",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          <ArrowLeft2 size="24" color="#2F80FF" />
        </button>

      <h1
        style={{
          fontSize: 26,
          fontWeight: 700,
          margin: 0,
        }}
      >
        📨 Заявки
      </h1>
      </header>

      <div
        style={{
          color: "#6B7280",
          fontSize: 15,
        }}
      >
        ID встречи:
      </div>

     <div
  style={{
    marginTop: 6,
    fontWeight: 600,
    marginBottom: 24,
  }}
>
  {id}
</div>

{loading ? (
  <div>Загрузка...</div>
) : requests.length === 0 ? (
  <div
    style={{
      color: "#6B7280",
      fontSize: 15,
    }}
  >
    Пока нет заявок
  </div>
) : (
  requests.map((request) => (
    <div
      key={request.id}
      style={{
        background: "#fff",
        borderRadius: 18,
        padding: 16,
        marginBottom: 14,
        boxShadow: "0 2px 10px rgba(0,0,0,.05)",
      }}
    >
      <div
        style={{
          fontSize: 17,
          fontWeight: 700,
        }}
      >
        {request.users?.name ?? "Пользователь"}
      </div>

      <div
        style={{
          marginTop: 4,
          color: "#6B7280",
          fontSize: 14,
        }}
      >
        {request.users?.city} • {request.users?.age} лет
      </div>

      <div
  style={{
    marginTop: 10,
    fontSize: 13,
    color: "#F59E0B",
    fontWeight: 600,
  }}
>
  Статус: {request.status}
</div>

{request.status === "pending" && (
  <div
    style={{
      display: "flex",
      gap: 10,
      marginTop: 14,
    }}
  >
    <button
      onClick={() => approve(request)}
      style={{
        flex: 1,
        height: 46,
        border: "none",
        borderRadius: 14,
        background: "#10B981",
        color: "#fff",
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      ✅ Одобрить
    </button>

    <button
      onClick={() => reject(request)}
      style={{
        flex: 1,
        height: 46,
        border: "none",
        borderRadius: 14,
        background: "#EF4444",
        color: "#fff",
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      ❌ Отклонить
    </button>
  </div>
)}
    </div>
  ))
)}
    </main>
    </PageWrapper>
  );
}
