"use client";

import { useRouter } from "next/navigation";

export default function MeetLocationPage() {

  const router = useRouter();

  return (

    <div
      style={{
        minHeight:"100vh",
        background:"#F5F7FB",
        display:"flex",
        justifyContent:"center",
        alignItems:"center",
        flexDirection:"column",
        gap:20
      }}
    >

      <div
        style={{
          fontSize:64
        }}
      >
        🗺
      </div>

      <div
        style={{
          fontSize:24,
          fontWeight:700
        }}
      >
        Выбор места
      </div>

      <div
        style={{
          color:"#7B8595",
          textAlign:"center",
          lineHeight:1.6
        }}
      >
        Здесь скоро появится карта
        <br/>
        для выбора места встречи.
      </div>

      <button

        onClick={()=>router.back()}

        style={{

          width:180,
          height:52,

          border:"none",

          borderRadius:16,

          background:
            "linear-gradient(135deg,#2F80FF,#56CCF2)",

          color:"#fff",

          fontWeight:700,

          cursor:"pointer"

        }}

      >
        Назад
      </button>

    </div>

  );

}