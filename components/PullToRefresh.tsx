"use client";

import {
  ReactNode,
  useRef,
  useState
} from "react";

type Props = {
  children: ReactNode;
  enabled?: boolean;
  threshold?: number;
  onRefresh: () => Promise<void> | void;
};

export default function PullToRefresh({
  children,
  onRefresh,
  enabled = true,
  threshold = 70
}: Props) {

  const startY = useRef<number | null>(null);

  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] =
    useState(false);

  function reset() {
    startY.current = null;
    setPull(0);
  }

  async function triggerRefresh() {

    if (refreshing) return;

    setRefreshing(true);

    try {

      await onRefresh();

    } finally {

      setTimeout(() => {

        setRefreshing(false);
        reset();

      }, 400);

    }

  }

  return (

    <div

      onTouchStart={(e) => {

        if (!enabled || refreshing) return;

        startY.current =
          e.touches[0].clientY;

      }}

      onTouchMove={(e) => {

        if (
          !enabled ||
          refreshing ||
          startY.current === null
        ) {
          return;
        }

        const distance =
          e.touches[0].clientY -
          startY.current;

        if (distance <= 0) {
          return;
        }

        setPull(
          Math.min(distance * 0.45, threshold)
        );

      }}

      onTouchEnd={async () => {

  if (
    enabled &&
    pull >= threshold
  ) {

    await triggerRefresh();

    return;

  }

  reset();

}}

    >

      <div
        style={{
          height: refreshing ? 42 : pull,
          overflow: "hidden",
          transition: "height .18s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >

        {refreshing && (
          <div
            style={{
              fontSize: 13,
              color: "#2F80FF",
              fontWeight: 600
            }}
          >
            Обновление...
          </div>
        )}

      </div>

      {children}

    </div>

  );

}