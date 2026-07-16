"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft2 } from "iconsax-react";
import PageWrapper from "../../../components/PageWrapper";
import { MEET_CATEGORIES } from "../../../lib/meet/categories";
import { supabase } from "../../../lib/supabase";
import { createMeetEvent } from "../../../lib/meet/api";
import PeopleSelector from "../../../components/meet/PeopleSelector";
export default function CreateMeetPage() {
    

  const router = useRouter();

  const [title,setTitle] =
useState("");

const [description,setDescription] =
useState("");

const [place,setPlace] =
useState("");

const [city,setCity] =
useState("");

const [date,setDate] =
useState("");

const [time,setTime] =
useState("");

const [maxPeople,setMaxPeople] =
useState(2);

const [loading,setLoading] =
useState(false);

  const [category,setCategory] = useState("coffee");



  async function createMeet(){

  if(loading) return;

  if(
    !title ||
    !date ||
    !time
  ){
    alert("Заполните обязательные поля");
    return;
  }

  setLoading(true);

  try{

    const tg =
      (window as any)
      ?.Telegram
      ?.WebApp;

    const telegramId =
      tg?.initDataUnsafe
      ?.user?.id;

    if(!telegramId){

      alert("Ошибка Telegram");

      return;

    }

    const { data:user } =
      await supabase
        .from("users")
        .select("id")
        .eq(
          "telegram_id",
          telegramId
        )
        .single();

    if(!user){

      alert("Пользователь не найден");

      return;

    }

    await createMeetEvent({

      creator_id:user.id,

      title,

      description,

      category,

      city,

      place,

      latitude:null,

      longitude:null,

      starts_at:
        `${date}T${time}:00`,

      max_people:maxPeople

    });

    router.replace("/meet");

  }catch(err){

  console.error("CREATE MEET ERROR:", err);

  alert(
    JSON.stringify(err)
  );

}

}

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
value={title}
onChange={(e)=>
setTitle(e.target.value)
}
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

value={description}

onChange={(e)=>
setDescription(e.target.value)
}

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

value={date}

onChange={(e)=>
setDate(e.target.value)
}

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

value={time}

onChange={(e)=>
setTime(e.target.value)
}

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

  value={place}

  onChange={(e)=>
    setPlace(e.target.value)
  }

  placeholder="Например: Starbucks"

  style={inputStyle}

/>

<div
  style={{
    ...labelStyle,
    marginTop:24
  }}
>
  Город
</div>

<input

  value={city}

  onChange={(e)=>
    setCity(e.target.value)
  }

  placeholder="Например: Минск"

  style={inputStyle}

/>

        {/* Участники */}

        <div

style={{

...labelStyle,

marginTop:24

}}

>

👥 Участники

</div>

<PeopleSelector

value={maxPeople}

onChange={setMaxPeople}

/>

        {/* Кнопка */}

        <div

  onClick={createMeet}

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
          {
loading
? "Создание..."
: "Создать встречу"
}
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