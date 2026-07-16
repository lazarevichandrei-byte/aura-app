"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft2 } from "iconsax-react";
import PageWrapper from "../../../components/PageWrapper";

export default function CreateMeetPage() {

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
            marginBottom:28
          }}
        >

          <div

            onClick={()=>router.back()}

            style={{
              cursor:"pointer",
              display:"flex",
              alignItems:"center"
            }}

          >
            <ArrowLeft2
              size="28"
              color="#2F80FF"
            />
          </div>

          <div
            style={{
              marginLeft:14,
              fontSize:24,
              fontWeight:700
            }}
          >
            Создать встречу
          </div>

        </div>

      </div>

    </PageWrapper>

  );

}