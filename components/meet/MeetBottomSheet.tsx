"use client";

import { useState } from "react";
import type { MeetEvent } from "../../lib/meet/types";
import MeetCard from "./MeetCard";
import { motion } from "motion/react";
type Props = {
  event: MeetEvent | null;
  onClose: () => void;
};

export default function MeetBottomSheet({
  event,
  onClose,
}: Props) {

  if (!event) return null;

  const [expanded, setExpanded] = useState(false);

  const [dragOffset, setDragOffset] = useState(0);

  

  return (
  <motion.div
  initial={{ y: 500 }}
  animate={{
    y: dragOffset,
  }}
  exit={{ y: 500 }}
  transition={{
    type: "spring",
    stiffness: 320,
    damping: 32,
  }}

  drag="y"
  dragConstraints={{
    top: 0,
    bottom: 0,
  }}
  dragElastic={0.18}

  onDragEnd={(_, info) => {

    if (info.offset.y > 180) {
      onClose();
      return;
    }

    if (info.offset.y > 70) {
      setExpanded(false);
      setDragOffset(0);
      return;
    }

    if (info.offset.y < -70) {
      setExpanded(true);
      setDragOffset(0);
      return;
    }

    setDragOffset(0);

  }}

  style={{
      position: "fixed",
      left: 0,
      right: 0,
      bottom: 0,
      background: "#fff",
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      padding: "18px 20px 26px",
      height: expanded ? "90vh" : "320px",
      transition: "height .28s ease",
      overflowY: "auto",
      zIndex: 999,
      boxShadow: "0 -10px 40px rgba(0,0,0,.18)"
    }}
  >

    <div
      onClick={() => setExpanded(!expanded)}
      style={{
        width: 58,
        height: 6,
        borderRadius: 999,
        background: "#D6D6D6",
        margin: "0 auto 18px",
        cursor: "grab"
      }}
    />

    <MeetCard
      event={event}
      expanded={expanded}
    />

  </motion.div>
);

}