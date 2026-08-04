"use client";

import { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useDragControls } from "motion/react";
import { selection } from "../lib/haptic";

type TelegramWebApp = {
  disableVerticalSwipes?: () => void;
  enableVerticalSwipes?: () => void;
};

type Props = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  maxHeight?: string;
  height?: string;
};

const CLOSE_DISTANCE = 96;
const CLOSE_VELOCITY = 650;

function getTelegramWebApp(): TelegramWebApp | undefined {
  return (
    window as Window & { Telegram?: { WebApp?: TelegramWebApp } }
  ).Telegram?.WebApp;
}

export default function BottomSheet({
  open,
  onClose,
  children,
  maxHeight = "65dvh",
  height,
}: Props) {
  const dragControls = useDragControls();

  useEffect(() => {
    if (!open) return;

    selection();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    getTelegramWebApp()?.disableVerticalSwipes?.();

    return () => {
      document.body.style.overflow = previousOverflow;
      getTelegramWebApp()?.enableVerticalSwipes?.();
    };
  }, [open]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            display: "flex",
            alignItems: "flex-end",
            background: "rgba(0,0,0,.45)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            overscrollBehavior: "contain",
          }}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 360, damping: 32 }}
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.12}
            dragMomentum={false}
            onDragEnd={(_, info) => {
              if (
                info.offset.y > CLOSE_DISTANCE ||
                info.velocity.y > CLOSE_VELOCITY
              ) {
                onClose();
              }
            }}
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "100%",
              maxHeight,
              height,
              background: "#FFFFFF",
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              padding: "20px 24px calc(24px + env(safe-area-inset-bottom))",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              boxSizing: "border-box",
              boxShadow: "0 -10px 40px rgba(0,0,0,.15)",
              overscrollBehavior: "contain",
            }}
          >
            <motion.div
              onPointerDown={(event) => dragControls.start(event)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 28,
                margin: "-8px -8px 12px",
                cursor: "grab",
                touchAction: "none",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                width: 46,
                height: 5,
                borderRadius: 999,
                background: "#D8DCE3",
                }}
              />
            </motion.div>

            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
