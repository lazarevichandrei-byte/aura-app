"use client";

type Props = {
  width?: number | string;
  height?: number | string;
  radius?: number;
};

export default function AuraSkeleton({
  width = "100%",
  height = 20,
  radius = 12
}: Props) {
  return (
    <>
      <div
        className="aura-skeleton"
        style={{
          width,
          height,
          borderRadius: radius
        }}
      />

      <style jsx>{`
        .aura-skeleton{
          position:relative;
          overflow:hidden;

          background:#EEF2F7;
        }

        .aura-skeleton::after{

          content:"";

          position:absolute;
          inset:0;

          transform:translateX(-100%);

          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(255,255,255,.75),
              transparent
            );

          animation:
            shimmer 1.2s linear infinite;

        }

        @keyframes shimmer{

          100%{

            transform:translateX(100%);

          }

        }

      `}</style>
    </>
  );
}