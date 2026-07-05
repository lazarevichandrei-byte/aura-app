"use client";

import AuraSkeleton from "./AuraSkeleton";

export default function UserProfileSkeleton() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F5F7FB",
        padding: "20px",
        maxWidth: 420,
        margin: "0 auto"
      }}
    >
      <AuraSkeleton width={32} height={32} radius={8} />

      <div style={{ marginTop: 20 }}>
        <AuraSkeleton height={260} radius={32} />
      </div>

      <div style={{ marginTop: 20 }}>
        <AuraSkeleton width={180} height={28} />
      </div>

      <div style={{ marginTop: 10 }}>
        <AuraSkeleton width={120} height={16} />
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          marginTop: 18
        }}
      >
        <AuraSkeleton width={70} height={28} radius={999} />
        <AuraSkeleton width={90} height={28} radius={999} />
      </div>

      <div style={{ marginTop: 26 }}>
        <AuraSkeleton height={18} width={120} />
      </div>

      <div style={{ marginTop: 10 }}>
        <AuraSkeleton height={14} />
      </div>

      <div style={{ marginTop: 8 }}>
        <AuraSkeleton height={14} width="85%" />
      </div>

      <div style={{ marginTop: 8 }}>
        <AuraSkeleton height={14} width="65%" />
      </div>
    </div>
  );
}