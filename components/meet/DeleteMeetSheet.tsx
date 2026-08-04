"use client";

import BottomSheet from "../BottomSheet";

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
    <BottomSheet open={open} onClose={onClose} maxHeight="50dvh">
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 44 }}>🗑️</div>

        <div
          style={{
            marginTop: 10,
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
      </div>
    </BottomSheet>
  );
}
