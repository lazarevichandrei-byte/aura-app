"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import BottomNav from "../../components/BottomNav";

export default function Home() {
  const [users, setUsers] = useState<any[]>([]);
  const [index, setIndex] = useState(0);

  const currentUserId = 123; // временно

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

  async function handleLike() {
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

        console.log("MATCH");
      }
    }

    nextUser();
  }

  function handleSkip() {
    nextUser();
  }

  function nextUser() {
    setIndex((prev) => prev + 1);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F6F7FB",
        padding: "20px 18px 120px",
      }}
    >
      {currentUser ? (
        <>
          {/* CARD */}
          <div
            style={{
              position: "relative",
              height: "58vh",
              borderRadius: "34px",
              overflow: "hidden",
              background: "#fff",
              boxShadow: "0 12px 35px rgba(0,0,0,.08)",
            }}
          >
            {/* PHOTO */}
            <img
              src={currentUser.avatar_url}
              alt=""
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />

            {/* photo count */}
            <div
              style={{
                position: "absolute",
                top: 26,
                left: 26,
                background: "rgba(70,70,70,.45)",
                backdropFilter: "blur(10px)",
                padding: "12px 18px",
                borderRadius: "18px",
                color: "#fff",
                fontSize: "18px",
                zIndex: 4,
              }}
            >
              1 / 8
            </div>

            {/* name on photo */}
            <div
              style={{
                position: "absolute",
                left: 32,
                bottom: 210,
                zIndex: 4,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: 22,
                  fontWeight: 600,
                  color: "#111",
                }}
              >
                {currentUser.name}, {currentUser.age}
              </h2>

              <p
                style={{
                  marginTop: 6,
                  color: "#666",
                  fontSize: 15,
                }}
              >
                📍 {currentUser.city}
              </p>
            </div>

            {/* soft blur fade */}
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 140,
                height: 180,
                zIndex: 2,
                background:
                  "linear-gradient(to top, white 5%, rgba(255,255,255,.95) 25%, rgba(255,255,255,.65) 50%, rgba(255,255,255,.18) 78%, rgba(255,255,255,0) 100%)",
                filter: "blur(6px)",
              }}
            />

            {/* INFO BLOCK */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 3,
                background: "#fff",
                minHeight: 145,
                padding: "18px 26px 22px",
                borderTopLeftRadius: 34,
                borderTopRightRadius: 34,
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 15,
                  lineHeight: 1.45,
                  color: "#333",
                }}
              >
                {currentUser.bio || "Люблю путешествия и новые впечатления ✈✨"}
              </p>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 10,
                  marginTop: 14,
                }}
              >
                {(currentUser.interests || []).map((tag: string) => (
                  <span
                    key={tag}
                    style={{
                      padding: "6px 12px",
                      fontSize: 13,
                      borderRadius: 18,
                      background: "#EEF4FF",
                      color: "#2F80FF",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div
            style={{
              marginTop: 26,
              display: "flex",
              justifyContent: "center",
              gap: 28,
              alignItems: "center",
            }}
          >
            <button
              onClick={handleSkip}
              style={{
                width: 68,
                height: 68,
                borderRadius: "50%",
                border: "none",
                background: "#fff",
                boxShadow: "0 8px 20px rgba(0,0,0,.08)",
                fontSize: 34,
                color: "#9AA0AA",
              }}
            >
              ✕
            </button>

            <button
              onClick={handleLike}
              style={{
                width: 84,
                height: 84,
                borderRadius: "50%",
                border: "none",
                background:
                  "linear-gradient(135deg,#4FACFE,#2979FF)",
                color: "#fff",
                fontSize: 38,
                boxShadow:
                  "0 12px 28px rgba(41,121,255,.35)",
              }}
            >
              ❤
            </button>

            <button
              style={{
                width: 68,
                height: 68,
                borderRadius: "50%",
                border: "none",
                background: "#fff",
                boxShadow: "0 8px 20px rgba(0,0,0,.08)",
                fontSize: 30,
                color: "#9AA0AA",
              }}
            >
              ★
            </button>
          </div>
        </>
      ) : (
        <p style={{ padding: 40 }}>Нет пользователей</p>
      )}

      <BottomNav />
    </div>
  );
}