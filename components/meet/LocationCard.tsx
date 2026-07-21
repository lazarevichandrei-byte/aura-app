"use client";

type Props = {
  place: string;
  city: string;
  onMapClick: () => void;
  onCurrentLocationClick: () => void;
};

export default function LocationCard({
  place,
  city,
  onMapClick,
  onCurrentLocationClick
}: Props) {

  if (place) {

    return (

      <div
        style={{
          background:"#fff",
          borderRadius:18,
          padding:16,
          boxShadow:"0 4px 14px rgba(0,0,0,.05)"
        }}
      >

        <div
          style={{
            fontSize:13,
            color:"#8B95A7"
          }}
        >
          📍 Место встречи
        </div>

        <div
          style={{
            marginTop:8,
            fontSize:17,
            fontWeight:700
          }}
        >
          {place}
        </div>

        <div
          style={{
            marginTop:2,
            color:"#7B8595",
            fontSize:14
          }}
        >
          {city}
        </div>

      </div>

    );

  }

  return (

  <div
    onClick={onMapClick}
    style={{
      background:"#fff",
      borderRadius:18,
      cursor: "pointer",
      boxShadow:"0 4px 14px rgba(0,0,0,.05)"
    }}
  >

      <div
        style={{
          display:"flex"
        }}
      >

        {/* Карта */}

        <div
          onClick={onMapClick}
          style={{
            flex:1,
            padding:"16px",
            cursor:"pointer"
          }}
        >

          <div
            style={{
              fontSize:26
            }}
          >
            🗺
          </div>

          <div
            style={{
              marginTop:8,
              fontWeight:700,
              fontSize:15
            }}
          >
            На карте
          </div>

          <div
            style={{
              marginTop:4,
              color:"#7B8595",
              fontSize:12,
              lineHeight:1.4
            }}
          >
            Выбрать место
          </div>

        </div>

        <div
          style={{
            width:1,
            background:"#EEF2F6"
          }}
        />

        {/* GPS */}

        <div
          onClick={onCurrentLocationClick}
          style={{
            flex:1,
            padding:"16px",
            cursor:"pointer"
          }}
        >

          <div
            style={{
              fontSize:26
            }}
          >
            📡
          </div>

          <div
            style={{
              marginTop:8,
              fontWeight:700,
              fontSize:15
            }}
          >
            Моё место
          </div>

          <div
            style={{
              marginTop:4,
              color:"#7B8595",
              fontSize:12,
              lineHeight:1.4
            }}
          >
            GPS автоматически
          </div>

        </div>

      </div>

    </div>

  );

}