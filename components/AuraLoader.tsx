"use client";

type Props = {
  size?: number;
  color?: string;
  fullscreen?: boolean;
  inline?: boolean;
  compact?: boolean;
  text?: string;
};

export default function AuraLoader({
  size = 56,
  color = "#2AABEE",
  fullscreen = false,
  inline = false,
  compact = false,
  text
}: Props) {
  return (
    <div
  style={{
  width: inline ? "auto" : "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: inline
  ? 0
  : fullscreen
  ? 0
  : compact
  ? 0
  : "40px 0",
  minHeight:
  fullscreen || compact
    ? "100vh"
    : "auto",
}}
>
      <div className="loader">
        <div className="ring"></div>
        <div className="glow"></div>
      </div>

      {text && (
  <span
    style={{
      marginLeft: 10,
      fontSize: 14,
      fontWeight: 500,
      color: "#374151",
    }}
  >
    {text}
  </span>
)}

      

      <style jsx>{`
        .loader {
          position: relative;
      width:${compact ? 36 : size}px;
height:${compact ? 36 : size}px;
        }

        

        .ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;

          border: 4px solid transparent;
          border-top: 2.5px solid ${color};
border-right: 2.5px solid ${color};

          animation: spin 0.9s linear infinite;

          box-shadow:
            0 0 6px rgba(59,130,246,.45),
0 0 14px rgba(59,130,246,.25);
        }

        .glow {
          position: absolute;
          inset: -10px;
          border-radius: 50%;

          background: radial-gradient(
            circle,
            rgba(59, 130, 246, 0.25) 0%,
            rgba(59, 130, 246, 0.12) 40%,
            transparent 75%
          );

          filter: blur(12px);

          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @keyframes pulse {
          0% {
            transform: scale(0.95);
            opacity: 0.45;
          }

          50% {
            transform: scale(1.08);
            opacity: 1;
          }

          100% {
            transform: scale(0.95);
            opacity: 0.45;
          }
        }
      `}</style>
    </div>
  );
}