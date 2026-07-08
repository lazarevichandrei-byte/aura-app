"use client";

import PullToRefreshLib from "react-simple-pull-to-refresh";
import AuraLoader from "./AuraLoader";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  onRefresh: () => Promise<void>;
};

export default function PullToRefresh({
  children,
  onRefresh,
}: Props) {
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
            color: "#2AABEE",
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          Потяни вниз
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
              color: "#2AABEE",
              fontWeight: 600,
            }}
          >
            Обновляем...
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