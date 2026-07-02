"use client";

export default function AuraLoader() {
  return (
    <div
  style={{
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px 0",
  }}
>
      <div className="loader">
        <div className="ring"></div>
        <div className="glow"></div>
      </div>

      <style jsx>{`
        .loader {
          position: relative;
         width: 56px;
height: 56px;
        }

        .ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;

          border: 4px solid transparent;
          border-top: 2.5px solid #3b82f6;
border-right: 2.5px solid #60a5fa;

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