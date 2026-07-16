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
        gap: 10,
        overflowX: "auto",
        padding: "0 20px 14px"
      }}
    >

      {categories.map((item)=>(
        <div
          key={item}
          style={{
            minWidth: 46,
            height: 46,
            borderRadius: 23,
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 6px 16px rgba(0,0,0,.05)",
            fontSize: 20
          }}
        >
          {item}
        </div>
      ))}

    </div>

  );

}