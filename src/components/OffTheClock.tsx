import { PROFILE } from "@/data/projects";
import { F1_LINE, SHAYARI } from "@/data/content";
import { fmt, type ChessStats } from "@/lib/stats";
import ChessScene from "./ChessScene";

export default function OffTheClock({ chess }: { chess: ChessStats }) {
  return (
    <>
      <section className="off-head" id="off" aria-label="Off the clock">
        <h2 className="sec-h">When I&apos;m not shipping</h2>
      </section>

      <section className="off" aria-label="Off the clock cards">
        {/* Chess: sticky like the other cards; the spacer below gives the 3D game 300vh of scroll to play in */}
        <div className="board-card" style={{ "--i": 0 } as React.CSSProperties}>
          <ChessScene />
          <div className="board-foot">
            <h3>Chess</h3>
            <div>
              <p>
                On chess.com as{" "}
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
        </div>
        <div className="board-spacer" aria-hidden="true" />

        <div
          className="stack-card"
          style={{ "--i": 1, "--c": "#B83A28", "--tc": "#EFEBE3", "--stitch": "#F2A93B" } as React.CSSProperties}
        >
          <h3>Formula 1</h3>
          <p>{F1_LINE}</p>
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
    </>
  );
}
