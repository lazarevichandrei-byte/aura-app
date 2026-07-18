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
        padding: "8px 16px 8px"
      }}
    >

      <div
        style={{
          height: 46,
          borderRadius: 16,
          background: "#fff",
          display: "flex",
          alignItems: "center",
          padding: "0 14px",
          boxShadow: "0 6px 20px rgba(0,0,0,.06)"
        }}
      >

        <div
          style={{
            fontSize: 16,
            marginRight: 8
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
            fontSize: 14
          }}
        />

      </div>

    </div>

  );

}