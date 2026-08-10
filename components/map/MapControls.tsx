"use client";

type Props = {

  onLocation:()=>void;

  onZoomIn:()=>void;

  onZoomOut:()=>void;

};

export default function MapControls({

  onLocation,

  onZoomIn,

  onZoomOut

}:Props){

  return(

    <div

     style={{

  position:"absolute",

  right:16,

  bottom:"calc(154px + env(safe-area-inset-bottom, 0px))",

  display:"flex",

  flexDirection:"column",

  gap:10,

  zIndex:30,

  alignItems:"center"

}}

    >

      <CircleButton
        onClick={onLocation}
        ariaLabel="Моя геолокация"
      >
        ◎
      </CircleButton>

      <CircleButton
        onClick={onZoomIn}
        ariaLabel="Приблизить карту"
      >
        ＋
      </CircleButton>

      <CircleButton
        onClick={onZoomOut}
        ariaLabel="Отдалить карту"
      >
        －
      </CircleButton>

    </div>

  );

}

function CircleButton({

  children,

  onClick,

  ariaLabel

}:{ children: React.ReactNode; onClick: () => void; ariaLabel: string }){

  return(

    <button
      type="button"
      aria-label={ariaLabel}

      onClick={onClick}

      style={{

  width:50,
  height:50,

  borderRadius:25,

  background:"rgba(255,255,255,.92)",

  backdropFilter:"blur(18px)",

  WebkitBackdropFilter:"blur(18px)",

  display:"flex",

  justifyContent:"center",

  alignItems:"center",

  cursor:"pointer",

  userSelect:"none",

  fontSize:22,

  fontWeight:700,

  color:"#2F80FF",

  border:"1px solid rgba(255,255,255,.7)",

  padding:0,

  boxShadow:"0 10px 28px rgba(0,0,0,.12)",

  transition:"all .2s ease"

}}

    >

      {children}

    </button>

  );

}
