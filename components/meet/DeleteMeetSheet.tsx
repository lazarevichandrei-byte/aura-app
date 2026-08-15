"use client";

import { useRef, useState } from "react";
import BottomSheet from "../BottomSheet";
import {useI18n} from "../I18nProvider";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function DeleteMeetSheet({
  open,
  onClose,
  onConfirm,
}: Props) {
  const {t}=useI18n();
  const trackRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [armed, setArmed] = useState(false);

  function finish() {
    const max = Math.max(0, (trackRef.current?.clientWidth ?? 0) - 58);
    if (max > 0 && offset >= max * 0.85) {
      setOffset(max);
      onConfirm();
    } else {
      setOffset(0);
    }
    setDragging(false);
  }

  return (
    <BottomSheet open={open} onClose={onClose} maxHeight="50dvh">
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 44 }}>🗑️</div>

        <div
          style={{
            marginTop: 10,
            fontSize: 22,
            fontWeight: 700,
            color: "var(--text-primary)",
          }}
        >
          {t("meet.deleteTitle")}
        </div>

        <div
          style={{
            marginTop: 10,
            fontSize: 14,
            color: "var(--text-secondary)",
            lineHeight: 1.5,
          }}
        >
          {t("meet.deleteIrreversible")}
        </div>

        <div
          ref={trackRef}
          role="slider"
          aria-label={t("meet.deleteSwipeAria")}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(offset / Math.max(1, (trackRef.current?.clientWidth ?? 58) - 58) * 100)}
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") setArmed((value) => !value);
          }}
          style={{
            position:"relative",
            width: "100%",
            height: 54,
            marginTop: 28,
            borderRadius: 16,
            background: "var(--danger-soft)",
            overflow:"hidden",
            touchAction:"none",
          }}
        >
          <div style={{position:"absolute",inset:0,display:"grid",placeItems:"center",color:"var(--danger)",fontSize:14,fontWeight:700,pointerEvents:"none"}}>
            {t("meet.deleteSwipe")}
          </div>
          <div
            onPointerDown={(event)=>{setDragging(true); event.currentTarget.setPointerCapture(event.pointerId);}}
            onPointerMove={(event)=>{
              if (!dragging || !trackRef.current) return;
              const bounds = trackRef.current.getBoundingClientRect();
              setOffset(Math.max(0, Math.min(event.clientX - bounds.left - 27, bounds.width - 58)));
            }}
            onPointerUp={finish}
            onPointerCancel={finish}
            style={{position:"absolute",left:4,top:4,width:46,height:46,borderRadius:13,transform:`translateX(${offset}px)`,background:"#EF4444",color:"#fff",display:"grid",placeItems:"center",fontSize:22,cursor:"grab",transition:dragging?"none":"transform .2s ease"}}
          >→</div>
        </div>

        {armed && (
          <button onClick={onConfirm} style={{width:"100%",height:48,marginTop:12,border:"none",borderRadius:14,background:"#EF4444",color:"#fff",fontWeight:700}}>
            {t("meet.deleteConfirm")}
          </button>
        )}

        <button
          onClick={onClose}
          style={{
            width: "100%",
            height: 50,
            marginTop: 12,
            border: "none",
            background: "transparent",
            color: "var(--text-secondary)",
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          {t("common.cancel")}
        </button>
      </div>
    </BottomSheet>
  );
}
