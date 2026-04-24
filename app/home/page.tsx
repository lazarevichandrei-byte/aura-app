"use client";

import { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { supabase } from "../../lib/supabase";
import BottomNav from "../../components/BottomNav";

export default function Home() {
  const [users, setUsers] = useState<any[]>([]);
  const [index, setIndex] = useState(0);
  const [matchedUser, setMatchedUser] = useState<any>(null);

  const controls = useAnimation();

  const currentUserId = 123; // потом заменим на telegram id

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
  }

  async function flyRightLike() {
    await controls.start({
      x: 700,
      rotate: 18,
      opacity: 0,
      transition: { duration: 0.22 },
    });

    await handleLikeLogic();

    controls.set({
      x: 0,
      rotate: 0,
      opacity: 1,
    });
  }

  async function flyLeftSkip() {
    await controls.start({
      x: -700,
      rotate: -18,
      opacity: 0,
      transition: { duration: 0.22 },
    });

    nextUser();

    controls.set({
      x: 0,
      rotate: 0,
      opacity: 1,
    });
  }

  async function handleLikeLogic() {
    if (!currentUser) return;

    const likedUserId = currentUser.telegram_id;

    await supabase.from("likes").insert({
      from_user: currentUserId,
      to_user: likedUserId,
    });

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

    nextUser();
  }

  return (
    <div
      style={{
        background: "#F7F8FC",
        minHeight: "100vh",
        padding: "18px",
        paddingBottom: "150px",
      }}
    >
      {/* top buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "18px",
        }}
      >
        <div
          style={{
            width: 58,
            height: 58,
            borderRadius: "50%",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 14px rgba(0,0,0,.05)",
            fontSize: 24,
          }}
        >
          ←
        </div>

        <div
          style={{
            width: 58,
            height: 58,
            borderRadius: "50%",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 14px rgba(0,0,0,.05)",
            fontSize: 24,
          }}
        >
          ⚙
        </div>
      </div>

      {currentUser ? (
        <>
          <motion.div
            drag="x"
            dragElastic={0.08}
            dragMomentum
            animate={controls}
            whileDrag={{ scale: 1.01 }}
            onDragEnd={(e, info) => {
              if (info.offset.x > 140) flyRightLike();
              else if (info.offset.x < -140) flyLeftSkip();
            }}
            style={{
              position: "relative",
              height: "62vh",
              maxHeight: "650px",
              borderRadius: "34px",
              overflow: "hidden",
              background: "#fff",
              boxShadow: "0 18px 40px rgba(0,0,0,.08)",
            }}
          >
            {/* photo */}
            <img
              src={currentUser.avatar_url}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />

            {/* counter */}
            <div
              style={{
                position: "absolute",
                top: 26,
                left: 26,
                padding: "12px 20px",
                background: "rgba(90,90,90,.45)",
                color: "#fff",
                borderRadius: "20px",
                fontSize: "18px",
              }}
            >
              1 / 8
            </div>

            {/* white fade */}
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 210,
                height: "140px",
                background:
                  "linear-gradient(to top, white 0%, rgba(255,255,255,.92) 28%, rgba(255,255,255,.35) 68%, rgba(255,255,255,0) 100%)",
              }}
            />

            {/* info panel */}
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                background: "#fff",
                padding: "22px 24px 28px",
                borderTopLeftRadius: "34px",
                borderTopRightRadius: "34px",
                minHeight: "220px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: "28px",
                    fontWeight: 700,
                    letterSpacing: "-0.4px",
                    fontFamily:
                      "-apple-system,BlinkMacSystemFont,sans-serif",
                  }}
                >
                  {currentUser.name}, {currentUser.age}
                </h2>

                <span style={{ color: "#2979FF", fontSize: 20 }}>
                  ✔
                </span>
              </div>

              <div
                style={{
                  marginTop: 12,
                  color: "#6F7683",
                  fontSize: 18,
                }}
              >
                📍 {currentUser.city}, 2 км от вас
              </div>

              <div
                style={{
                  marginTop: 16,
                  fontSize: 17,
                  lineHeight: 1.45,
                  color: "#222",
                }}
              >
                {currentUser.bio || "Люблю путешествия и новые впечатления ✈✨"}
              </div>

              <div
                style={{
                  marginTop: 18,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                {(currentUser.interests || []).map((tag: string) => (
                  <span
                    key={tag}
                    style={{
                      padding: "8px 14px",
                      borderRadius: "22px",
                      background: "#EEF4FF",
                      color: "#2979FF",
                      fontSize: 14,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* buttons under card */}
          <div
            style={{
              marginTop: 28,
              display: "flex",
              justifyContent: "center",
              gap: 28,
              alignItems: "center",
            }}
          >
            <button
              onClick={flyLeftSkip}
              style={{
                width: 68,
                height: 68,
                borderRadius: "50%",
                background: "#fff",
                border: "none",
                color: "#9AA0AA",
                fontSize: 34,
                boxShadow: "0 8px 22px rgba(0,0,0,.08)",
              }}
            >
              ✕
            </button>

            <button
              onClick={flyRightLike}
              style={{
                width: 84,
                height: 84,
                borderRadius: "50%",
                border: "none",
                background:
                  "linear-gradient(135deg,#43A5FF,#1D74FF)",
                color: "#fff",
                fontSize: 38,
                boxShadow:
                  "0 12px 30px rgba(41,121,255,.35)",
              }}
            >
              ❤
            </button>

            <button
              style={{
                width: 68,
                height: 68,
                borderRadius: "50%",
                background: "#fff",
                border: "none",
                color: "#9AA0AA",
                fontSize: 30,
                boxShadow: "0 8px 22px rgba(0,0,0,.08)",
              }}
            >
              ★
            </button>
          </div>
        </>
      ) : (
        <p style={{ textAlign: "center" }}>Нет пользователей</p>
      )}

      {/* Match popup */}
      {matchedUser && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.72)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
        >
          <div
            style={{
              background:"#fff",
              padding:"30px",
              borderRadius:"28px",
              width:"310px",
              textAlign:"center"
            }}
          >
            <h2 style={{color:"#2979FF"}}>
              It's a Match 💙
            </h2>

            <img
              src={matchedUser.avatar_url}
              style={{
                width:100,
                height:100,
                borderRadius:"50%",
                objectFit:"cover",
                marginTop:15
              }}
            />

            <p>Вы понравились друг другу</p>

            <button
              onClick={()=>setMatchedUser(null)}
              style={{
                marginTop:16,
                border:"none",
                padding:"12px 24px",
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