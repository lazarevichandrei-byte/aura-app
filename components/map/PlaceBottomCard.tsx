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

        background:"#fff",

        borderRadius:18,
padding:14,

        boxShadow:"0 18px 40px rgba(0,0,0,.12)"

      }}

    >

      <div

        style={{

          fontWeight:700,

          fontSize:16

        }}

      >

        📍 {title || "Выберите место"}

      </div>

      <div

        style={{

          marginTop:2,

          color:"#6B7280"

        }}

      >

        {address || "Переместите карту"}

      </div>

      <button
onClick={onSelect}
        style={{
  marginTop:12,
  width:"100%",
  height:44,
  border:"none",
  borderRadius:14,
  background:"linear-gradient(135deg,#2F80FF,#56CCF2)",
  color:"#fff",
  fontWeight:700,
  fontSize:15,
  cursor:"pointer"
}}

      >

        Использовать место

      </button>

    </div>

  );

}