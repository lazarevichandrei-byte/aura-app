"use client";

import { useRouter, usePathname } from "next/navigation";

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { icon: "🏠", path: "/home" },
    { icon: "🔍", path: "/search" },
    { icon: "❤️", path: "/matches" },
    { icon: "👤", path: "/profile" },
  ];

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "70px",
        background: "#fff",
        borderTop: "1px solid #eee",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        zIndex: 100,
      }}
    >
      {tabs.map((tab, i) => {
        const active = pathname === tab.path;

        return (
          <div
            key={i}
            onClick={() => router.push(tab.path)}
            style={{
              fontSize: "22px",
              cursor: "pointer",
              color: active ? "#2979FF" : "#999",
            }}
          >
            {tab.icon}
          </div>
        );
      })}
    </div>
  );
}