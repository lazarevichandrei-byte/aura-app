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
            fontSize: 30,
            fontWeight: 700
          }}
        >
          📍 Встречи
        </div>

        <div
          style={{
            marginTop: 6,
            color: "#7B8595",
            fontSize: 14
          }}
        >
          Найдите интересные встречи рядом или создайте свою.
        </div>

        <div
          style={{
            display: "flex",
            gap: 10,
            overflowX: "auto",
            marginTop: 24,
            paddingBottom: 4
          }}
        >

          {categories.map((item) => (

            <div
              key={item}
              style={{
                whiteSpace: "nowrap",
                padding: "10px 18px",
                borderRadius: 999,
                background:
                  item === "Все"
                    ? "#2F80FF"
                    : "#fff",
                color:
                  item === "Все"
                    ? "#fff"
                    : "#333",
                fontWeight: 600,
                boxShadow:
                  "0 2px 10px rgba(0,0,0,.05)"
              }}
            >
              {item}
            </div>

          ))}

        </div>

        <div

          onClick={()=>{
            alert("Создание встречи скоро подключим 🚀");
          }}

          style={{

            marginTop:30,

            height:58,

            borderRadius:18,

            background:
              "linear-gradient(135deg,#2F80FF,#56CCF2)",

            color:"#fff",

            display:"flex",
            justifyContent:"center",
            alignItems:"center",

            fontSize:17,
            fontWeight:700,

            cursor:"pointer"

          }}
        >
          ＋ Создать встречу
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