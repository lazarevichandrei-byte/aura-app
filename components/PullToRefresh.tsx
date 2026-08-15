"use client";

import PullToRefreshLib from "react-simple-pull-to-refresh";
import AuraLoader from "./AuraLoader";
import { ReactNode } from "react";
import {useI18n} from "./I18nProvider";

type Props = {
  children: ReactNode;
  onRefresh: () => Promise<void>;
};

export default function PullToRefresh({
  children,
  onRefresh,
}: Props) {
  const {t}=useI18n();
  return (
    <PullToRefreshLib
      onRefresh={onRefresh}
      pullingContent={
        <div
          style={{
            height: 70,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--brand-primary)",
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          {t("common.refreshPull")}
        </div>
      }
      canFetchMore={false}
      refreshingContent={
        <div
          style={{
            height: 70,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <AuraLoader inline size={26} />
          <span
            style={{
              color: "var(--brand-primary)",
              fontWeight: 600,
            }}
          >
            {t("common.refreshing")}
          </span>
        </div>
      }
      resistance={2.2}
      maxPullDownDistance={110}
    >
      {children}
    </PullToRefreshLib>
  );
}
