"use client";

import { useRouter, usePathname } from "next/navigation";
import { FiHome, FiSearch, FiHeart, FiUser } from "react-icons/fi";

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { icon: FiHome, path: "/home" },
    { icon: FiSearch, path: "/search" },
    { icon: FiHeart, path: "/matches" },
    { icon: FiUser, path: "/profile" },
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
        const Icon = tab.icon;

        return (
          <div
            key={i}
            onClick={() => router.push(tab.path)}
            style={{
              cursor: "pointer",
              color: active ? "#2979FF" : "#B0B0B0",
              transition: "0.2s",
            }}
          >
            <Icon size={26} />
          </div>
        );
      })}
    </div>
  );
}