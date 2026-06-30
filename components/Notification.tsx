"use client";

import { useEffect } from "react";

type Props = {
  title: string;
  text: string;
  icon?: string;
  onClose: () => void;
};

export default function Notification({
  title,
  text,
  icon = "🔔",
  onClose
}: Props) {

  useEffect(() => {

    const timer = setTimeout(() => {
      onClose();
    }, 3500);

    return () => clearTimeout(timer);

  }, [onClose]);

  return (

    <div
      style={{
        position: "fixed",
        top: 20,
        left: 16,
        right: 16,
        zIndex: 999999,

        background: "#fff",
        borderRadius: 18,
        padding: 16,

        boxShadow:
          "0 12px 30px rgba(0,0,0,.18)"
      }}
    >

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14
        }}
      >

        <div
          style={{
            fontSize: 28
          }}
        >
          {icon}
        </div>

        <div>

          <div
            style={{
              fontWeight: 700,
              fontSize: 16
            }}
          >
            {title}
          </div>

          <div
            style={{
              marginTop: 4,
              color: "#667085",
              fontSize: 14
            }}
          >
            {text}
          </div>

        </div>

      </div>

    </div>

  );

}