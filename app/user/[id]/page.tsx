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

const [showActions,setShowActions] =
useState(false);

const [showGallery,setShowGallery] =
useState(false);

const [photoIndex,setPhotoIndex] =
useState(0);

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

<>
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

    <div
  style={{
    position:"absolute",
    top:"12px",
    left:"12px",
    right:"12px",

    display:"flex",
    gap:"4px",

    zIndex:20
  }}
>
  {photos.map((_:any,i:number)=>(

    
    <div
      key={i}
      style={{
        flex:1,
        height:"4px",
        borderRadius:"999px",

        background:
          i === photoIndex
            ? "#fff"
            : "rgba(255,255,255,.35)"
      }}
    />
  ))}
</div>

<div
  onClick={() =>
    setShowActions(true)
  }
  style={{
    position:"absolute",
    top:"16px",
    right:"16px",

    width:"42px",
    height:"42px",

    borderRadius:"50%",

    background:"rgba(0,0,0,.35)",

    display:"flex",
    justifyContent:"center",
    alignItems:"center",

    color:"#fff",
    fontSize:"24px",

    zIndex:30,
    cursor:"pointer"
  }}
>
  ⋮
</div>

 <img
  onClick={() =>
    setShowGallery(true)
  }
  src={photos[photoIndex]}
    alt=""
    style={{
      width:"100%",
      height:"320px",
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
        fontSize:"24px",
        fontWeight:700
      }}
    >
      {user.name}, {user.age}
    </div>

    <div
  style={{
    marginTop:"8px",
    opacity:.95,
    fontSize:"15px"
  }}
>
  📍 {user.city} • 2 км от вас
</div>

<div
  style={{
    marginTop:"10px",

    display:"flex",
    gap:"8px"
  }}
>

  <div
    style={{
      background:"rgba(255,255,255,.18)",
      padding:"6px 10px",
      borderRadius:"999px",
      fontSize:"12px"
    }}
  >
    📸 {photos.length} фото
  </div>

  <div
    style={{
      background:"rgba(255,255,255,.18)",
      padding:"6px 10px",
      borderRadius:"999px",
      fontSize:"12px"
    }}
  >
    ⭐ Проверен
  </div>

</div>

<div
  style={{
    marginTop:"6px",

    display:"flex",
    gap:"8px",

    fontSize:"13px"
  }}
>

  <div>
    🟢 Онлайн
  </div>

  <div
    style={{
      opacity:.8
    }}
  >
    ⚡ Активен сегодня
  </div>

</div>

  </div>

</div>

        <div
  style={{
    marginTop:"16px",

    background:"#fff",

    borderRadius:"24px",

    padding:"18px",

    boxShadow:
      "0 6px 18px rgba(0,0,0,.04)"
  }}
>

          

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
            padding:"6px 10px",
borderRadius:"999px",

background:"#F3F7FF",

color:"#2AABEE",

fontSize:"12px",
fontWeight:600
          }}
        >
          {item}
        </div>

      )
    )}
  </div>

</div>

</div>


        </div>

      </div>

    

    {showActions && (

<div
  onClick={() =>
    setShowActions(false)
  }
  style={{
    position:"fixed",
    inset:0,

    background:"rgba(0,0,0,.45)",

    zIndex:999999,

    display:"flex",
    alignItems:"flex-end"
  }}
>

  <div
    onClick={(e)=>
      e.stopPropagation()
    }
    style={{
      width:"100%",
      background:"#fff",

      borderTopLeftRadius:"28px",
      borderTopRightRadius:"28px",

      padding:"24px"
    }}
  >

    <div
      style={{
        textAlign:"center",
        fontSize:"20px",
        fontWeight:700,
        marginBottom:"18px"
      }}
    >
      Действия
    </div>

    <div
      onClick={()=>{
        setShowActions(false);
        setShowReportModal(true);
      }}
      style={actionItem}
    >
      ⚠️ Пожаловаться
    </div>

    <div
      onClick={()=>{
        setShowActions(false);
        setShowBlockModal(true);
      }}
      style={{
        ...actionItem,
        color:"#FF4D4F"
      }}
    >
      🚫 Заблокировать
    </div>

  </div>

</div>

)}

{showGallery && (

<div
  onClick={() =>
    setShowGallery(false)
  }
  style={{
    position:"fixed",
    inset:0,
    background:"#000",
    zIndex:999999,

    display:"flex",
    justifyContent:"center",
    alignItems:"center"
  }}
>

  <img
    src={photos[photoIndex]}
    style={{
      width:"100%",
      height:"100%",
      objectFit:"contain"
    }}
  />

</div>

)}

</>

  );
}
const actionItem = {
  padding:"16px",
  borderRadius:"16px",
  background:"#F5F7FB",
  marginBottom:"10px",
  cursor:"pointer",
  fontWeight:600
};