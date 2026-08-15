"use client";

import { motion } from "motion/react";
import BottomSheet from "../BottomSheet";
import {useI18n} from "../I18nProvider";

type Props = {
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  onParticipants: () => void;
  onChat: () => void;
};

export default function MeetManageSheet({
  open,
  onClose,
  onEdit,
  onParticipants,
  onChat,
}: Props) {
  const {t}=useI18n();
  const actions = [
    {title:`✏️ ${t("meet.edit")}`,description:t("meet.editDescription"),key:"edit" as const},
    {title:`👥 ${t("meet.participants")}`,description:t("meet.participantsManage"),key:"participants" as const},
  ];
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
          {t("meet.management")}
        </div>

        <div
          style={{
            marginTop: 4,
            fontSize: 13,
            color: "var(--text-secondary)",
          }}
        >
          {t("meet.chooseAction")}
        </div>
      </div>

      {[...actions, { title: `💬 ${t("meet.sharedChat")}`, description: t("meet.openChat"), key: "chat" as const }]
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
