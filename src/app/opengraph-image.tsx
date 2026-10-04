import { ImageResponse } from "next/og";

export const alt = "Priyansh";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const LETTERS = [
  { ch: "P", c: "#EFEBE3", tc: "#121A35", r: -3 },
  { ch: "r", c: "#2E4078", tc: "#EFEBE3", r: 2 },
  { ch: "i", c: "#F2A93B", tc: "#121A35", r: -1 },
  { ch: "y", c: "#B83A28", tc: "#EFEBE3", r: 3 },
  { ch: "a", c: "#EFEBE3", tc: "#121A35", r: -2 },
  { ch: "n", c: "#121A35", tc: "#EFEBE3", r: 1 },
  { ch: "s", c: "#F2A93B", tc: "#121A35", r: -3 },
  { ch: "h", c: "#2E4078", tc: "#EFEBE3", r: 2 },
];

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "#22305A",
          backgroundImage: "repeating-linear-gradient(135deg, rgba(255,255,255,.04) 0 2px, transparent 2px 6px)",
          color: "#EFEBE3",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <div style={{ display: "flex", gap: 14 }}>
          {LETTERS.map((l, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 118,
                height: 150,
                borderRadius: 12,
                background: l.c,
                color: l.tc,
                fontSize: 128,
                fontWeight: 800,
                letterSpacing: -6,
                transform: `rotate(${l.r}deg)`,
                boxShadow: "0 6px 0 rgba(0,0,0,.25)",
                border: "3px dashed " + (l.c === "#F2A93B" ? "#121A35" : "#F2A93B"),
              }}
            >
              {l.ch}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 40, lineHeight: 1.2, maxWidth: 900 }}>
            I build software that notices when things break, and patches them before anyone has to.
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: "#B3BBD6" }}>
            <span>Full-stack AI developer · Bengaluru</span>
            <span>github.com/Priyansh10ff</span>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
