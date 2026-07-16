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

        bottom:170,

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

        width:52,

        height:52,

        borderRadius:26,

        background:"#fff",

        display:"flex",

        justifyContent:"center",

        alignItems:"center",

        cursor:"pointer",

        fontSize:24,

        fontWeight:700,

        boxShadow:"0 8px 22px rgba(0,0,0,.12)"

      }}

    >

      {children}

    </div>

  );

}