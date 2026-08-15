"use client";

import { motion } from "motion/react";
import BottomSheet from "../BottomSheet";

type Props = {
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  onParticipants: () => void;
  onChat: () => void;
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
] as const;

export default function MeetManageSheet({
  open,
  onClose,
  onEdit,
  onParticipants,
  onChat,
}: Props) {
  const handlers = {
    edit: onEdit,
    participants: onParticipants,
    chat: onChat,
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
            color: "var(--text-primary)",
          }}
        >
          Управление встречей
        </div>

        <div
          style={{
            marginTop: 4,
            fontSize: 13,
            color: "var(--text-secondary)",
          }}
        >
          Выберите необходимое действие
        </div>
      </div>

      {[...actions, { title: "💬 Общий чат", description: "Открыть чат встречи", key: "chat" as const }]
        .map((action) => (
        <motion.button
          key={action.key}
          whileTap={{ scale: 0.98 }}
          onClick={handlers[action.key]}
          style={{
            width: "100%",
            height: 74,
            marginBottom: 12,
            border: "none",
            background: "var(--surface-secondary)",
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
              color: "var(--text-primary)",
            }}
          >
            {action.title}
          </div>

          <div
            style={{
              marginTop: 4,
              fontSize: 13,
              color: "var(--text-secondary)",
            }}
          >
            {action.description}
          </div>
        </motion.button>
      ))}

    </BottomSheet>
  );
}
