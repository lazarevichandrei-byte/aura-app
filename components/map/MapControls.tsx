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

  bottom:130,

  display:"flex",

  flexDirection:"column",

  gap:10,

  zIndex:30,

  alignItems:"center"

}}

    >

      <CircleButton
        onClick={onLocation}
      >
        ◎
      </CircleButton>

      <CircleButton
        onClick={onZoomIn}
      >
        ＋
      </CircleButton>

      <CircleButton
        onClick={onZoomOut}
      >
        －
      </CircleButton>

    </div>

  );

}

function CircleButton({

  children,

  onClick

}:any){

  return(

    <div

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

  boxShadow:"0 10px 28px rgba(0,0,0,.12)",

  transition:"all .2s ease"

}}

    >

      {children}

    </div>

  );

}