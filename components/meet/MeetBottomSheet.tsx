"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PanInfo } from "motion/react";
import {
  animate,
  motion,
  useDragControls,
  useMotionValue,
} from "motion/react";
import type { MeetEvent } from "../../lib/meet/types";
import MeetCard from "./MeetCard";

type Props = {
  event: MeetEvent | null;
  onClose: () => void;
};

type SnapPoint = "collapsed" | "medium" | "expanded";

const SHEET_HEIGHT = 0.95;
const SNAP_POSITIONS: Record<SnapPoint, number> = {
  collapsed: 0.7,
  medium: 0.3,
  expanded: 0,
};
const SPRING = { type: "spring" as const, stiffness: 420, damping: 38 };
const DRAG_THRESHOLD = 60;
const CLOSE_THRESHOLD = 170;
const VELOCITY_THRESHOLD = 900;

function getViewportHeight() {
  return typeof window === "undefined" ? 0 : window.innerHeight;
}

export default function MeetBottomSheet({ event, onClose }: Props) {
  const [viewportHeight, setViewportHeight] = useState(getViewportHeight);
  const [snapPoint, setSnapPoint] = useState<SnapPoint>("collapsed");
  const y = useMotionValue(viewportHeight);
  const dragControls = useDragControls();
  const wasOpen = useRef(false);
  const isClosing = useRef(false);
  const snapPointRef = useRef<SnapPoint>("collapsed");

  const getPosition = useCallback(
    (point: SnapPoint) => viewportHeight * SNAP_POSITIONS[point],
    [viewportHeight]
  );
  const getClosedPosition = useCallback(
    () => viewportHeight * SHEET_HEIGHT,
    [viewportHeight]
  );

  const snapTo = (point: SnapPoint) => {
    snapPointRef.current = point;
    setSnapPoint(point);
    animate(y, getPosition(point), SPRING);
  };

  const closeSheet = () => {
    if (isClosing.current) return;

    isClosing.current = true;
    animate(y, getClosedPosition(), SPRING).then(onClose);
  };

  useEffect(() => {
    const updateViewportHeight = () => setViewportHeight(getViewportHeight());

    window.addEventListener("resize", updateViewportHeight);
    return () => window.removeEventListener("resize", updateViewportHeight);
  }, []);

  useEffect(() => {
    if (!event) {
      wasOpen.current = false;
      isClosing.current = false;
      return;
    }

    if (!wasOpen.current) {
      wasOpen.current = true;
      isClosing.current = false;
      snapPointRef.current = "collapsed";
      setSnapPoint("collapsed");
      y.set(getClosedPosition());
      animate(y, getPosition("collapsed"), SPRING);
      return;
    }

    y.set(getPosition(snapPointRef.current));
  }, [event, getClosedPosition, getPosition, viewportHeight, y]);

  const handleDragEnd = (_: PointerEvent, info: PanInfo) => {
    const isDraggingUp =
      info.offset.y < -DRAG_THRESHOLD || info.velocity.y < -VELOCITY_THRESHOLD;
    const isDraggingDown =
      info.offset.y > DRAG_THRESHOLD || info.velocity.y > VELOCITY_THRESHOLD;

    if (snapPoint === "collapsed" && isDraggingDown) {
      if (
        info.offset.y > CLOSE_THRESHOLD ||
        info.velocity.y > VELOCITY_THRESHOLD
      ) {
        closeSheet();
        return;
      }

      snapTo("collapsed");
      return;
    }

    if (isDraggingUp) {
      snapTo(snapPoint === "collapsed" ? "medium" : "expanded");
      return;
    }

    if (isDraggingDown) {
      snapTo(snapPoint === "expanded" ? "medium" : "collapsed");
      return;
    }

    snapTo(snapPoint);
  };

  if (!event) return null;

  return (
    <motion.section
      drag="y"
      dragControls={dragControls}
      dragListener={false}
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.18}
      onDragEnd={handleDragEnd}
      style={{
        y,
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        height: "95dvh",
        background: "#fff",
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        padding: "18px 20px 26px",
        overflowY: "auto",
        zIndex: 999,
        boxShadow: "0 -10px 40px rgba(0,0,0,.18)",
      }}
    >
      <div
        aria-label="Потяните, чтобы изменить размер карточки встречи"
        onPointerDown={(pointerEvent) => dragControls.start(pointerEvent)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 38,
          margin: "-12px -12px 6px",
          cursor: "grab",
          touchAction: "none",
        }}
      >
        <div
          style={{
            width: 58,
            height: 6,
            borderRadius: 999,
            background: "#D6D6D6",
          }}
        />
      </div>

      <MeetCard event={event} expanded={snapPoint !== "collapsed"} />
    </motion.section>
  );
}
