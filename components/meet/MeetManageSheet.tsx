"use client";

import { motion } from "motion/react";
import BottomSheet from "../BottomSheet";

type Props = {
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  onParticipants: () => void;
  onRequests: () => void;
  onDelete: () => void;
};

const actions = [
  {
    title: "✏️ Редактировать",
    description: "Изменить информацию",
    key: "edit",
  },
  {
    title: "👥 Участники",
    description: "Управление участниками",
    key: "participants",
  },
  {
    title: "📨 Заявки",
    description: "Просмотреть ожидающие заявки",
    key: "requests",
  },
] as const;

export default function MeetManageSheet({
  open,
  onClose,
  onEdit,
  onParticipants,
  onRequests,
  onDelete,
}: Props) {
  const handlers = {
    edit: onEdit,
    participants: onParticipants,
    requests: onRequests,
  };

  return (
    <BottomSheet open={open} onClose={onClose} maxHeight="70dvh">
      <div
        style={{
          textAlign: "center",
          marginBottom: 24,
        }}
      >
        <div
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "#111827",
          }}
        >
          Управление встречей
        </div>

        <div
          style={{
            marginTop: 4,
            fontSize: 13,
            color: "#6B7280",
          }}
        >
          Выберите необходимое действие
        </div>
      </div>

      {actions.map((action) => (
        <motion.button
          key={action.key}
          whileTap={{ scale: 0.98 }}
          onClick={handlers[action.key]}
          style={{
            width: "100%",
            height: 74,
            marginBottom: 12,
            border: "none",
            background: "#fff",
            borderRadius: 18,
            padding: "0 18px",
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <div
            style={{
              fontSize: 17,
              fontWeight: 700,
              color: "#111827",
            }}
          >
            {action.title}
          </div>

          <div
            style={{
              marginTop: 4,
              fontSize: 13,
              color: "#6B7280",
            }}
          >
            {action.description}
          </div>
        </motion.button>
      ))}

      <div
        style={{
          margin: "10px 0 18px",
          height: 1,
          background: "#ECECEC",
        }}
      />

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={onDelete}
        style={{
          width: "100%",
          height: 74,
          border: "1px solid #FECACA",
          background: "#FFF5F5",
          borderRadius: 18,
          padding: "0 18px",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div
          style={{
            fontSize: 17,
            fontWeight: 700,
            color: "#DC2626",
          }}
        >
          🗑️ Удалить встречу
        </div>

        <div
          style={{
            marginTop: 4,
            fontSize: 13,
            color: "#EF4444",
          }}
        >
          Это действие нельзя отменить
        </div>
      </motion.button>
    </BottomSheet>
  );
}
