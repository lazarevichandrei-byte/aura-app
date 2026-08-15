import { MEET_CATEGORIES } from "../../lib/meet/categories";
import {useI18n} from "../I18nProvider";
import type {TranslationKey} from "../../lib/i18n/dictionary";

type MeetCategoryAvatarProps = {
  category?: string | null;
  size?: number;
};

export default function MeetCategoryAvatar({
  category,
  size = 60,
}: MeetCategoryAvatarProps) {
  const {t}=useI18n();
  const meetCategory = MEET_CATEGORIES.find((item) => item.id === category);

  return (
    <div
      aria-label={meetCategory ? t(meetCategory.translationKey as TranslationKey) : t("chats.meeting")}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "var(--primary-soft)",
        border:"1px solid var(--brand-border)",
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
