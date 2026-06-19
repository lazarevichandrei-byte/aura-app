"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft2 } from "iconsax-react";
import PageWrapper from "../components/PageWrapper";

export default function SupportPage() {

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
              cursor:"pointer"
            }}
          >
            <ArrowLeft2
              size="28"
              color="#2E7BFF"
            />
          </div>

          <div
            style={{
              marginLeft:14,
              fontSize:24,
              fontWeight:700
            }}
          >
            Поддержка
          </div>
        </div>

        <p style={descriptionStyle}>
          Свяжитесь с нами если возникли вопросы
          или проблемы с приложением.
        </p>

        <div style={cardStyle}>
          support@aura-app.com
        </div>

        <div style={cardStyle}>
          Telegram: @AuraSupport
        </div>

      </div>
    </PageWrapper>
  );
}

const descriptionStyle = {
  color:"#7B8595",
  fontSize:14,
  lineHeight:1.5,
  marginBottom:20
};

const cardStyle = {
  background:"#fff",
  borderRadius:"18px",
  padding:"18px",
  marginBottom:"14px",
  boxShadow:"0 4px 14px rgba(0,0,0,.04)"
};