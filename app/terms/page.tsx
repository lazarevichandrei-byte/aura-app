"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft2 } from "iconsax-react";
import PageWrapper from "../../components/PageWrapper";

export default function TermsPage() {

  const router = useRouter();

  return (
    <PageWrapper>
      <div
  style={{
    minHeight:"100vh",
    background:"#F5F7FB",
    padding:"20px",
    paddingBottom:"120px",
    overflowY:"auto"
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
            Условия использования
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
          Правила использования приложения AURA.
        </p>

        <div style={cardStyle}>

          <div style={textStyle}>
            Используя приложение AURA, вы соглашаетесь соблюдать правила сервиса и уважительно относиться к другим пользователям.
            <br /><br />

            Пользователям запрещается публиковать незаконный контент, распространять спам, заниматься мошенничеством, выдавать себя за других людей или использовать сервис в целях нарушения законодательства.
            <br /><br />

            Администрация AURA оставляет за собой право ограничить доступ к сервису или удалить аккаунт пользователя при нарушении правил платформы.
            <br /><br />

            Использование приложения осуществляется на собственный риск пользователя. AURA предоставляет платформу для знакомств и общения, но не несёт ответственности за действия других пользователей.
            <br /><br />

            Продолжая пользоваться приложением, вы подтверждаете согласие с данными условиями использования.

            
          </div>

        </div>

      </div>
    </PageWrapper>
  );
}

const cardStyle = {
  background:"#fff",
  borderRadius:"18px",
  padding:"20px",
  boxShadow:"0 4px 14px rgba(0,0,0,.04)"
};

const textStyle = {
  fontSize:"14px",
  lineHeight:1.8,
  color:"#394150"
};

