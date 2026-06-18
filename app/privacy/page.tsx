"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft2 } from "iconsax-react";
import PageWrapper from "../components/PageWrapper";

export default function PrivacyPage() {

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
            Конфиденциальность
          </div>

        </div>

        <div style={itemStyle}>
          Показывать онлайн
        </div>

        <div style={itemStyle}>
          Показывать "был недавно"
        </div>

        <div style={itemStyle}>
          Скрыть профиль
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