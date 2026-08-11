import { MEET_CATEGORIES } from "../../lib/meet/categories";

type MeetCategoryAvatarProps = {
  category?: string | null;
  size?: number;
};

export default function MeetCategoryAvatar({
  category,
  size = 60,
}: MeetCategoryAvatarProps) {
  const meetCategory = MEET_CATEGORIES.find((item) => item.id === category);

  return (
    <div
      aria-label={meetCategory?.name || "Встреча"}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #EAF2FF, #F4EEFF)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        fontSize: Math.round(size * 0.44),
        lineHeight: 1,
      }}
    >
      {meetCategory?.icon || "✨"}
    </div>
  );
}
