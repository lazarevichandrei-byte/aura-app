"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  loadMeetJoinRequests,
  approveJoinRequest,
  rejectJoinRequest,
} from "../../../../lib/meet/api";
import { useNotification } from "../../../../components/NotificationContext";
import PageWrapper from "../../../../components/PageWrapper";
import PageHeader from "../../../../components/PageHeader";
import { supabase } from "../../../../lib/supabase";
export default function MeetRequestsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { error: showError, success } = useNotification();

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

useEffect(() => {
  const channel = supabase
    .channel(`meet-requests-${id}`)
    .on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "meet_join_requests",
      filter: `event_id=eq.${id}`,
    }, () => {
      void loadMeetJoinRequests(id).then(setRequests).catch((error) => console.error("REQUESTS REALTIME ERROR:", error));
    })
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}, [id]);

async function approve(request: any) {
  setRequests((current) => current.filter((item) => item.id !== request.id));
  try {
    await approveJoinRequest(request.id);
    success("Заявка одобрена", "Пользователь добавлен к участникам встречи.");
  } catch (e) {
    console.error(e);
    showError("Не удалось одобрить заявку", "Попробуйте ещё раз.");
    await refresh();
  }
}

async function reject(request: any) {
  setRequests((current) => current.filter((item) => item.id !== request.id));
  try {
    await rejectJoinRequest(request.id);
    success("Заявка отклонена", "Пользователь не был добавлен к встрече.");
  } catch (e) {
    console.error(e);
    showError("Не удалось отклонить заявку", "Попробуйте ещё раз.");
    await refresh();
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
      <PageHeader title="Заявки" onBack={() => router.back()} />

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

      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <img src={request.users?.avatar_url || request.users?.photos?.[0] || "/placeholder.jpg"} alt="" style={{width:48,height:48,borderRadius:"50%",objectFit:"cover"}} />
        <div>
      <div
        style={{
          marginTop: 4,
          color: "#6B7280",
          fontSize: 14,
        }}
      >
        {request.users?.city} • {request.users?.age} лет
      </div>
      <button onClick={()=>router.push(`/user/${request.user_id}`)} style={{marginTop:8,padding:0,border:0,background:"transparent",color:"#2F80FF",fontWeight:600}}>Открыть профиль</button>
        </div>
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
