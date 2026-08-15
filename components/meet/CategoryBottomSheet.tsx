"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import BottomSheet from "../BottomSheet";
import { CATEGORY_GROUPS, MEET_CATEGORIES } from "../../lib/meet/categories";

type Props = {
  open: boolean;
  onClose: () => void;
  value: string | null;
  onSelect: (id: string | null) => void;
  allowAll?: boolean;
};

export default function CategoryBottomSheet({
  open,
  onClose,
  value,
  onSelect,
  allowAll = false,
}: Props) {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  useEffect(() => {
    if (open) setSelectedGroup(null);
  }, [open]);

  const closeSheet = () => {
    setSelectedGroup(null);
    onClose();
  };

  const selectCategory = (categoryId: string | null) => {
    onSelect(categoryId);
    closeSheet();
  };

  const selectedGroupName = CATEGORY_GROUPS.find(
    (group) => group.id === selectedGroup
  )?.name;

  return (
    <BottomSheet open={open} onClose={closeSheet} height="min(72dvh, 640px)">
      <div style={contentStyle}>
        <div style={headerStyle}>
          {selectedGroup && (
            <button
              type="button"
              aria-label="Назад к группам категорий"
              onClick={() => setSelectedGroup(null)}
              style={backButtonStyle}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 18L9 12L15 6" />
              </svg>
            </button>
          )}

          <div style={titleStyle}>
            {selectedGroupName ?? "Выберите категорию"}
          </div>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {!selectedGroup ? (
            <motion.div
              key="groups"
              initial={{ x: -40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -40, opacity: 0 }}
              transition={{ duration: 0.22 }}
            >
              {allowAll && (
                <CategoryRow
                  icon="🔍"
                  name="Все категории"
                  selected={value === null}
                  onClick={() => selectCategory(null)}
                />
              )}

              {CATEGORY_GROUPS.map((group) => (
                <CategoryRow
                  key={group.id}
                  icon={group.icon}
                  name={group.name}
                  trailing="›"
                  onClick={() => setSelectedGroup(group.id)}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="categories"
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 40, opacity: 0 }}
              transition={{ duration: 0.22 }}
            >
              {MEET_CATEGORIES.filter(
                (category) => category.group === selectedGroup
              ).map((category) => (
                <CategoryRow
                  key={category.id}
                  icon={category.icon}
                  name={category.name}
                  selected={value === category.id}
                  onClick={() => selectCategory(category.id)}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </BottomSheet>
  );
}

function CategoryRow({
  icon,
  name,
  selected = false,
  trailing,
  onClick,
}: {
  icon: string;
  name: string;
  selected?: boolean;
  trailing?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ ...rowStyle, background: selected ? "var(--primary-soft)" : "transparent" }}
    >
      <span style={rowLabelStyle}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        <span>{name}</span>
      </span>
      <span style={trailingStyle}>{selected ? "✓" : trailing}</span>
    </button>
  );
}

const contentStyle = {
  flex: 1,
  overflowY: "auto" as const,
  overscrollBehavior: "contain" as const,
  paddingBottom: 16,
};

const headerStyle = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  minHeight: 34,
  marginBottom: 14,
};

const titleStyle = { fontSize: 20, fontWeight: 700 };

const backButtonStyle = {
  width: 34,
  height: 34,
  padding: 0,
  border: 0,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "var(--primary)",
  background: "transparent",
  cursor: "pointer",
};

const rowStyle = {
  width: "100%",
  height: 56,
  padding: "0 8px",
  border: 0,
  borderBottom: "1px solid var(--border-subtle)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  color: "var(--text-primary)",
  cursor: "pointer",
  textAlign: "left" as const,
};

const rowLabelStyle = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  fontSize: 16,
  fontWeight: 500,
};

const trailingStyle = {
  minWidth: 20,
  color: "var(--primary)",
  fontSize: 20,
  fontWeight: 700,
  textAlign: "center" as const,
};
