"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

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

    useEffect(() => {
  if (open) {
    setSelectedGroup(null);
  }
}, [open]);

  return (
    <BottomSheet
  open={open}
  onClose={onClose}
>

<div
  style={{
    flex: 1,
    overflowY: "auto",
    paddingBottom: 30,
  }}
>

  <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 20,
  }}
>

  {selectedGroup && (

    <div
      onClick={() => setSelectedGroup(null)}
      style={{
        cursor: "pointer",
        fontSize: 22,
        fontWeight: 700,
        color: "#2F80FF",
        userSelect: "none",
      }}
    >
      ←
    </div>

  )}

  <div
    style={{
      fontSize: 20,
      fontWeight: 700,
    }}
  >
    {selectedGroup
      ? CATEGORY_GROUPS.find(
          g => g.id === selectedGroup
        )?.name
      : "Выберите категорию"}
  </div>

</div>



      <AnimatePresence mode="wait">

{!selectedGroup && (

<motion.div
  key="groups"
  initial={{ x: -40, opacity: 0 }}
  animate={{ x: 0, opacity: 1 }}
  exit={{ x: -40, opacity: 0 }}
  transition={{ duration: .22 }}
>

{CATEGORY_GROUPS.map((group) => (

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

</motion.div>

)}

{selectedGroup && (

<motion.div
  key="categories"
  initial={{ x: 40, opacity: 0 }}
  animate={{ x: 0, opacity: 1 }}
  exit={{ x: 40, opacity: 0 }}
  transition={{ duration: .22 }}
>

{MEET_CATEGORIES
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
  justifyContent: "space-between",
  cursor: "pointer",
  borderBottom: "1px solid #F1F3F6",
  background:
    value === item.id
      ? "#EEF5FF"
      : "transparent",
  padding: "0 4px",
}}
>

<div
  style={{
    display: "flex",
    alignItems: "center",
    gap: 12,
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

{value === item.id && (
  <span
    style={{
      color: "#2F80FF",
      fontWeight: 700,
      fontSize: 18,
    }}
  >
    ✓
  </span>
)}

</div>

))}

</motion.div>

)}

</AnimatePresence>

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
    
</div>
</BottomSheet>

  );
}

