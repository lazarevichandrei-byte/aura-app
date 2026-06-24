"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { ArrowLeft2 } from "iconsax-react";

export default function UserProfilePage() {

  const params = useParams();
  const router = useRouter();

  const [user,setUser] = useState<any>(null);

  const [showReportModal,setShowReportModal] =
useState(false);

const [showBlockModal,setShowBlockModal] =
useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser(){

    const { data } = await supabase
      .from("users")
      .select("*")
      .eq("id", params.id)
      .single();

    if(data){
      setUser(data);
    }

  }

  if(!user){
    return (
      <div
        style={{
          minHeight:"100vh",
          background:"#F5F7FB"
        }}
      />
    );
  }

  const photos =
    user.photos?.length
      ? user.photos
      : user.avatar_url
      ? [user.avatar_url]
      : [];

  return (

    <div
      style={{
        minHeight:"100vh",
        background:"#F5F7FB",
        padding:"20px"
      }}
    >

      <div
        style={{
          maxWidth:"420px",
          margin:"0 auto"
        }}
      >

        <div
          style={{
            display:"flex",
            alignItems:"center",
            marginBottom:"20px"
          }}
        >

          <div
            onClick={() => router.back()}
            style={{
              cursor:"pointer"
            }}
          >
            <ArrowLeft2
              size="28"
              color="#2AABEE"
            />
          </div>

        </div>

      <div
  style={{
    position:"relative"
  }}
>

  <img
    src={photos[0]}
    alt=""
    style={{
      width:"100%",
      height:"62vh",
      objectFit:"cover",
      borderRadius:"32px"
    }}
  />

  <div
    style={{
      position:"absolute",
      left:0,
      right:0,
      bottom:0,
      height:"45%",

      borderRadius:"0 0 32px 32px",

      background:`
      linear-gradient(
        to top,
        rgba(0,0,0,.75),
        rgba(0,0,0,.05)
      )`
    }}
  />

  <div
    style={{
      position:"absolute",
      left:"24px",
      bottom:"24px",
      color:"#fff"
    }}
  >

    <div
      style={{
        fontSize:"30px",
        fontWeight:700
      }}
    >
      {user.name}, {user.age}
    </div>

    <div
      style={{
        marginTop:"8px",
        opacity:.95
      }}
    >
      📍 {user.city}
    </div>

  </div>

</div>

        <div
          style={{
            marginTop:"20px"
          }}
        >

          <h2
            style={{
              fontSize:"28px",
              fontWeight:700
            }}
          >
            {user.name}, {user.age}
          </h2>

          <div
            style={{
              color:"#7B8595",
              marginTop:"6px"
            }}
          >
            📍 {user.city}
          </div>

          <div
            style={{
              marginTop:"18px",
              lineHeight:1.5
            }}
          >
<div
  style={{
    fontSize:"18px",
    fontWeight:700,
    marginBottom:"12px"
  }}
>
  О себе
</div>



            {user.bio}
          </div>

          <div
  style={{
    marginTop:"28px"
  }}
>

  <div
    style={{
      fontSize:"18px",
      fontWeight:700,
      marginBottom:"14px"
    }}
  >
    Интересы
  </div>

  <div
    style={{
      display:"flex",
      flexWrap:"wrap",
      gap:"8px"
    }}
  >
    {(user.interests || []).map(
      (item:string) => (

        <div
          key={item}
          style={{
            padding:"8px 12px",
            borderRadius:"999px",
            background:"#EEF5FF",
            color:"#2AABEE",
            fontSize:"13px"
          }}
        >
          {item}
        </div>

      )
    )}
  </div>

</div>
          {/* КНОПКИ */}

<div
  style={{
    marginTop:"18px",

    background:"#fff",

    borderRadius:"24px",

    padding:"22px",

    boxShadow:
      "0 6px 18px rgba(0,0,0,.04)"
  }}
>

  <div
    onClick={() =>
      setShowReportModal(true)
    }
    style={{
      background:"#FFF8F8",
      color:"#FF7A7A",
      padding:"16px 18px",
      borderRadius:"18px",
      marginBottom:"12px",
      cursor:"pointer",
      fontWeight:600
    }}
  >
    ⚠️ Пожаловаться
  </div>

  <div
    onClick={() =>
      setShowBlockModal(true)
    }
    style={{
      background:"#FFF3F3",
      color:"#FF4D4F",
      padding:"16px 18px",
      borderRadius:"18px",
      cursor:"pointer",
      fontWeight:600
    }}
  >
    🚫 Заблокировать
  </div>

</div>

        </div>

      </div>

    </div>

  );
}