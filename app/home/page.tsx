"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import BottomNav from "../../components/BottomNav";

export default function Home() {
  const [users, setUsers] = useState<any[]>([]);
  const [index, setIndex] = useState(0);

  const currentUserId = 123; // ⚠️ временно

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

    // 1. лайк
    await supabase.from("likes").insert({
      from_user: currentUserId,
      to_user: likedUserId,
    });

    // 2. проверка обратного лайка
    const { data: reverseLike } = await supabase
      .from("likes")
      .select("*")
      .eq("from_user", likedUserId)
      .eq("to_user", currentUserId)
      .maybeSingle();

    if (reverseLike) {
      const user1 = Math.min(currentUserId, likedUserId);
      const user2 = Math.max(currentUserId, likedUserId);

      // 3. проверка существующего match
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

        console.log("🔥 MATCH!");
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
        padding: "20px",
        paddingBottom: "100px",
        background: "#ffffff",
        minHeight: "100vh",
      }}
    >
      {currentUser ? (
        <div
          style={{
            position: "relative",
            borderRadius: "24px",
            overflow: "hidden",
            height: "500px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
          }}
        >
          {/* Фото */}
          <img
            src={currentUser.avatar_url}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />

          {/* Градиент */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "40%",
              background:
                "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
            }}
          />

          {/* Инфа */}
          <div
            style={{
              position: "absolute",
              bottom: "20px",
              left: "20px",
              color: "#fff",
            }}
          >
            <h2 style={{ margin: 0 }}>
              {currentUser.name}, {currentUser.age}
            </h2>
            <p style={{ margin: "4px 0" }}>{currentUser.city}</p>
          </div>

          {/* Кнопки */}
          <div
            style={{
              position: "absolute",
              bottom: "-40px",
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
              gap: "30px",
            }}
          >
            {/* ❌ */}
            <button
              onClick={handleSkip}
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                border: "none",
                background: "#fff",
                boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
                fontSize: "24px",
              }}
            >
              ❌
            </button>

            {/* ❤️ */}
            <button
              onClick={handleLike}
              style={{
                width: "70px",
                height: "70px",
                borderRadius: "50%",
                border: "none",
                background: "linear-gradient(135deg, #4FACFE, #2979FF)",
                color: "#fff",
                fontSize: "26px",
                boxShadow: "0 10px 25px rgba(41,121,255,0.4)",
              }}
            >
              ❤️
            </button>
          </div>
        </div>
      ) : (
        <p>Нет пользователей</p>
      )}

      <BottomNav />
    </div>
  );
}