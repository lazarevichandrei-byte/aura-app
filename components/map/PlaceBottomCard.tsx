"use client";

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

  return(

    <div

      style={{

  position:"absolute",

  left:16,

  right:16,

  bottom:16,

  zIndex:30,

  background:"rgba(255,255,255,.88)",

  backdropFilter:"blur(24px)",

  WebkitBackdropFilter:"blur(24px)",

  border:"1px solid rgba(255,255,255,.65)",

  borderRadius:24,

  padding:"14px 16px",

  boxShadow:"0 18px 45px rgba(0,0,0,.16)"

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

        📍 {title || "Выберите место"}

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

        {address || "Переместите карту"}

      </div>

      <button
onClick={onSelect}
       style={{

  marginTop:12,

  width:"100%",

  height:48,

  border:"none",

  borderRadius:16,

  background:"linear-gradient(135deg,#2F80FF,#56CCF2)",

  color:"#fff",

  fontWeight:700,

  fontSize:15,

  letterSpacing:".2px",

  cursor:"pointer",

  boxShadow:"0 10px 24px rgba(47,128,255,.28)",

  transition:"all .2s ease"

}}

      >

        Использовать место

      </button>

    </div>

  );

}