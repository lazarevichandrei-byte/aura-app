"use client";

import { useRef, useState } from "react";
import BottomSheet from "../BottomSheet";

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
            color: "#111827",
          }}
        >
          Удалить встречу?
        </div>

        <div
          style={{
            marginTop: 10,
            fontSize: 14,
            color: "#6B7280",
            lineHeight: 1.5,
          }}
        >
          Это действие нельзя отменить.
        </div>

        <div
          ref={trackRef}
          role="slider"
          aria-label="Свайпните вправо, чтобы удалить встречу"
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
            background: "#FEE2E2",
            overflow:"hidden",
            touchAction:"none",
          }}
        >
          <div style={{position:"absolute",inset:0,display:"grid",placeItems:"center",color:"#B91C1C",fontSize:14,fontWeight:700,pointerEvents:"none"}}>
            Свайпните вправо, чтобы удалить →
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
            Подтвердить удаление
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
            color: "#6B7280",
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          Отмена
        </button>
      </div>
    </BottomSheet>
  );
}
