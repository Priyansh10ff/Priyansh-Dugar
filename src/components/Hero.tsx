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

export default function Hero() {
  return (
    <section className="hero" id="top">
      <h1 className="name" aria-label="Priyansh">
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
      <div className="hero-foot">
        <p className="hero-line">
          I build software that notices when things break, and patches them before
          anyone has to. Studying at Scaler School of Technology, Bengaluru.
        </p>
        <p className="hint" id="hint">
          Scroll to stitch it together
        </p>
      </div>
    </section>
  );
}