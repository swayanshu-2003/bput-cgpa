import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "BPUT CGPA Calculator — Free Grade & Percentage Tool";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #060d1f 0%, #0d1a36 50%, #111827 100%)",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(79,70,229,0.25) 0%, transparent 70%)",
            top: -100,
            left: -100,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)",
            bottom: -100,
            right: -100,
          }}
        />

        {/* Graduation cap icon */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 96,
            height: 96,
            borderRadius: 20,
            background: "#4f46e5",
            marginBottom: 32,
            boxShadow: "0 8px 40px rgba(79,70,229,0.5)",
          }}
        >
          <svg viewBox="0 0 100 100" width="60" height="60">
            <polygon points="50,18 88,36 50,54 12,36" fill="white" opacity="0.96" />
            <rect x="82" y="36" width="6" height="22" fill="white" opacity="0.88" rx="3" />
            <circle cx="85" cy="60" r="6" fill="#a5b4fc" />
            <path
              d="M50,54 L50,71 Q50,81 66,81 Q82,81 82,71"
              stroke="white"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 54,
            fontWeight: 900,
            color: "white",
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          BPUT CGPA Calculator
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 24,
            color: "rgba(148,163,184,0.9)",
            textAlign: "center",
            maxWidth: 700,
            lineHeight: 1.4,
            marginBottom: 40,
          }}
        >
          Free Grade &amp; Percentage Tool for Biju Patnaik University of Technology
        </div>

        {/* Feature pills */}
        <div style={{ display: "flex", gap: 16 }}>
          {["Instant Results", "100% Private", "PDF Download"].map((label) => (
            <div
              key={label}
              style={{
                padding: "10px 22px",
                borderRadius: 999,
                background: "rgba(79,70,229,0.2)",
                border: "1px solid rgba(99,102,241,0.4)",
                color: "#a5b4fc",
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Site URL */}
        <div
          style={{
            position: "absolute",
            bottom: 32,
            color: "rgba(100,116,139,0.8)",
            fontSize: 18,
          }}
        >
          bput-cgpa.vercel.app
        </div>
      </div>
    ),
    { ...size }
  );
}
