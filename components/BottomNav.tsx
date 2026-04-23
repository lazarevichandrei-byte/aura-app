"use client";

import { useRouter, usePathname } from "next/navigation";
import { Home, MessageCircle, Search, Clock, User } from "lucide-react";

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { icon: Home, path: "/home" },
    { icon: MessageCircle, path: "/matches" },
    { icon: Search, path: "/search" },
    { icon: Clock, path: "/history" },
    { icon: User, path: "/profile" },
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
        const Icon = tab.icon;
        const active = pathname === tab.path;

        return (
          <div
            key={i}
            onClick={() => router.push(tab.path)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "50px",
              height: "50px",
              borderRadius: "14px",
              background: active ? "rgba(41,121,255,0.1)" : "transparent",
              border: active ? "1.5px solid #2979ff" : "1.5px solid transparent",
              boxShadow: active
                ? "0 0 10px rgba(41,121,255,0.25)"
                : "none",
              transition: "0.2s",
              cursor: "pointer",
            }}
          >
            <Icon
              size={24}
              strokeWidth={1.8}
              color={active ? "#2979ff" : "#999"}
            />
          </div>
        );
      })}
    </div>
  );
}