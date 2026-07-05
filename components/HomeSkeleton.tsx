"use client";

import AuraSkeleton from "./AuraSkeleton";

export default function HomeSkeleton() {
  return (
    <div
      style={{
        padding: "18px",
        height: "100vh",
        background: "#F6F7FB"
      }}
    >
      {/* Карточка */}
      <AuraSkeleton
        height="68vh"
        radius={36}
      />

      {/* Имя */}
      <div style={{ marginTop: 20 }}>
        <AuraSkeleton
          width={180}
          height={24}
          radius={8}
        />
      </div>

      {/* Город */}
      <div style={{ marginTop: 10 }}>
        <AuraSkeleton
          width={120}
          height={16}
          radius={8}
        />
      </div>

      {/* Интересы */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginTop: 18
        }}
      >
        <AuraSkeleton width={70} height={28} radius={999} />
        <AuraSkeleton width={90} height={28} radius={999} />
        <AuraSkeleton width={80} height={28} radius={999} />
      </div>
    </div>
  );
}