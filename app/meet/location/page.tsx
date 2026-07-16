"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft2 } from "iconsax-react";
import PageWrapper from "../../../components/PageWrapper";
import AuraMap from "../../../components/map/AuraMap";

export default function MeetLocationPage() {

  const router = useRouter();

  return (

    <PageWrapper>

      <div
        style={{
          height:"100vh",
          display:"flex",
          flexDirection:"column",
          background:"#F5F7FB"
        }}
      >

        {/* Header */}

        <div
          style={{
            padding:"20px",
            display:"flex",
            alignItems:"center",
            gap:14
          }}
        >

          <div
            onClick={()=>router.back()}
            style={{
              cursor:"pointer"
            }}
          >
            <ArrowLeft2
              size="28"
              color="#2F80FF"
            />
          </div>

          <div>

            <div
              style={{
                fontSize:22,
                fontWeight:700
              }}
            >
              Выбор места
            </div>

            <div
              style={{
                marginTop:4,
                color:"#7B8595",
                fontSize:13
              }}
            >
              Выберите место встречи
            </div>

          </div>

        </div>

        {/* Поиск */}

        <div
          style={{
            padding:"0 20px 20px"
          }}
        >

          <input

            placeholder="🔍 Поиск кафе, парка..."

            style={{

              width:"100%",

              height:48,

              border:"none",

              outline:"none",

              borderRadius:16,

              padding:"0 16px",

              background:"#fff",

              boxSizing:"border-box"

            }}

          />

        </div>

        {/* Карта */}

        <div
          style={{
            flex:1,
            padding:"0 20px 20px"
          }}
        >

          <AuraMap/>

        </div>

      </div>

    </PageWrapper>

  );

}