"use client";

import { ReactNode, useEffect, useState } from "react";
import { selection } from "../lib/haptic";

type Props = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  maxHeight?: string;

  initialOffset?: string;
};

export default function BottomSheet({
  open,
  onClose,
  children,
  maxHeight = "65vh",
  initialOffset = "0px",
}: Props) {

  const [visible, setVisible] = useState(false);

  const [translateY, setTranslateY] = useState(0);

const [startY, setStartY] = useState<number | null>(null);

  useEffect(() => {

  if (open) {

    selection();

    setVisible(true);

    setTranslateY(0);

  } else {

    setVisible(false);

    setTranslateY(0);

  }

}, [open]);

const handleTouchStart = (
  e: React.TouchEvent<HTMLDivElement>
) => {

  setStartY(e.touches[0].clientY);

};

const handleTouchMove = (
  e: React.TouchEvent<HTMLDivElement>
) => {

  if (startY === null) return;

  const diff =
    e.touches[0].clientY - startY;

  if (diff > 0) {

    setTranslateY(diff);

  }

};

const handleTouchEnd = () => {

  if (translateY > 80) {

    onClose();

  } else {

    setTranslateY(0);

  }

  setStartY(null);

};

  if (!open) return null;

  return (

    <div
      onClick={onClose}
      style={{

        position: "fixed",

        inset: 0,

        zIndex: 99999,

        background: visible
          ? "rgba(0,0,0,.45)"
          : "rgba(0,0,0,0)",

        backdropFilter: visible
          ? "blur(6px)"
          : "blur(0px)",

        transition: ".25s"

      }}
    >

      <div

        onClick={(e) => e.stopPropagation()}

        onTouchStart={handleTouchStart}

        onTouchMove={handleTouchMove}

        onTouchEnd={handleTouchEnd}

        style={{

          position: "absolute",

          left: 0,

          right: 0,

          bottom: 0,

          background: "#FFFFFF",

          borderTopLeftRadius: 28,

          borderTopRightRadius: 28,

          padding: 24,

paddingBottom: 34,

maxHeight,

overflow: "hidden",

display: "flex",

flexDirection: "column",

boxSizing: "border-box",

justifyContent: "flex-start",

transform: visible
  ? `translateY(${translateY}px)`
  : "translateY(100%)",

transition:
  startY === null
    ? "transform .25s ease"
    : "none",

boxShadow:
  "0 -10px 40px rgba(0,0,0,.15)"

        }}

      >

        <div
          style={{

            width: 46,

            height: 5,

            borderRadius: 999,

            background: "#D8DCE3",

            margin: "0 auto 20px"

          }}
        />

        {children}

      </div>

    </div>

  );

}