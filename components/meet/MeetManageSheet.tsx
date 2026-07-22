"use client";

import { motion, AnimatePresence } from "motion/react";



type Props = {
  open: boolean;
  onClose: () => void;
  onEdit: () => void;
  onParticipants: () => void;
  onDelete: () => void;
};

export default function MeetManageSheet({
  open,
  onClose,
  onEdit,
  onParticipants,
  onDelete,
}: Props) {
  

  const itemStyle = {
    width: "100%",
    height: 56,
    border: "none",
    background: "#fff",
    borderRadius: 14,
    fontSize: 17,
    fontWeight: 600,
    cursor: "pointer",
    marginBottom: 12,
    textAlign: "left" as const,
    padding: "0 18px",
  };

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
          zIndex: 1998,
        }}
      />

      <motion.div
        initial={{
          y: 80,
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        exit={{
          y: 80,
          opacity: 0,
        }}
        transition={{
          duration: 0.25,
        }}
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 80,
          background: "#F8F8F8",
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          padding: "20px 20px 32px",
          zIndex: 1999,
          boxShadow: "0 -8px 30px rgba(0,0,0,.12)",
        }}
      >
        <div
          style={{
            width: 54,
            height: 5,
            background: "#D1D5DB",
            borderRadius: 999,
            margin: "0 auto 18px",
          }}
        />

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
    fontWeight: 400,
    color: "#6B7280",
    lineHeight: 1.3,
  }}
>
            Выберите необходимое действие
          </div>
        </div>

        <motion.button
  whileTap={{ scale: 0.98 }}
  onClick={onEdit}
  style={{
    ...itemStyle,
    height: 74,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 18,
  }}
>
  <div>
    <div
      style={{
        fontSize: 17,
        fontWeight: 700,
        color: "#111827",
      }}
    >
      ✏️ Редактировать
    </div>

    <div
      style={{
        marginTop: 4,
        fontSize: 13,
        color: "#6B7280",
      }}
    >
      Изменить информацию
    </div>
  </div>

 
</motion.button>

<motion.button
  whileTap={{ scale: 0.98 }}
  onClick={onParticipants}
  style={{
    ...itemStyle,
    height: 74,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 18,
  }}
>
  <div>
    <div
      style={{
        fontSize: 17,
        fontWeight: 700,
        color: "#111827",
      }}
    >
      👥 Участники
    </div>

    <div
      style={{
        marginTop: 4,
        fontSize: 13,
        color: "#6B7280",
      }}
    >
      Управление участниками
    </div>
  </div>

 
</motion.button>

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
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 18px",
    cursor: "pointer",
  }}
>
  <div>
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
    fontWeight: 400,
    color: "#EF4444",
    lineHeight: 1.3,
  }}
>
      Это действие нельзя отменить
    </div>
  </div>

 
</motion.button>

        
      </motion.div>
      
      </>
    )}
  </AnimatePresence>
);
}