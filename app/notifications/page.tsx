"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft2 } from "iconsax-react";
import PageWrapper from "../components/PageWrapper";

export default function NotificationsPage() {

  const router = useRouter();

  return (
    <PageWrapper>
      <div
        style={{
          minHeight:"100vh",
          background:"#F5F7FB",
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
              justifyContent:"center",
              paddingRight:10,
              cursor:"pointer"
            }}
          >
            <ArrowLeft2
              size="28"
              color="#2E7BFF"
              variant="Outline"
            />
          </div>

          <div
            style={{
              marginLeft:14,
              fontSize:24,
              fontWeight:700
            }}
          >
            Уведомления
          </div>

        </div>

        <div style={itemStyle}>
          Звук сообщений
        </div>

        <div style={itemStyle}>
          Вибрация
        </div>

        <div style={itemStyle}>
          Тихий режим
        </div>

      </div>
    </PageWrapper>
  );
}

const itemStyle = {
  background:"#fff",
  padding:"16px",
  borderRadius:"16px",
  marginTop:"12px"
};