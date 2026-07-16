"use client";

type Props = {

  place:string;

  city:string;

  onClick:()=>void;

};

export default function LocationCard({

  place,

  city,

  onClick

}:Props){

  return(

    <div

      onClick={onClick}

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
            marginTop:12,
            color:"#2F80FF",
            fontWeight:600
          }}
        >
          Выбрать на карте →
        </div>

      )}

    </div>

  );

}