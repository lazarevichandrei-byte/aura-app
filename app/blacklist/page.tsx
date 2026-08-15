"use client";

import { useEffect, useState } from "react";
import { ArrowLeft2 } from "iconsax-react";
import { useRouter } from "next/navigation";
import PageWrapper from "../../components/PageWrapper";
import { selection } from "../../lib/haptic";
import { getTelegramInitData } from "../../lib/telegram-init-data";

export default function BlacklistPage(){

  const router = useRouter();

  const [users,setUsers] =
    useState<any[]>([]);

  useEffect(()=>{
    loadBlocked();
  },[]);

  async function loadBlocked(){

  const initData = await getTelegramInitData();
  if(!initData) return;

  const response = await fetch("/api/blocked-users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ initData, action: "list" })
  });
  const result = await response.json().catch(() => null);
  if(response.ok && result?.ok){
    setUsers(result.blockedUsers ?? []);
  }
}

  async function unblock(
  blockedUserId:string
){

  selection();

  const initData = await getTelegramInitData();
  if(!initData) return;

  const response = await fetch("/api/blocked-users", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ initData, blockedUserId })
  });

  if(response.ok) loadBlocked();
  }

  return(
    <PageWrapper>

      <div
        style={{
          minHeight:"100vh",
          background:"var(--app-bg)",
          color:"var(--text-primary)",
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
    color:"var(--text-secondary)",
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
        color: "var(--text-primary)"
      }}
    >
      Чёрный список пуст
    </div>

    <div
      style={{
        marginTop: 4,
        fontSize: 12,
        color: "var(--text-secondary)",
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
      color:"var(--text-secondary)",
      marginTop:"2px"
    }}
  >
    📍 {user?.city || "Город не указан"}
  </div>
</div>

              </div>

              <button
                onClick={()=>
                  unblock(item.blocked_user_id)
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
  background:"var(--surface)",
  border:"1px solid var(--border-subtle)",
  borderRadius:"18px",
  padding:"16px",
  marginBottom:"14px",

  display:"flex",
  justifyContent:"space-between",
  alignItems:"center",

  boxShadow:
    "0 4px 14px rgba(0,0,0,.04)"
};
