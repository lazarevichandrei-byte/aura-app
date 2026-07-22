"use client";



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
  if (!open) return null;

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
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,.35)",
          zIndex: 1998,
        }}
      />

      <div
        style={{
  position: "fixed",
  left: 0,
  right: 0,
  bottom: 0,
  background: "#F8F8F8",
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  padding: "20px 20px calc(20px + env(safe-area-inset-bottom))",
  zIndex: 1999,
  maxHeight: "85vh",
  overflowY: "auto",
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
            fontSize: 20,
            fontWeight: 700,
            marginBottom: 20,
          }}
        >
          ⚙️ Управление встречей
        </div>

        <button style={itemStyle} onClick={onEdit}>
          ✏️ Редактировать
        </button>

        <button style={itemStyle} onClick={onParticipants}>
          👥 Участники
        </button>

        <button
          style={{
            ...itemStyle,
            color: "#EF4444",
          }}
          onClick={onDelete}
        >
          🗑️ Удалить встречу
        </button>

        
      </div>
    </>
  );
}