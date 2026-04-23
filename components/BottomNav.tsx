"use client";

import { useRouter, usePathname } from "next/navigation";
import { Home, MessageCircle, Search, Clock, User } from "lucide-react";

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { icon: Home, label: "Home", path: "/home" },
    { icon: MessageCircle, label: "Messages", path: "/matches" },
    { icon: Search, label: "Search", path: "/search" },
    { icon: Clock, label: "History", path: "/history" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "75px",
        background: "#fff",
        borderTop: "1px solid #eee",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        zIndex: 100,
      }}
    >
      {tabs.map((tab, i) => {
        const Icon = tab.icon;
        const active = pathname === tab.path;

        return (
          <div
            key={i}
            onClick={() => router.push(tab.path)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              fontSize: "12px",
              color: active ? "#ff4d8d" : "#999",
              cursor: "pointer",
            }}
          >
            <Icon size={24} strokeWidth={2} />
            <span style={{ marginTop: "4px" }}>{tab.label}</span>
          </div>
        );
      })}
    </div>
  );
}