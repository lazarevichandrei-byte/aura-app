"use client";

export default function MeetMap(){

  return(

    <div

      style={{

        width:"100%",

        height:"100%",

        borderRadius:22,

        background:
          "linear-gradient(135deg,#EEF6FF,#DCEEFF)",

        display:"flex",

        justifyContent:"center",

        alignItems:"center",

        flexDirection:"column"

      }}

    >

      <div
        style={{
          fontSize:70
        }}
      >
        🗺
      </div>

      <div
        style={{
          marginTop:12,
          fontSize:20,
          fontWeight:700
        }}
      >
        Карта встреч
      </div>

      <div
        style={{
          marginTop:6,
          color:"#6B7280"
        }}
      >
        Следующим шагом подключим Leaflet
      </div>

    </div>

  );

}