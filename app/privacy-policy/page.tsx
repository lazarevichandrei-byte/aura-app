"use client";

import { useRouter } from "next/navigation";

export default function PrivacyPolicyPage() {
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

        <h1>Политика конфиденциальности</h1>

        <p>
          Мы храним только данные,
          необходимые для работы сервиса.
        </p>

        <p>
          Личная информация не передается
          третьим лицам без согласия пользователя.
        </p>

        <p>
          Пользователь может запросить удаление
          своего аккаунта и данных.
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