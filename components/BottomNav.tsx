"use client";

import { useRouter, usePathname } from "next/navigation";
import { Home, Search, Heart, User } from "lucide-react";

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { icon: Home, path: "/home" },
    { icon: Search, path: "/search" },
    { icon: Heart, path: "/matches" },
    { icon: User, path: "/profile" },
  ];

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "65px",
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
              cursor: "pointer",
            }}
          >
            <Icon
              size={26}
              strokeWidth={2}
              color={active ? "#2979FF" : "#999"}
              fill={active ? "#2979FF" : "none"}
            />
          </div>
        );
      })}
    </div>
  );
}