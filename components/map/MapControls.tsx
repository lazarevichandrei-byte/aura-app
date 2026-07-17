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

        right:18,

        bottom:150,

        display:"flex",

        flexDirection:"column",

        gap:12,

        zIndex:20

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

        width:44,
height:44,
borderRadius:22,
        background:"#fff",

        display:"flex",

        justifyContent:"center",

        alignItems:"center",

        cursor:"pointer",

        fontSize:20,

        fontWeight:700,

        boxShadow:"0 4px 12px rgba(0,0,0,.10)"

      }}

    >

      {children}

    </div>

  );

}