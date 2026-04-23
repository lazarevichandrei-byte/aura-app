"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import BottomNav from "../../components/BottomNav";

export default function Home() {
  const [users, setUsers] = useState<any[]>([]);
  const [index, setIndex] = useState(0);

  const currentUserId = 123; // ⚠️ потом заменим на реальный

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

    await supabase.from("likes").insert({
      from_user: currentUserId,
      to_user: currentUser.telegram_id,
    });

    nextUser();
  }

  function handleSkip() {
    nextUser();
  }

  function nextUser() {
    setIndex((prev) => prev + 1);
  }

  return (
    <div style={{ padding: "20px", paddingBottom: "90px" }}>
      {currentUser ? (
        <div
          style={{
            background: "#fff",
            borderRadius: "20px",
            padding: "20px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          }}
        >
          <img
            src={currentUser.avatar_url}
            style={{
              width: "100%",
              height: "300px",
              objectFit: "cover",
              borderRadius: "16px",
            }}
          />

          <h2>
            {currentUser.name}, {currentUser.age}
          </h2>

          <p>{currentUser.city}</p>

          <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
            <button onClick={handleSkip}>❌</button>
            <button onClick={handleLike}>❤️</button>
          </div>
        </div>
      ) : (
        <p>Нет пользователей</p>
      )}

      <BottomNav />
    </div>
  );
}