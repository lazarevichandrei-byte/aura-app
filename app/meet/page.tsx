"use client";

import { useRouter } from "next/navigation";
import BottomNav from "../../components/BottomNav";

export default function MeetPage() {

  const router = useRouter();

  const categories = [
    "Все",
    "☕ Кофе",
    "🍽 Ужин",
    "🎬 Кино",
    "🚶 Прогулка",
    "🏃 Спорт"
  ];

  return (

    <div
      style={{
        minHeight: "100vh",
        background: "#F5F7FB",
        padding: "20px",
        paddingBottom: "120px"
      }}
    >

      <div
        style={{
          maxWidth: 430,
          margin: "0 auto"
        }}
      >

        <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  }}
>

    <div>

  <div
    style={{
      fontSize: 24,
      fontWeight: 700,
      color: "#1F2937"
    }}
  >
    📍 Встречи
  </div>

  <div
    style={{
      marginTop: 4,
      color: "#7B8595",
      fontSize: 14
    }}
  >
    Найди компанию рядом
  </div>

</div>

<div

  onClick={()=>{
    alert("Создание встречи скоро подключим 🚀");
  }}

  style={{
    width:46,
    height:46,

    borderRadius:"50%",

    background:
      "linear-gradient(135deg,#2F80FF,#56CCF2)",

    display:"flex",
    justifyContent:"center",
    alignItems:"center",

    color:"#fff",
    fontSize:28,
    cursor:"pointer",

    boxShadow:
      "0 8px 20px rgba(47,128,255,.25)"
  }}
>
  +
</div>

</div>

  <div>

    <div
      style={{
        fontSize: 24,
        fontWeight: 700,
        color: "#1F2937"
      }}
    >
      📍 Встречи
    </div>

    <div
      style={{
        marginTop: 4,
        color: "#7B8595",
        fontSize: 14
      }}
    >
      Найди компанию рядом
    </div>

  </div>

 

        <div

          style={{

            marginTop:28,

            background:"#fff",

            borderRadius:22,

            padding:"40px 20px",

            textAlign:"center",

            boxShadow:
              "0 6px 20px rgba(0,0,0,.05)"

          }}
        >

          <div
            style={{
              fontSize:52
            }}
          >
            📍
          </div>

          <div
            style={{
              marginTop:18,
              fontSize:20,
              fontWeight:700
            }}
          >
            Пока нет встреч
          </div>

          <div
            style={{
              marginTop:8,
              color:"#7B8595",
              lineHeight:1.6,
              fontSize:14
            }}
          >
            Создай первую встречу
            <br/>
            и люди рядом смогут к тебе присоединиться.
          </div>

        </div>

      </div>

      <BottomNav/>

    </div>

  );

}