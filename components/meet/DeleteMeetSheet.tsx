"use client";

import { AnimatePresence, motion } from "motion/react";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function DeleteMeetSheet({
  open,
  onClose,
  onConfirm,
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,.35)",
              zIndex: 2100,
            }}
          />

          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: .25 }}
            style={{
              position: "fixed",
              left: 0,
              right: 0,
              bottom: 80,
              background: "#F8F8F8",
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              padding: "22px",
              zIndex: 2101,
              boxShadow: "0 -8px 30px rgba(0,0,0,.12)",
            }}
          >
            <div
              style={{
                width: 54,
                height: 5,
                background: "#D1D5DB",
                borderRadius: 999,
                margin: "0 auto 20px",
              }}
            />

            <div
              style={{
                fontSize: 44,
                textAlign: "center",
              }}
            >
              🗑️
            </div>

            <div
              style={{
                marginTop: 10,
                textAlign: "center",
                fontSize: 22,
                fontWeight: 700,
                color: "#111827",
              }}
            >
              Удалить встречу?
            </div>

            <div
              style={{
                marginTop: 10,
                textAlign: "center",
                fontSize: 14,
                color: "#6B7280",
                lineHeight: 1.5,
              }}
            >
              Это действие нельзя отменить.
            </div>

            <button
              onClick={onConfirm}
              style={{
                width: "100%",
                height: 54,
                marginTop: 28,
                border: "none",
                borderRadius: 16,
                background: "#EF4444",
                color: "#fff",
                fontSize: 16,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Удалить встречу
            </button>

            <button
              onClick={onClose}
              style={{
                width: "100%",
                height: 50,
                marginTop: 12,
                border: "none",
                background: "transparent",
                color: "#6B7280",
                fontSize: 16,
                cursor: "pointer",
              }}
            >
              Отмена
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}