"use client";

import BottomNav from "../../components/BottomNav";

export default function Home() {
  return (
    <div
      style={{
        paddingBottom: "80px",
        background: "#ffffff",
        minHeight: "100vh",
      }}
    >
      <h1>Home</h1>

      <BottomNav />
    </div>
  );
}