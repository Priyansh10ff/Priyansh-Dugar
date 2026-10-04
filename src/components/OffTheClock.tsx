export default function OffTheClock() {
  return (
    <section className="off" id="off" aria-label="Off the clock">
      <h2>When I&apos;m not shipping</h2>
      <div
        className="stack-card"
        style={{ "--i": 0, "--c": "#EFEBE3", "--tc": "#121A35", "--stitch": "#2E4078" } as React.CSSProperties}
      >
        <h3>Chess</h3>
        <p>
          I play on chess.com as{" "}
          <a href="https://www.chess.com/member/priyanshh_10">priyanshh_10</a>. Challenge me,
          I&apos;ll probably play the London.
        </p>
      </div>
      <div
        className="stack-card"
        style={{ "--i": 1, "--c": "#B83A28", "--tc": "#EFEBE3", "--stitch": "#F2A93B" } as React.CSSProperties}
      >
        <h3>Formula 1</h3>
        <p>I watch every race, including the boring ones. [Your team and driver here.]</p>
      </div>
      <div
        className="stack-card"
        style={{ "--i": 2, "--c": "#F2A93B", "--tc": "#121A35", "--stitch": "#121A35" } as React.CSSProperties}
      >
        <h3>Shayari</h3>
        <p>I write shayari when the code won&apos;t compile. [Drop a couplet of yours here.]</p>
      </div>
    </section>
  );
}