"use client";

import { useRouter } from "next/navigation";

export default function TermsPage() {
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

        <h1>Условия использования</h1>

        <p>
          Используя приложение AURA,
          пользователь соглашается соблюдать
          правила сервиса.
        </p>

        <p>
          Запрещено размещать оскорбительный,
          незаконный или мошеннический контент.
        </p>

        <p>
          Администрация вправе ограничить доступ
          пользователям, нарушающим правила.
        </p>

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
  }
};