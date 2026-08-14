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
            style={{ height: 48, border: 0, borderRadius: 14, fontWeight: 600, background: value === item.id ? "#2F80FF" : "#fff", color: value === item.id ? "#fff" : "#222", boxShadow: "0 2px 8px rgba(0,0,0,.04)" }}
          >
            {item.label}
          </button>
        ))}
      </div>
      {endText && <div style={{ marginTop: 9, color: "#6B7280", fontSize: 13 }}>{endText}</div>}
    </>
  );
}
