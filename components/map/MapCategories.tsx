"use client";

const categories = [
  "☕",
  "🍕",
  "🚶",
  "🎬",
  "🎉",
  "⚽"
];

export default function MapCategories() {

  return (

    <div
      style={{
        display: "flex",
        gap: 8,
        overflowX: "auto",
        padding: "0 16px 8px"
      }}
    >

      {categories.map((item)=>(
        <div
          key={item}
          style={{
            minWidth:40,
            width:40,
            height:40,
            borderRadius:20,   
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
           boxShadow:"0 4px 10px rgba(0,0,0,.06)",
            fontSize: 18
          }}
        >
          {item}
        </div>
      ))}

    </div>

  );

}