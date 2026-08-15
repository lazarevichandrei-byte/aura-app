"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft2 } from "iconsax-react";
import PageWrapper from "../../components/PageWrapper";
import { useNotification } from "../../components/NotificationContext";
import { getTelegramInitData } from "../../lib/telegram-init-data";
import {useI18n} from "../../components/I18nProvider";

export default function SupportPage() {
  const {t}=useI18n();

  const router = useRouter();

  const {
  success,
  error,
  warning
} = useNotification();

  const [category,setCategory] =
useState("bug");

const [message,setMessage] =
useState("");

const [sending,setSending] =
useState(false);

async function sendTicket(){

  if(!message.trim()){

  warning(
    t("common.error"),
    t("support.required")
  );

  return;

}

  setSending(true);

  try {
    const initData = await getTelegramInitData();
    if(!initData) throw new Error("TELEGRAM_AUTH_REQUIRED");

    const response = await fetch("/api/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initData, category, message })
    });
    const result = await response.json().catch(() => null);
    if(!response.ok || !result?.ok) throw new Error(result?.error || "SUPPORT_FAILED");
  } catch {
    error(
      t("common.error"),
      t("support.sendFailed")
    );
    return;
  } finally {
    setSending(false);
  }

  success(
  t("support.sent"),
  t("support.sentText")
);

setMessage("");
}

  return (
    <PageWrapper>
      <div
        style={{
          minHeight:"100vh",
          background:"var(--app-bg)",
          color:"var(--text-primary)",
          padding:"20px"
        }}
      >

        <div
          style={{
            display:"flex",
            alignItems:"center",
            marginBottom:24
          }}
        >
          <div
            onClick={()=>router.back()}
            style={{
              display:"flex",
              alignItems:"center",
              cursor:"pointer"
            }}
          >
            <ArrowLeft2
              size="28"
              color="var(--brand-primary)"
            />
          </div>

          <div
            style={{
              marginLeft:14,
              fontSize:24,
              fontWeight:700
            }}
          >
            {t("support.title")}
          </div>
        </div>

        <p style={descriptionStyle}>
          {t("support.subtitle")}
        </p>

        <div style={cardStyle}>
          support@aura-app.com
        </div>


        <div style={cardStyle}>
          Telegram: @AuraSupport
        </div>

        <div style={cardStyle}>

  <div
    style={{
      fontWeight:600,
      marginBottom:"12px"
    }}
  >
    {t("support.type")}
  </div>

  <div
    style={{
      display:"flex",
      gap:"8px"
    }}
  >

    <button
      onClick={()=>
        setCategory("bug")
      }
      style={{
        ...chipStyle,
        background:
          category==="bug"
          ? "var(--brand-primary)"
          : "#F3F5F8",

        color:
          category==="bug"
          ? "#fff"
          : "#111"
      }}
    >
      🐞 {t("support.bug")}
    </button>

    <button
      onClick={()=>
        setCategory("idea")
      }
      style={{
        ...chipStyle,
        background:
          category==="idea"
          ? "var(--brand-primary)"
          : "#F3F5F8",

        color:
          category==="idea"
          ? "#fff"
          : "#111"
      }}
    >
      💡 {t("support.idea")}
    </button>

    <button
      onClick={()=>
        setCategory("other")
      }
      style={{
        ...chipStyle,
        background:
          category==="other"
          ? "var(--brand-primary)"
          : "#F3F5F8",

        color:
          category==="other"
          ? "#fff"
          : "#111"
      }}
    >
      💬 {t("support.other")}
    </button>

  </div>

</div>

<div style={cardStyle}>

  <div
    style={{
      fontWeight:600,
      marginBottom:"12px"
    }}
  >
    {t("support.message")}
  </div>

  <textarea
    value={message}
    onChange={(e)=>
      setMessage(
        e.target.value
      )
    }
    placeholder={t("support.placeholder")}
    style={{
      width:"100%",
      minHeight:"140px",
      border:"none",
      outline:"none",
      resize:"none",
      background:"transparent"
    }}
  />

</div>

<button
  onClick={sendTicket}
  disabled={sending}
  style={{
    width:"100%",
    height:"56px",

    border:"none",
    borderRadius:"18px",

    color:"var(--text-inverse)",
    fontWeight:600,

    background:
      "var(--primary)"
  }}
>
  {
    sending
      ? t("support.sending")
      : t("support.send")
  }
</button>

      </div>
    </PageWrapper>
  );
}



const descriptionStyle = {
  color:"var(--text-secondary)",
  fontSize:14,
  lineHeight:1.5,
  marginBottom:20
};

const cardStyle = {
  background:"var(--surface)",
  border:"1px solid var(--border-subtle)",
  borderRadius:"18px",
  padding:"18px",
  marginBottom:"14px",
  boxShadow:"0 4px 14px rgba(0,0,0,.04)"
};

const chipStyle = {
  border:"none",
  padding:"10px 14px",
  borderRadius:"12px",
  cursor:"pointer"
};
