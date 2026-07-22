"use client";

import { useState } from "react";

import BottomSheet from "../BottomSheet";

import {
  CATEGORY_GROUPS,
  MEET_CATEGORIES
} from "../../lib/meet/categories";

type Props = {
  open: boolean;
  onClose: () => void;
  value: string;
  onSelect: (id: string) => void;
};

export default function CategoryBottomSheet({
  open,
  onClose,
  value,
  onSelect,
}: Props) {

  const [selectedGroup, setSelectedGroup] =
    useState<string | null>(null);
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
    >
      <div
  style={{
    fontSize: 20,
    fontWeight: 700,
    marginBottom: 20,
  }}
>
  {selectedGroup
    ? "Назад"
    : "Выберите категорию"}
</div>

      {!selectedGroup && CATEGORY_GROUPS.map((group) => (
        <div
  key={group.id}
  onClick={() => setSelectedGroup(group.id)}
          style={{
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
            borderBottom: "1px solid #F1F3F6",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 16,
              fontWeight: 500,
            }}
          >
            <span>{group.icon}</span>
            <span>{group.name}</span>
          </div>

          <span
            style={{
              color: "#A0A0A0",
              fontSize: 20,
            }}
          >
            ›
          </span>
        </div>
      ))}

      {selectedGroup &&

  MEET_CATEGORIES
    .filter(item => item.group === selectedGroup)
    .map(item => (

      <div
        key={item.id}
        onClick={() => {

          onSelect(item.id);

          setSelectedGroup(null);

          onClose();

        }}
        style={{
          height: 56,
          display: "flex",
          alignItems: "center",
          gap: 12,
          cursor: "pointer",
          borderBottom: "1px solid #F1F3F6",
        }}
      >
        <span style={{ fontSize: 22 }}>
          {item.icon}
        </span>

        <span
          style={{
            fontSize: 16,
            fontWeight: 500,
          }}
        >
          {item.name}
        </span>

      </div>

    ))

}
    </BottomSheet>
  );
}

