"use client";

export default function PlaceBottomCard(){

  return(

    <div

      style={{

        position:"absolute",

        left:16,

        right:16,

        bottom:24,

        zIndex:30,

        background:"#fff",

        borderRadius:24,

        padding:20,

        boxShadow:"0 18px 40px rgba(0,0,0,.12)"

      }}

    >

      <div

        style={{

          fontWeight:700,

          fontSize:18

        }}

      >

        📍 Green City

      </div>

      <div

        style={{

          marginTop:6,

          color:"#6B7280"

        }}

      >

        Минск

      </div>

      <button

        style={{

          marginTop:18,

          width:"100%",

          height:52,

          border:"none",

          borderRadius:18,

          background:
            "linear-gradient(135deg,#2F80FF,#56CCF2)",

          color:"#fff",

          fontWeight:700,

          cursor:"pointer"

        }}

      >

        Использовать место

      </button>

    </div>

  );

}