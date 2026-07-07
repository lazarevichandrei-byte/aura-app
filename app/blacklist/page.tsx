"use client";

import { useEffect, useState } from "react";
import { ArrowLeft2 } from "iconsax-react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";
import PageWrapper from "../../components/PageWrapper";
import { selection } from "../../lib/haptic";

export default function BlacklistPage(){

  const router = useRouter();

  const [users,setUsers] =
    useState<any[]>([]);

  useEffect(()=>{
    loadBlocked();
  },[]);

  async function loadBlocked(){

  const tg =
    (window as any)?.Telegram?.WebApp;

  const telegramId =
    tg?.initDataUnsafe?.user?.id;

  if(!telegramId) return;

  const { data: me } =
    await supabase
      .from("users")
      .select("id")
      .eq("telegram_id", telegramId)
      .single();

  if(!me) return;

  const { data: blocked } =
    await supabase
      .from("blocked_users")
      .select("*")
      .eq("user_id", me.id);

  if(!blocked?.length){
    setUsers([]);
    return;
  }

  const ids =
    blocked.map(
      (b:any) => b.blocked_user_id
    );

  const { data: usersData } =
    await supabase
      .from("users")
      .select(`
        id,
        name,
        avatar_url,
        city
      `)
      .in("id", ids);

  const result =
    blocked.map((block:any) => ({
      ...block,
      blocked_user:
        usersData?.find(
          (u:any)=>
            u.id === block.blocked_user_id
        )
    }));

  setUsers(result);
}

  async function unblock(
  blockId:string
){

  selection();

  await supabase
      .from("blocked_users")
      .delete()
      .eq("id", blockId);

    loadBlocked();
  }

  return(
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
            marginBottom:24
          }}
        >

          <div
            onClick={()=>router.back()}
            style={{
              cursor:"pointer"
            }}
          >
            <ArrowLeft2
              size="28"
              color="#2E7BFF"
              variant="Outline"
            />
          </div>

          <div
            style={{
              marginLeft:14,
              fontSize:24,
              fontWeight:700
            }}
          >
            Чёрный список
          </div>

        </div>

        {users.length > 0 && (

<p
  style={{
    color:"#7B8595",
    fontSize:14,
    marginBottom:20
  }}
>
  Пользователи, которых вы заблокировали.
</p>

)}

        {users.length === 0 && (

  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 20px",
      textAlign: "center"
    }}
  >
    <div
      style={{
        fontSize: 30
      }}
    >
      🚫
    </div>

    <div
      style={{
        marginTop: 10,
        fontSize: 16,
        fontWeight: 600,
        color: "#1F2937"
      }}
    >
      Чёрный список пуст
    </div>

    <div
      style={{
        marginTop: 4,
        fontSize: 12,
        color: "#8A8F9B",
        lineHeight: 1.5
      }}
    >
      Здесь будут отображаться
      <br />
      заблокированные пользователи.
    </div>

  </div>

)}

        {users.map((item:any)=>{

          const user =
            item.blocked_user;

          return(

            <div
              key={item.id}
              style={cardStyle}
            >

              <div
                style={{
                  display:"flex",
                  alignItems:"center",
                  gap:"12px"
                }}
              >

                <img
                  src={
                    user?.avatar_url ||
                    "/noavatar.jpg"
                  }
                  style={{
                    width:52,
                    height:52,
                    borderRadius:"50%",
                    objectFit:"cover"
                  }}
                />

                <div>
  <div
    style={{
      fontWeight:600,
      fontSize:"15px"
    }}
  >
    {user?.name}
  </div>

  <div
    style={{
      fontSize:"12px",
      color:"#8B95A7",
      marginTop:"2px"
    }}
  >
    📍 {user?.city || "Город не указан"}
  </div>
</div>

              </div>

              <button
                onClick={()=>
                  unblock(item.id)
                }
                style={{
                  background:"#FF4D4F",
                  color:"#fff",
                  border:"none",
                  borderRadius:"12px",
                  padding:"10px 14px"
                }}
              >
                Разблокировать
              </button>

            </div>

          );
        })}

      </div>

    </PageWrapper>
  );
}

const cardStyle = {
  background:"#fff",
  borderRadius:"18px",
  padding:"16px",
  marginBottom:"14px",

  display:"flex",
  justifyContent:"space-between",
  alignItems:"center",

  boxShadow:
    "0 4px 14px rgba(0,0,0,.04)"
};