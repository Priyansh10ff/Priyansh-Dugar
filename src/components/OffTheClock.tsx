import { PROFILE } from "@/data/projects";
import { fmt, type ChessStats } from "@/lib/stats";

// Replace with your own. Keep the \n for line breaks.
const SHAYARI = `[Pehli line yahan]
[Doosri line yahan]`;

export default function OffTheClock({ chess }: { chess: ChessStats }) {
  return (
    <section className="off" id="off" aria-label="Off the clock">
      <h2>When I&apos;m not shipping</h2>
      <div
        className="stack-card"
        style={{ "--i": 0, "--c": "#EFEBE3", "--tc": "#121A35", "--stitch": "#2E4078" } as React.CSSProperties}
      >
        <h3>Chess</h3>
        <div>
          <p>
            I play on chess.com as{" "}
            <a href={PROFILE.links.chess} target="_blank" rel="noopener noreferrer">
              {PROFILE.chess}
            </a>
            . Challenge me, I&apos;ll probably play the London.
          </p>
          {(chess.rapid ?? chess.blitz) != null && (
            <div className="mini">
              {chess.rapid != null && <span>Rapid {fmt(chess.rapid)}</span>}
              {chess.blitz != null && <span>Blitz {fmt(chess.blitz)}</span>}
              {chess.bullet != null && <span>Bullet {fmt(chess.bullet)}</span>}
              {chess.puzzles != null && <span>Puzzles {fmt(chess.puzzles)}</span>}
            </div>
          )}
        </div>
      </div>
      <div
        className="stack-card"
        style={{ "--i": 1, "--c": "#B83A28", "--tc": "#EFEBE3", "--stitch": "#F2A93B" } as React.CSSProperties}
      >
        <h3>Formula 1</h3>
        <p>
          I watch every race, including the boring ones. Built F1Hub and hotlapdaily because the official
          app wasn&apos;t enough. [Your team and driver here.]
        </p>
      </div>
      <div
        className="stack-card"
        style={{ "--i": 2, "--c": "#F2A93B", "--tc": "#121A35", "--stitch": "#121A35" } as React.CSSProperties}
      >
        <h3>Shayari</h3>
        <div>
          <p className="verse">{SHAYARI}</p>
          <p style={{ marginTop: 18, opacity: 0.8 }}>I write shayari when the code won&apos;t compile.</p>
        </div>
      </div>
    </section>
  );
}
