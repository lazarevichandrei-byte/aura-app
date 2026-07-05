"use client";

import AuraSkeleton from "./AuraSkeleton";

export default function ProfileSkeleton() {
  return (
    <div
      style={{
        maxWidth: 420,
        margin: "0 auto",
        background: "#fff",
        borderRadius: 24,
        padding: 20
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}
      >
        <AuraSkeleton
          width={110}
          height={110}
          radius={55}
        />

        <div style={{ marginTop: 16 }}>
          <AuraSkeleton width={180} height={24} />
        </div>

        <div style={{ marginTop: 10 }}>
          <AuraSkeleton width={120} height={16} />
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <AuraSkeleton height={54} radius={16} />
      </div>

      <div style={{ marginTop: 30 }}>
        <AuraSkeleton height={48} radius={14} />
        <div style={{ marginTop: 10 }}>
          <AuraSkeleton height={48} radius={14} />
        </div>
        <div style={{ marginTop: 10 }}>
          <AuraSkeleton height={48} radius={14} />
        </div>
        <div style={{ marginTop: 10 }}>
          <AuraSkeleton height={48} radius={14} />
        </div>
        <div style={{ marginTop: 10 }}>
          <AuraSkeleton height={48} radius={14} />
        </div>
      </div>
    </div>
  );
}