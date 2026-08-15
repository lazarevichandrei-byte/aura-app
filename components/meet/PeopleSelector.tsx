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

        background:"var(--surface-secondary)",
        color:"var(--text-primary)",
        border:"1px solid var(--border)",

        borderRadius:18,

        padding:"10px 14px",

        boxShadow:
          "0 4px 14px rgba(0,0,0,.05)"

      }}

    >

      <button

        onClick={()=>{

            
if (value > 1) {
  onChange(value - 1);
}

        }}

        style={buttonStyle}

      >

        −

      </button>

      <div
  style={{
    flex:1,
    textAlign:"center"
  }}
>

        <div
          style={{
            fontSize:20,
            fontWeight:700
          }}
        >
          {value}
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

width:42,

height:42,

border:"none",

borderRadius:"50%",

background:"var(--primary-soft)",

fontSize:24,

fontWeight:700,

cursor:"pointer",

color:"var(--brand-primary)"

} as const;
