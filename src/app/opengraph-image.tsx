import { ImageResponse } from "next/og";

export const alt = "VINTATE — curated vintage tees";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#F7F4EF",
        color: "#1a1a1a",
      }}
    >
      <div
        style={{
          fontSize: 140,
          fontWeight: 600,
          letterSpacing: 28,
          paddingLeft: 28,
        }}
      >
        VINTATE
      </div>
      <div
        style={{
          marginTop: 8,
          fontSize: 32,
          letterSpacing: 8,
          textTransform: "uppercase",
          color: "#6b6b6b",
        }}
      >
        A curated fashion edit
      </div>
    </div>,
    { ...size },
  );
}
