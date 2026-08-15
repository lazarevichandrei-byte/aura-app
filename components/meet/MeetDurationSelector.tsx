"use client";

import { formatMeetEndText, type MeetDuration } from "../../lib/meet/time";
import {useI18n} from "../I18nProvider";

type Props = {
  value: MeetDuration;
  onChange: (value: MeetDuration) => void;
  date: string;
  time: string;
};

export default function MeetDurationSelector({ value, onChange, date, time }: Props) {
  const {t,intlLocale}=useI18n();
  const OPTIONS: { id: MeetDuration; label: string }[] = [
    {id:"30m",label:t("meet.duration30")},{id:"1h",label:t("meet.duration1h")},{id:"2h",label:t("meet.duration2h")},{id:"day",label:t("meet.durationDay")}
  ];
  const endText = formatMeetEndText(date,time,value,intlLocale,{endsAt:(endTime)=>t("meet.endsAt",{time:endTime}),endsOn:(endDate)=>t("meet.endsOn",{date:endDate})});
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
