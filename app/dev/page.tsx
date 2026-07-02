"use client";

import { useState } from "react";

import { useNotification } from "../../components/NotificationContext";
import AuraLoader from "../../components/AuraLoader"; 
import BottomSheet from "../../components/BottomSheet";
import AuraSkeleton from "../../components/AuraSkeleton";

export default function DevPage() {

  const {
    success,
    error,
    warning,
    info
  } = useNotification();

  const [showLoader, setShowLoader] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);

  return (

    <div
      style={{
        minHeight: "100vh",
        background: "#F5F7FB",
        padding: 24
      }}
    >

      <h1
        style={{
          marginBottom: 24
        }}
      >
        AURA Developer
      </h1>

      <button

        onClick={() => {

          success(
            "Успешно",
            "Профиль сохранён"
          );

          setTimeout(() => {

            error(
              "Ошибка",
              "Не удалось сохранить"
            );

          },300);

          setTimeout(() => {

            warning(
              "Внимание",
              "Заполните возраст"
            );

          },600);

          setTimeout(() => {

            info(
              "Информация",
              "Добро пожаловать!"
            );

          },900);

        }}

        style={{

          width:"100%",

          height:60,

          border:"none",

          borderRadius:16,

          background:"#2F80FF",

          color:"#fff",

          fontSize:18,

          fontWeight:600,

          cursor:"pointer"

        }}

      >

        Проверить уведомления

      </button>

      <button

        onClick={() => {

          setShowLoader(true);

          setTimeout(() => {

            setShowLoader(false);

          },3000);

        }}

        style={{

          marginTop:16,

          width:"100%",

          height:60,

          border:"none",

          borderRadius:16,

          background:"#111827",

          color:"#fff",

          fontSize:18,

          fontWeight:600,

          cursor:"pointer"

        }}

      >

        Проверить Loader

        

      </button>


      <button

  onClick={() => {

    setShowSheet(true);

  }}

  style={{

    marginTop:16,

    width:"100%",

    height:60,

    border:"none",

    borderRadius:16,

    background:"#7C3AED",

    color:"#fff",

    fontSize:18,

    fontWeight:600,

    cursor:"pointer"

  }}

>

  Проверить Bottom Sheet

</button>

<button

  onClick={() => {

    setShowSkeleton(!showSkeleton);

  }}

  style={{

    marginTop:16,

    width:"100%",

    height:60,

    border:"none",

    borderRadius:16,

    background:"#6B7280",

    color:"#fff",

    fontSize:18,

    fontWeight:600,

    cursor:"pointer"

  }}

>

  Проверить Skeleton

</button>
      

      {showLoader && (

        <div
          style={{
            marginTop:40,
            display:"flex",
            justifyContent:"center"
          }}
        >

          <AuraLoader />
          

        </div>

      )}


      

      {showSkeleton && (

  <div
    style={{
      marginTop: 40,
      display: "flex",
      flexDirection: "column",
      gap: 20
    }}
  >

    <AuraSkeleton
      width={90}
      height={90}
      radius={999}
    />

    <AuraSkeleton
      width={180}
      height={24}
    />

    <AuraSkeleton />

    <AuraSkeleton width="75%" />

    <AuraSkeleton width="55%" />

    <AuraSkeleton
      height={56}
      radius={18}
    />

    <AuraSkeleton
      height={220}
      radius={28}
    />

  </div>

)}


      <BottomSheet

      

  open={showSheet}

  onClose={() => setShowSheet(false)}

>

  <h2
    style={{
      margin:0,
      textAlign:"center"
    }}
  >
    Bottom Sheet
  </h2>

  <p
    style={{
      textAlign:"center",
      color:"#6B7280",
      marginTop:12
    }}
  >
    Это новый универсальный Bottom Sheet.
  </p>


  

  <button

    onClick={() => setShowSheet(false)}

    style={{

      marginTop:24,

      width:"100%",

      height:54,

      border:"none",

      borderRadius:16,

      background:"#2F80FF",

      color:"#fff",

      fontWeight:600

    }}

  >

    Закрыть

  </button>

</BottomSheet>

    </div>

    

  );
  

}
