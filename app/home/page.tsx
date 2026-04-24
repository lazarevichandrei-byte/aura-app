"use client";

import { useEffect, useState } from "react";
import { motion, animate } from "framer-motion";
import { supabase } from "../../lib/supabase";
import BottomNav from "../../components/BottomNav";

export default function Home() {
  const [users, setUsers] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const [matchedUser, setMatchedUser] = useState<any>(null);
  const [cardKey, setCardKey] = useState(0);

  const currentUserId = 123; // потом заменим telegram id

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    const { data } = await supabase
      .from("users")
      .select("*")
      .neq("telegram_id", currentUserId);

    if (data) setUsers(data);
  }

  const currentUser = users[index];

  function nextUser() {
    setIndex((prev) => prev + 1);
    setCardKey((v) => v + 1);
  }

  async function createMatchCheck(likedUserId: number) {
    const { data: reverseLike } = await supabase
      .from("likes")
      .select("*")
      .eq("from_user", likedUserId)
      .eq("to_user", currentUserId)
      .maybeSingle();

    if (reverseLike) {
      const user1 = Math.min(currentUserId, likedUserId);
      const user2 = Math.max(currentUserId, likedUserId);

      const { data: existingMatch } = await supabase
        .from("matches")
        .select("*")
        .eq("user1", user1)
        .eq("user2", user2)
        .maybeSingle();

      if (!existingMatch) {
        await supabase.from("matches").insert({
          user1,
          user2,
        });

        setMatchedUser(currentUser);
      }
    }
  }

  async function handleLike() {
    if (!currentUser) return;

    const likedUserId = currentUser.telegram_id;

    await supabase.from("likes").insert({
      from_user: currentUserId,
      to_user: likedUserId,
    });

    await createMatchCheck(likedUserId);

    nextUser();
  }

  function handleSkip() {
    nextUser();
  }

  async function handleSuperLike() {
    await handleLike();
  }

  const swipeThreshold = 140;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f7f7fb",
        padding: "16px",
        paddingBottom: "150px",
      }}
    >
      {/* верх */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "18px",
        }}
      >
        <button
          style={{
            width: 58,
            height: 58,
            borderRadius: "50%",
            border: "none",
            background: "#fff",
            boxShadow: "0 6px 18px rgba(0,0,0,.06)",
            fontSize: 22,
          }}
        >
          ←
        </button>

        <button
          style={{
            width: 58,
            height: 58,
            borderRadius: "50%",
            border: "none",
            background: "#fff",
            boxShadow: "0 6px 18px rgba(0,0,0,.06)",
            fontSize: 22,
          }}
        >
          ⚙
        </button>
      </div>

      {currentUser ? (
        <>
          {/* CARD */}
          <motion.div
            key={cardKey}
            drag="x"
            dragElastic={0.08}
            dragMomentum={true}
            whileDrag={{ scale: 1.01 }}
            onDragEnd={(e, info) => {
              if (info.offset.x > swipeThreshold) {
                handleLike();
              }

              if (info.offset.x < -swipeThreshold) {
                handleSkip();
              }
            }}
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              x: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 650,
              damping: 24,
            }}
            style={{
              background: "#fff",
              borderRadius: "30px",
              overflow: "hidden",
              height: "64vh",
              minHeight: "470px",
              maxHeight: "560px",
              boxShadow: "0 18px 42px rgba(0,0,0,.10)",
            }}
          >
            <div
              style={{
                position: "relative",
                height: "68%",
              }}
            >
              <img
                src={currentUser.avatar_url}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />

              <div
                style={{
                  position: "absolute",
                  top: 18,
                  left: 18,
                  background: "rgba(0,0,0,.35)",
                  color: "#fff",
                  borderRadius: 18,
                  padding: "10px 18px",
                  fontSize: 24,
                }}
              >
                1 / 8
              </div>
            </div>

            {/* white info block */}
            <div
              style={{
                padding: "26px",
              }}
            >
              <h1
                style={{
                  margin:0,
                  fontSize:44,
                  lineHeight:1,
                }}
              >
                {currentUser.name}, {currentUser.age}
              </h1>

              <p
                style={{
                  color:"#666",
                  fontSize:30,
                  marginTop:18
                }}
              >
                📍 {currentUser.city}
              </p>

              <p
                style={{
                  fontSize:20,
                  marginTop:16
                }}
              >
                Люблю путешествия и новые впечатления ✈️
              </p>

              <div
                style={{
                  display:"flex",
                  flexWrap:"wrap",
                  gap:"12px",
                  marginTop:"18px"
                }}
              >
                {["Путешествия","Музыка","Спорт"].map((tag)=>(
                  <div
                    key={tag}
                    style={{
                      background:"#eef5ff",
                      color:"#2979FF",
                      padding:"10px 16px",
                      borderRadius:"20px",
                      fontSize:16
                    }}
                  >
                    {tag}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ACTION BUTTONS */}
          <div
            style={{
              marginTop:"26px",
              display:"flex",
              justifyContent:"center",
              alignItems:"center",
              gap:"28px"
            }}
          >
            <button
              onClick={handleSkip}
              style={{
                width:74,
                height:74,
                borderRadius:"50%",
                border:"none",
                background:"#fff",
                boxShadow:"0 8px 22px rgba(0,0,0,.10)",
                fontSize:32
              }}
            >
              ✕
            </button>

            <button
              onClick={handleLike}
              style={{
                width:92,
                height:92,
                borderRadius:"50%",
                border:"none",
                background:
                  "linear-gradient(135deg,#4FACFE,#2979FF)",
                color:"#fff",
                fontSize:38,
                boxShadow:"0 14px 30px rgba(41,121,255,.35)"
              }}
            >
              ❤
            </button>

            <button
              onClick={handleSuperLike}
              style={{
                width:74,
                height:74,
                borderRadius:"50%",
                border:"none",
                background:"#fff",
                boxShadow:"0 8px 22px rgba(0,0,0,.10)",
                fontSize:30
              }}
            >
              ★
            </button>
          </div>
        </>
      ) : (
        <p style={{textAlign:"center",marginTop:100}}>
          Нет пользователей
        </p>
      )}

      {/* MATCH POPUP */}
      {matchedUser && (
        <div
          style={{
            position:"fixed",
            inset:0,
            background:"rgba(0,0,0,.75)",
            display:"flex",
            justifyContent:"center",
            alignItems:"center",
            zIndex:999
          }}
        >
          <div
            style={{
              width:320,
              background:"#fff",
              padding:"30px",
              borderRadius:"30px",
              textAlign:"center"
            }}
          >
            <h1 style={{color:"#2979FF"}}>
              It's a Match 💙
            </h1>

            <img
              src={matchedUser.avatar_url}
              style={{
                width:110,
                height:110,
                borderRadius:"50%",
                objectFit:"cover",
                marginTop:15
              }}
            />

            <p style={{marginTop:20}}>
              Вы понравились друг другу
            </p>

            <button
              onClick={() => setMatchedUser(null)}
              style={{
                marginTop:18,
                border:"none",
                padding:"14px 24px",
                borderRadius:"14px",
                background:
                  "linear-gradient(135deg,#4FACFE,#2979FF)",
                color:"#fff"
              }}
            >
              Продолжить
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}