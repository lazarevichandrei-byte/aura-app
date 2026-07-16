"use client";

type Props = {

  place:string;

  city:string;

  onMapClick:()=>void;

  onCurrentLocationClick:()=>void;

};

export default function LocationCard({

  place,

  city,

  onMapClick,

  onCurrentLocationClick

}:Props){

  return(

    <div

  style={{

        background:"#fff",

        borderRadius:20,

        padding:"18px",

        cursor:"pointer",

        boxShadow:
          "0 4px 14px rgba(0,0,0,.05)"

      }}

    >

      <div
        style={{
          fontSize:14,
          color:"#8B95A7"
        }}
      >
        📍 Место встречи
      </div>

      {place ? (

        <>

          <div
            style={{
              marginTop:10,
              fontSize:18,
              fontWeight:700
            }}
          >
            {place}
          </div>

          <div
            style={{
              marginTop:4,
              color:"#6B7280"
            }}
          >
            {city}
          </div>

        </>

      ) : (

        <div
style={{
marginTop:16,
display:"flex",
flexDirection:"column",
gap:14
}}
>

<div

onClick={onMapClick}

style={buttonStyle}

>

<div style={iconStyle}>
🗺
</div>

<div
style={{
flex:1
}}
>

<div style={titleStyle}>
Выбрать место на карте
</div>

<div style={subtitleStyle}>
Выберите кафе, парк, ресторан
или любую точку встречи.
</div>

</div>

<div style={arrowStyle}>
›
</div>

</div>

<div

onClick={onCurrentLocationClick}

style={buttonStyle}

>

<div style={iconStyle}>
📡
</div>

<div
style={{
flex:1
}}
>

<div style={titleStyle}>
Использовать мою геолокацию
</div>

<div style={subtitleStyle}>
Мы автоматически определим
ваше текущее местоположение.
</div>

</div>

<div style={arrowStyle}>
›
</div>

</div>

</div>

      )}

    </div>

  );

}

const buttonStyle={

background:"#F8FAFD",

border:"1px solid #E3EDF8",

borderRadius:18,

padding:"16px",

display:"flex",

alignItems:"center",

gap:14,

cursor:"pointer",

boxShadow:
"0 4px 14px rgba(0,0,0,.04)"

} as const;

const iconStyle={

width:48,

height:48,

borderRadius:"50%",

background:
"linear-gradient(135deg,#2F80FF,#56CCF2)",

display:"flex",

alignItems:"center",

justifyContent:"center",

fontSize:22,

color:"#fff",

flexShrink:0

} as const;

const titleStyle={

fontSize:16,

fontWeight:700,

color:"#1F2937"

} as const;

const subtitleStyle={

marginTop:4,

fontSize:13,

lineHeight:1.45,

color:"#7B8595"

} as const;

const arrowStyle={

fontSize:28,

color:"#2F80FF"

} as const;