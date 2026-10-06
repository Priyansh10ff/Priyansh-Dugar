import Image from "next/image";
import { HERO_NOTES } from "@/data/content";

const LETTERS: { ch: string; r: number; c: string; tc: string; thread?: boolean }[] = [
  { ch: "P", r: -3, c: "#EFEBE3", tc: "#121A35" },
  { ch: "r", r: 2, c: "#2E4078", tc: "#EFEBE3" },
  { ch: "i", r: -1, c: "#F2A93B", tc: "#121A35", thread: true },
  { ch: "y", r: 3, c: "#B83A28", tc: "#EFEBE3" },
  { ch: "a", r: -2, c: "#EFEBE3", tc: "#121A35" },
  { ch: "n", r: 1, c: "#121A35", tc: "#EFEBE3" },
  { ch: "s", r: -3, c: "#F2A93B", tc: "#121A35", thread: true },
  { ch: "h", r: 2, c: "#2E4078", tc: "#EFEBE3" },
];

// Sticker image is 1172×1357; the thread lands at this point in its pixel space (near shoulder).
export const STICKER = { w: 1172, h: 1357, land: { x: 230, y: 700 } };

export default function Hero() {
  return (
    <section className="hero" id="top">
      <h1 className="name" id="name" aria-label="Priyansh">
        {LETTERS.map((l, i) => (
          <span className="patch" data-r={l.r} aria-hidden="true" key={i}>
            <span className="bob">
              <span
                className={`cloth${l.thread ? " on-thread" : ""}`}
                style={{ "--c": l.c, "--tc": l.tc } as React.CSSProperties}
              >
                {l.ch}
              </span>
            </span>
          </span>
        ))}
      </h1>

      {/* thread from the "h" to the sticker */}
      <svg className="hero-thread" id="hero-thread" aria-hidden="true">
        <path id="hero-path" d="" />
        <g id="hero-tip">
          <path className="needle" d="M-14 0 L6 0" />
          <ellipse className="eye" cx="-10" cy="0" rx="3" ry="1.6" />
        </g>
      </svg>

      {/* sticker: cut-out photo with a chalk die-cut border */}
      <div className="sticker" id="sticker">
        <Image src="/me-sticker.webp" alt="Priyansh" width={STICKER.w} height={STICKER.h} priority className="sticker-img" id="sticker-img" />
        <div className="seam" id="sticker-seam" />
      </div>

      {HERO_NOTES.map((n, i) => (
        <div className={`hn hn-${i}`} id={`hn-${i}`} key={i} aria-hidden="true">
          {n.split("\n").map((line, k) => (
            <span key={k}>
              {line}
              {k < n.split("\n").length - 1 && <br />}
            </span>
          ))}
          <svg viewBox="0 0 40 40">
            <path d="M4 6c10 2 22 10 30 26M30 22l4 10-10 2" />
          </svg>
        </div>
      ))}

      <div className="hero-foot">
        <p className="hero-line">
          I build software that notices when things break, and patches them before anyone has to.
          Full-stack AI developer, studying at Scaler School of Technology, Bengaluru.
        </p>
        <p className="hint" id="hint">
          Scroll to stitch it together
        </p>
      </div>
    </section>
  );
}
