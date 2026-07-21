"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { PanInfo } from "motion/react";
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
} from "motion/react";
import type { MeetEvent } from "../../lib/meet/types";
import MeetCard from "./MeetCard";

type Props = {
  event: MeetEvent | null;
  currentUserId: string | null;
  onJoin: (eventId: string) => Promise<void>;
  onLeave: (eventId: string) => Promise<void>;
  onClose: () => void;
};

type SnapPoint = "collapsed" | "expanded";

const SHEET_HEIGHT = 0.95;
const SNAP_POSITIONS: Record<SnapPoint, number> = {
  collapsed: 0.5,
  expanded: 0,
};
const SPRING = { type: "spring" as const, stiffness: 420, damping: 38 };
const DRAG_THRESHOLD = 60;
const CLOSE_THRESHOLD = 300;
const VELOCITY_THRESHOLD = 1200;

function getViewportHeight() {
  return typeof window === "undefined" ? 0 : window.innerHeight;
}

export default function MeetBottomSheet({
  event,
  currentUserId,
  onJoin,
  onLeave,
  onClose,
}: Props) {
  const [viewportHeight, setViewportHeight] = useState(getViewportHeight);
  const [snapPoint, setSnapPoint] = useState<SnapPoint>("collapsed");
  const y = useMotionValue(viewportHeight);

 

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

const collapsedPosition = useMemo(
  () => getPosition("collapsed"),
  [getPosition]
);

  const backdropOpacity = useTransform(
  y,
  [0, collapsedPosition],
  [0.45, 0]
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

  const snapToNearest = (velocityY = 0) => {
  const currentY = y.get();

  const expandedY = getPosition("expanded");
  const collapsedY = getPosition("collapsed");

  if (
    snapPointRef.current === "collapsed" &&
    (currentY > collapsedY + 180 || velocityY > VELOCITY_THRESHOLD)
  ) {
    closeSheet();
    return;
  }

  const distanceToExpanded = Math.abs(currentY - expandedY);
  const distanceToCollapsed = Math.abs(currentY - collapsedY);

  snapTo(
    distanceToExpanded < distanceToCollapsed
      ? "expanded"
      : "collapsed"
  );
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

  

  
  if (!event) return null;

  return (
  <>
    <motion.div
      onClick={closeSheet}
      style={{
        position: "fixed",
        inset: 0,
        background: "#000",
        opacity: backdropOpacity,
        pointerEvents: "auto",
        zIndex: 998,
      }}
    />

    <motion.section
      drag="y"
      dragElastic={0.08}
      dragMomentum={false}
      dragConstraints={{
        top: 0,
        bottom: getClosedPosition(),
      }}
      onPanEnd={(_, info) => snapToNearest(info.velocity.y)}
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
        overflowY: snapPoint === "expanded" ? "auto" : "hidden",
        zIndex: 999,
        boxShadow: "0 -10px 40px rgba(0,0,0,.18)",
      }}
    >
      <motion.div
        aria-label="Потяните, чтобы изменить размер карточки встречи"
        onPanEnd={() => snapToNearest()}
        style={{
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: 38,
  margin: "-12px -12px 6px",
  cursor: "grab",
  touchAction: "none",

  position: "sticky",
  top: -18,
  background: "#fff",
  zIndex: 2,
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
      </motion.div>

      <MeetCard
  event={event}
  expanded={snapPoint !== "collapsed"}
  currentUserId={currentUserId}
  onJoin={onJoin}
  onLeave={onLeave}
/>
    </motion.section>
  </>
);
}
