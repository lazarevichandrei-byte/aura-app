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
              borderRadius: "12px",
              background: active
                ? "linear-gradient(135deg, #4facfe, #2979ff)"
                : "transparent",
              cursor: "pointer",
              transition: "0.2s",
            }}
          >
            <Icon
              size={24}
              strokeWidth={2}
              color={active ? "#fff" : "#999"}
            />
          </div>
        );
      })}
    </div>
  );
}