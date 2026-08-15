"use client";

type Props = {
  value: {
    id: string;
    name: string;
    icon: string;
  } | null;
  onClick: () => void;
};

export default function CategoryPicker({
  value,
  onClick,
}: Props) {
  return (
    <div
      onClick={onClick}
      style={{
        height: 58,
        borderRadius: 18,
        background: "var(--surface-secondary)",
        color:"var(--text-primary)",
        border:"1px solid var(--border)",
        padding: "0 18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        cursor: "pointer",
        boxShadow: "0 2px 8px rgba(0,0,0,.04)",
        transition: ".2s",
      }}
    >
      <div>

        <div
          style={{
            fontSize: 12,
            color: "var(--text-secondary)",
            marginBottom: 3,
          }}
        >
          Категория
        </div>

        <div
          style={{
            fontWeight: 600,
            fontSize: 16,
          }}
        >
          {value
            ? `${value.icon} ${value.name}`
            : "Выберите категорию"}
        </div>

      </div>

    </div>
  );
}
