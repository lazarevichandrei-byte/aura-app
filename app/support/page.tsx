"use client";

import { useRouter } from "next/navigation";

export default function SupportPage() {
  const router = useRouter();

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>

        <button
          onClick={() => router.back()}
          style={styles.back}
        >
          ← Назад
        </button>

        <h1>Поддержка</h1>

        <p>
          Если у вас возникли проблемы с приложением,
          сообщите нам.
        </p>

        <div style={styles.block}>
          support@aura-app.com
        </div>

        <div style={styles.block}>
          Telegram: @AuraSupport
        </div>

      </div>
    </div>
  );
}

const styles:any = {
  wrapper:{
    minHeight:"100vh",
    background:"#F5F7FB",
    padding:"20px"
  },
  card:{
    maxWidth:"420px",
    margin:"0 auto",
    background:"#fff",
    borderRadius:"24px",
    padding:"20px"
  },
  back:{
    border:"none",
    background:"transparent",
    marginBottom:"20px"
  },
  block:{
    background:"#F7F8FA",
    padding:"16px",
    borderRadius:"14px",
    marginTop:"12px"
  }
};