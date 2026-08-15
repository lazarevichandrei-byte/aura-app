"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft2 } from "iconsax-react";
import PageWrapper from "../../components/PageWrapper";
import {useI18n} from "../../components/I18nProvider";

export default function PrivacyPolicyPage() {
  const {t}=useI18n();

  const router = useRouter();

  return (
    <PageWrapper>
      <div
  style={{
    minHeight:"100vh",
    background:"var(--app-bg)",
    color:"var(--text-primary)",
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
              color="var(--brand-primary)"
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
            {t("legal.privacyTitle")}
          </div>
        </div>

        <p
          style={{
            color:"var(--text-secondary)",
            fontSize:14,
            lineHeight:1.5,
            marginBottom:20
          }}
        >
          {t("legal.privacySubtitle")}
        </p>

        <div style={cardStyle}>

          <div style={textStyle}>
            AURA уважает конфиденциальность пользователей и принимает меры для защиты персональных данных.
            <br /><br />

            В приложении могут храниться данные профиля пользователя, включая имя, возраст, фотографии, интересы и другую информацию, необходимую для работы сервиса.
            <br /><br />

            Данные используются исключительно для функционирования приложения, подбора пользователей, отображения профилей и обеспечения работы системы знакомств.
            <br /><br />

            Мы не продаём и не передаём персональные данные третьим лицам без согласия пользователя, за исключением случаев, предусмотренных законодательством.
            <br /><br />

            Пользователь имеет право запросить удаление аккаунта и связанных данных через настройки приложения.
            <br /><br />

            Продолжая пользоваться приложением AURA, вы соглашаетесь с данной политикой конфиденциальности.
          </div>

        </div>

      </div>
    </PageWrapper>
  );
}

const cardStyle = {
  background:"var(--surface)",
  border:"1px solid var(--border-subtle)",
  borderRadius:"18px",
  padding:"20px",
  boxShadow:"0 4px 14px rgba(0,0,0,.04)"
};

const textStyle = {
  fontSize:"14px",
  lineHeight:1.8,
  color:"var(--text-secondary)"
};
