"use client";

import { useRef, useState } from "react";

type Props = {
  onDelete: () => Promise<void>;
};

export default function MeetDeleteSlider({ onDelete }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function finish() {
    const max = Math.max(0, (trackRef.current?.clientWidth ?? 0) - 58);
    setDragging(false);
    if (deleting || max === 0 || offset < max * 0.88) {
      setOffset(0);
      return;
    }

    setOffset(max);
    setDeleting(true);
    try {
      await onDelete();
    } catch {
      setOffset(0);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div
      ref={trackRef}
      role="slider"
      aria-label="Свайпните вправо, чтобы удалить встречу"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(offset / Math.max(1, (trackRef.current?.clientWidth ?? 58) - 58) * 100)}
      aria-disabled={deleting}
      style={{position:"relative",width:"100%",height:54,borderRadius:16,background:"#FEE2E2",overflow:"hidden",touchAction:"none",opacity:deleting?.7:1}}
    >
      <div style={{position:"absolute",inset:0,display:"grid",placeItems:"center",color:"#B91C1C",fontSize:14,fontWeight:700,pointerEvents:"none"}}>
        {deleting ? "Удаляем встречу…" : "Свайпните вправо, чтобы удалить →"}
      </div>
      <div
        onPointerDown={(event)=>{
          if (deleting) return;
          setDragging(true);
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event)=>{
          if (!dragging || deleting || !trackRef.current) return;
          const bounds = trackRef.current.getBoundingClientRect();
          setOffset(Math.max(0, Math.min(event.clientX - bounds.left - 27, bounds.width - 58)));
        }}
        onPointerUp={()=>void finish()}
        onPointerCancel={()=>void finish()}
        style={{position:"absolute",left:4,top:4,width:46,height:46,borderRadius:13,transform:`translateX(${offset}px)`,background:"#EF4444",color:"#fff",display:"grid",placeItems:"center",fontSize:22,cursor:deleting?"default":"grab",transition:dragging?"none":"transform .2s ease"}}
      >→</div>
    </div>
  );
}
