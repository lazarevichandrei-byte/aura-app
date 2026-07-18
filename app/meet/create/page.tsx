"use client";

import {
  useState,
  useEffect
} from "react";
import {
  useRouter,
  useSearchParams
} from "next/navigation";
import { ArrowLeft2 } from "iconsax-react";
import PageWrapper from "../../../components/PageWrapper";
import { MEET_CATEGORIES } from "../../../lib/meet/categories";
import { supabase } from "../../../lib/supabase";
import { createMeetEvent } from "../../../lib/meet/api";
import PeopleSelector from "../../../components/meet/PeopleSelector";
import LocationCard from "../../../components/meet/LocationCard";
export default function CreateMeetPage() {
    

  const router = useRouter();
  

  const [title,setTitle] =
useState("");

const [description,setDescription] =
useState("");

const [place,setPlace] =
useState("");

const [latitude,setLatitude] =
useState<number | null>(null);

const [longitude,setLongitude] =
useState<number | null>(null);

const [city,setCity] =
useState("");

const [date,setDate] =
useState("");

const [time,setTime] =
useState("");

const [maxPeople,setMaxPeople] =
useState(1);

const [loading,setLoading] =
useState(false);

  const [category,setCategory] = useState("coffee");

  const [showAllCategories,setShowAllCategories] =
useState(false);

useEffect(() => {

  const raw =
    sessionStorage.getItem("meet_location");

  if (!raw) return;

  try {

    const data = JSON.parse(raw);

    setPlace(data.title || "");
    setCity(data.address || "");
    setLatitude(data.lat ?? null);
    setLongitude(data.lng ?? null);

    sessionStorage.removeItem("meet_location");

  } catch {

    sessionStorage.removeItem("meet_location");

  }

}, []);

  

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

      latitude,

longitude,

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

        {/* Название встречи */}

        <div style={labelStyle}>
          Название встречи
        </div>

        <input
value={title}
onChange={(e)=>
setTitle(e.target.value)
}
placeholder="Например: Вечерний кофе ☕"
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

          {(showAllCategories
  ? MEET_CATEGORIES
  : MEET_CATEGORIES.slice(0,3)
).map(item => (

            <div

              key={item.id}

              onClick={()=>
                setCategory(item.id)
              }

              style={{

                padding:"7px 12px",

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

                fontSize:13,

                border:"1px solid #E8EEF6",

              }}
            >
              {item.icon} {item.name}
            </div>

            


  

          ))}


          <div

onClick={()=>
setShowAllCategories(
!showAllCategories
)
}

style={{

padding:"7px 12px",

borderRadius:999,

cursor:"pointer",

background:"#fff",

border:"1px solid #E8EEF6",

fontSize:13,

fontWeight:600

}}

>

{
showAllCategories
? "➖ Скрыть"
: "➕ Еще"
}

</div>

        </div>

        {/* О встрече */}

        <div
          style={{
            ...labelStyle,
            marginTop:24
          }}
        >
          О встрече
        </div>

        <textarea

value={description}

onChange={(e)=>
setDescription(e.target.value)
}

placeholder={`Например:
Выпьем кофе,погуляем
и познакомимся ☕`}

style={{
...inputStyle,
minHeight:90,
resize:"none",
paddingTop:14
}}
/>

        

        <div
style={{
display:"flex",
gap:12,
marginTop:24
}}
>

<div
style={{
flex:1
}}
>

<div style={labelStyle}>
📅 Дата
</div>

<input

type="date"

value={date}

onChange={(e)=>
setDate(e.target.value)
}

style={inputStyle}

/>

</div>

<div
style={{
flex:1
}}
>

<div style={labelStyle}>
🕒 Время
</div>

<input

type="time"

value={time}

onChange={(e)=>
setTime(e.target.value)
}

style={inputStyle}

/>

</div>

</div>

        <div
style={{
...labelStyle,
marginTop:24
}}
>
Где встречаемся
</div>

<LocationCard

  place={place}

  city={city}

  onMapClick={() => {

    router.push("/meet/location");

  }}

  onCurrentLocationClick={() => {

    if (!navigator.geolocation) {

      alert("Геолокация не поддерживается");

      return;

    }

    navigator.geolocation.getCurrentPosition(

      (position) => {

        setLatitude(
          position.coords.latitude
        );

        setLongitude(
          position.coords.longitude
        );

        setPlace("Моё местоположение");

        setCity("Определяется...");

      },

      () => {

        alert("Не удалось получить геолокацию");

      }

    );

  }}

/>

        {/* Участники */}

        <div

style={{

...labelStyle,

marginTop:24

}}

>

Количество участников

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
? "⏳ Создаем..."
: "🚀 Создать встречу"
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

  borderRadius:18,
  
  padding:"0 16px",

  background:"#fff",

  fontSize:15,


boxShadow:"0 2px 8px rgba(0,0,0,.03)",

  boxSizing:"border-box" as const

};