"use client";

type Props = {

  value:number;

  onChange:(value:number)=>void;

};

export default function PeopleSelector({

  value,

  onChange

}:Props){

  return(

    <div

      style={{

        display:"flex",

        alignItems:"center",

        justifyContent:"space-between",

        background:"#fff",

        borderRadius:18,

        padding:"12px",

        boxShadow:
          "0 4px 14px rgba(0,0,0,.05)"

      }}

    >

      <button

        onClick={()=>{

          if(value>2){

            onChange(value-1);

          }

        }}

        style={buttonStyle}

      >

        −

      </button>

      <div
        style={{
          textAlign:"center"
        }}
      >

        <div
          style={{
            fontSize:26,
            fontWeight:700
          }}
        >
          {value}
        </div>

        <div
          style={{
            color:"#8B95A7",
            fontSize:13
          }}
        >
          участников
        </div>

      </div>

      <button

        onClick={()=>{

          if(value<50){

            onChange(value+1);

          }

        }}

        style={buttonStyle}

      >

        +

      </button>

    </div>

  );

}

const buttonStyle={

width:54,

height:54,

border:"none",

borderRadius:"50%",

background:"#EEF5FF",

fontSize:28,

fontWeight:700,

cursor:"pointer",

color:"#2F80FF"

} as const;