"use client";
import {useI18n} from "../I18nProvider";

type Props = {
  title: string;
  address: string;
  onSelect: () => void;
};

export default function PlaceBottomCard({
  title,
  address,
  onSelect
}: Props) {
  const {t}=useI18n();

  return(

    <div

      style={{

  position:"absolute",

  left:16,

  right:16,

  bottom:"calc(16px + env(safe-area-inset-bottom, 0px))",

  zIndex:30,

  background:"var(--nav-bg)",
  color:"var(--text-primary)",

  backdropFilter:"blur(24px)",

  WebkitBackdropFilter:"blur(24px)",

  border:"1px solid var(--border)",

  borderRadius:24,

  padding:"14px 16px",

  boxShadow:"var(--shadow-md)"

}}

    >

      <div

        style={{

  fontWeight:700,

  fontSize:17,

  color:"#111827",

  whiteSpace:"nowrap",

  overflow:"hidden",

  textOverflow:"ellipsis"

}}

      >

        📍 {title || t("map.choosePlace")}

      </div>

      <div

        style={{

  marginTop:4,

  color:"#6B7280",

  fontSize:13,

  whiteSpace:"nowrap",

  overflow:"hidden",

  textOverflow:"ellipsis"

}}

      >

        {address || t("map.moveMap")}

      </div>

      <button
onClick={onSelect}
       style={{

  marginTop:12,

  width:"100%",

  height:48,

  border:"none",

  borderRadius:16,

  background:"var(--primary)",

  color:"var(--text-inverse)",

  fontWeight:700,

  fontSize:15,

  letterSpacing:".2px",

  cursor:"pointer",

  boxShadow:"0 10px 24px rgba(47,128,255,.28)",

  transition:"all .2s ease"

}}

      >

        {t("map.usePlace")}

      </button>

    </div>

  );

}
