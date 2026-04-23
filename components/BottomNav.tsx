"use client";

import { useRouter, usePathname } from "next/navigation";
import {
  Home,
  Home as HomeOutline,
  Search,
  Heart,
  User,
} from "lucide-react";

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
        height: "60px",
        background: "#fff",
        borderTop: "1px solid #eee",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        paddingBottom: "6px",
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
              cursor: "pointer",
            }}
          >
            <Icon
              size={26}
              strokeWidth={2}
              color={active ? "#2979FF" : "#B0B0B0"}
              fill={active ? "#2979FF" : "none"}
            />
          </div>
        );
      })}
    </div>
  );
}