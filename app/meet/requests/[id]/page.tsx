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
import {useI18n} from "../../../../components/I18nProvider";
import { ListSkeleton } from "../../../../components/AppSkeletons";
export default function MeetRequestsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { error: showError, success } = useNotification();
  const {t}=useI18n();

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
    .subscribe((status) => {
      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        void refresh();
      }
    });

  return () => {
    void supabase.removeChannel(channel);
  };
}, [id]);

useEffect(() => {
  const reconcile = () => {
    if (!document.hidden) void refresh();
  };
  document.addEventListener("visibilitychange", reconcile);
  window.addEventListener("online", reconcile);
  return () => {
    document.removeEventListener("visibilitychange", reconcile);
    window.removeEventListener("online", reconcile);
  };
}, [id]);

async function approve(request: any) {
  setRequests((current) => current.filter((item) => item.id !== request.id));
  try {
    await approveJoinRequest(request.id);
    success(t("meet.approved"), t("meet.approvedText"));
  } catch (e) {
    console.error(e);
    showError(t("meet.approveFailed"), t("meet.tryAgain"));
    await refresh();
  }
}

async function reject(request: any) {
  setRequests((current) => current.filter((item) => item.id !== request.id));
  try {
    await rejectJoinRequest(request.id);
    success(t("notifications.requestRejected"), t("meet.rejectedText"));
  } catch (e) {
    console.error(e);
    showError(t("meet.rejectFailed"), t("meet.tryAgain"));
    await refresh();
  }
}

  return (
    <PageWrapper>
    <main
      style={{
        minHeight: "100vh",
        background: "var(--app-bg)",
        color:"var(--text-primary)",
        padding: 20,
      }}
    >
      <PageHeader title={t("meet.requests",{count:requests.length})} onBack={() => router.back()} />

{loading ? (
  <ListSkeleton rows={5} />
) : requests.length === 0 ? (
  <div
    style={{
      color: "var(--text-secondary)",
      fontSize: 15,
    }}
  >
    {t("meet.noRequests")}
  </div>
) : (
  requests.map((request) => (
    <div
      key={request.id}
      style={{
        background: "var(--surface)",
        border:"1px solid var(--border-subtle)",
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
        {request.users?.name ?? t("meet.requestUser")}
      </div>

      <div style={{display:"flex",alignItems:"center",gap:12}}>
        <img src={request.users?.avatar_url || request.users?.photos?.[0] || "/placeholder.jpg"} alt="" style={{width:48,height:48,borderRadius:"50%",objectFit:"cover"}} />
        <div>
      <div
        style={{
          marginTop: 4,
          color: "var(--text-secondary)",
          fontSize: 14,
        }}
      >
        {request.users?.city} • {t("account.years",{age:request.users?.age ?? "—"})}
      </div>
      <button onClick={()=>router.push(`/user/${request.user_id}`)} style={{marginTop:8,padding:0,border:0,background:"transparent",color:"var(--primary)",fontWeight:600}}>{t("meet.openProfileAction")}</button>
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
      ✅ {t("meet.accept")}
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
      ❌ {t("meet.reject")}
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
