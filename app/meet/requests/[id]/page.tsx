"use client";

import { use } from "react";

export default function MeetRequestsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <div
      style={{
        padding: 20,
      }}
    >
      <h1
        style={{
          fontSize: 26,
          fontWeight: 700,
          marginBottom: 12,
        }}
      >
        📨 Заявки
      </h1>

      <div
        style={{
          color: "#6B7280",
          fontSize: 15,
        }}
      >
        ID встречи:
      </div>

      <div
        style={{
          marginTop: 6,
          fontWeight: 600,
        }}
      >
        {id}
      </div>
    </div>
  );
}