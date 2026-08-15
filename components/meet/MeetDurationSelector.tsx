"use client";

import { formatMeetEndText, type MeetDuration } from "../../lib/meet/time";

type Props = {
  value: MeetDuration;
  onChange: (value: MeetDuration) => void;
  date: string;
  time: string;
};

const OPTIONS: { id: MeetDuration; label: string }[] = [
  { id: "30m", label: "30 минут" },
  { id: "1h", label: "1 час" },
  { id: "2h", label: "2 часа" },
  { id: "day", label: "До конца дня" },
];

export default function MeetDurationSelector({ value, onChange, date, time }: Props) {
  const endText = formatMeetEndText(date, time, value);
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {OPTIONS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            style={{height:48,border:"1px solid",borderColor:value === item.id ? "var(--brand-primary)" : "var(--border)",borderRadius:14,fontWeight:600,background:value === item.id ? "var(--brand-gradient)" : "var(--surface-secondary)",color:value === item.id ? "var(--text-inverse)" : "var(--text-primary)",boxShadow:"var(--shadow-sm)"}}
          >
            {item.label}
          </button>
        ))}
      </div>
      {endText && <div style={{marginTop:9,color:"var(--text-secondary)",fontSize:13}}>{endText}</div>}
    </>
  );
}
