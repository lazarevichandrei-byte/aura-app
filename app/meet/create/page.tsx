"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft2 } from "iconsax-react";
import PageWrapper from "../../../components/PageWrapper";
import { MEET_CATEGORIES } from "../../../lib/meet/categories";

export default function CreateMeetPage() {

  const router = useRouter();

  const [category,setCategory] = useState("coffee");

  return (

    <PageWrapper>

      <div
        style={{
          minHeight:"100vh",
          background:"#F5F7FB",
          padding:"20px",
          paddingBottom:"120px"
        }}
      >

        {/* HEADER */}

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

        {/* Название */}

        <div style={labelStyle}>
          Название
        </div>

        <input
          placeholder="Например: Кофе вечером"
          style={inputStyle}
        />

        {/* Категории */}

        <div
          style={{
            ...labelStyle,
            marginTop:24
          }}
        >
          Категория
        </div>

        <div
          style={{
            display:"flex",
            flexWrap:"wrap",
            gap:10
          }}
        >

          {MEET_CATEGORIES.map(item=>(

            <div

              key={item.id}

              onClick={()=>
                setCategory(item.id)
              }

              style={{

                padding:"10px 16px",

                borderRadius:999,

                cursor:"pointer",

                background:
                  category===item.id
                  ? "#2F80FF"
                  : "#fff",

                color:
                  category===item.id
                  ? "#fff"
                  : "#222",

                fontWeight:600,

                boxShadow:
                  "0 3px 12px rgba(0,0,0,.05)"

              }}
            >
              {item.icon} {item.name}
            </div>

          ))}

        </div>

        {/* Описание */}

        <div
          style={{
            ...labelStyle,
            marginTop:24
          }}
        >
          Описание
        </div>

        <textarea

          placeholder="Расскажите немного о встрече..."

          style={{
            ...inputStyle,
            minHeight:120,
            resize:"none",
            paddingTop:14
          }}

        />

        {/* Дата */}

        <div
          style={{
            ...labelStyle,
            marginTop:24
          }}
        >
          Дата
        </div>

        <input
          type="date"
          style={inputStyle}
        />

        {/* Время */}

        <div
          style={{
            ...labelStyle,
            marginTop:24
          }}
        >
          Время
        </div>

        <input
          type="time"
          style={inputStyle}
        />

        {/* Место */}

        <div
          style={{
            ...labelStyle,
            marginTop:24
          }}
        >
          Место встречи
        </div>

        <input
          placeholder="Например: Starbucks"
          style={inputStyle}
        />

        {/* Участники */}

        <div
          style={{
            ...labelStyle,
            marginTop:24
          }}
        >
          Максимум участников
        </div>

        <input
          type="number"
          defaultValue={2}
          min={2}
          max={50}
          style={inputStyle}
        />

        {/* Кнопка */}

        <div

          style={{

            marginTop:34,

            height:56,

            borderRadius:18,

            background:
              "linear-gradient(135deg,#2F80FF,#56CCF2)",

            color:"#fff",

            display:"flex",
            justifyContent:"center",
            alignItems:"center",

            fontWeight:700,
            fontSize:17,

            cursor:"pointer"

          }}

        >
          Создать встречу
        </div>

      </div>

    </PageWrapper>

  );

}

const labelStyle = {

  fontSize:15,

  fontWeight:600,

  marginBottom:10

};

const inputStyle = {

  width:"100%",

  height:52,

  border:"none",

  outline:"none",

  borderRadius:16,

  padding:"0 16px",

  background:"#fff",

  fontSize:15,

  boxShadow:"0 3px 12px rgba(0,0,0,.05)",

  boxSizing:"border-box" as const

};