import { ImageResponse } from "next/og";

/** アプリアイコン（ロゴ画像が用意できたら public/ に置いて差し替える） */
export function appIcon(size: number) {
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
          background: "#00874a",
          color: "white",
          fontWeight: 800,
        }}
      >
        <div style={{ fontSize: size * 0.34, letterSpacing: -size * 0.01, lineHeight: 1 }}>AGU</div>
        <div style={{ fontSize: size * 0.11, letterSpacing: size * 0.02, marginTop: size * 0.03 }}>EKIDEN</div>
      </div>
    ),
    { width: size, height: size },
  );
}
