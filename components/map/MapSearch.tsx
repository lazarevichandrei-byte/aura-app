"use client";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function MapSearch({
  value,
  onChange
}: Props) {

  return (

    <div
      style={{
        padding: "16px 20px 12px"
      }}
    >

      <div
        style={{
          height: 52,
          borderRadius: 18,
          background: "#fff",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          boxShadow: "0 6px 20px rgba(0,0,0,.06)"
        }}
      >

        <div
          style={{
            fontSize: 18,
            marginRight: 10
          }}
        >
          🔍
        </div>

        <input
          value={value}
          onChange={(e)=>onChange(e.target.value)}
          placeholder="Кафе, парк или адрес..."
          style={{
            flex: 1,
            background: "transparent",
            fontSize: 15
          }}
        />

      </div>

    </div>

  );

}