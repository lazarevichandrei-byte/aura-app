"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft2 } from "iconsax-react";
import PageWrapper from "../components/PageWrapper";

export default function PrivacyPolicyPage() {

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
            Политика конфиденциальности
          </div>
        </div>

        <p
          style={{
            color:"#7B8595",
            fontSize:14,
            lineHeight:1.5,
            marginBottom:20
          }}
        >
          Мы заботимся о безопасности ваших данных
          и используем их только для работы сервиса.
        </p>

        <div style={cardStyle}>
          <div style={titleStyle}>
            Какие данные хранятся
          </div>

          <div style={subtitleStyle}>
            Имя, возраст, фотографии,
            интересы и другая информация,
            необходимая для работы приложения.
          </div>
        </div>

        <div style={cardStyle}>
          <div style={titleStyle}>
            Передача данных
          </div>

          <div style={subtitleStyle}>
            Мы не продаём и не передаём ваши данные
            третьим лицам без вашего согласия.
          </div>
        </div>

        <div style={cardStyle}>
          <div style={titleStyle}>
            Удаление данных
          </div>

          <div style={subtitleStyle}>
            Вы можете удалить аккаунт,
            после чего связанные данные
            будут удалены согласно правилам сервиса.
          </div>
        </div>

      </div>
    </PageWrapper>
  );
}

const cardStyle = {
  background:"#fff",
  borderRadius:"18px",
  padding:"18px",
  marginBottom:"14px",
  boxShadow:"0 4px 14px rgba(0,0,0,.04)"
};

const titleStyle = {
  fontSize:"15px",
  fontWeight:600
};

const subtitleStyle = {
  marginTop:"6px",
  fontSize:"13px",
  color:"#8B95A7",
  lineHeight:1.5
};