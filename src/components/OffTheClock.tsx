import { PROFILE } from "@/data/projects";
import { F1_LINE, PUBLIC_PILLARS, DRIVER_NUMBER } from "@/data/content";
import { fmt, type ChessStats, type NextRace } from "@/lib/stats";
import ChessScene from "./ChessScene";
import PitStopScene from "./PitStopScene";

export default function OffTheClock({ chess, nextRace }: { chess: ChessStats; nextRace: NextRace }) {
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

        {/* F1: sticky like the others; its spacer gives the pit stop 300vh of scroll */}
        <div className="board-card pit-card" style={{ "--i": 1 } as React.CSSProperties}>
          <PitStopScene />
          <div className="board-foot">
            <h3>Formula 1</h3>
            <div>
              <p>{F1_LINE}</p>
              <div className="mini">
                {nextRace ? (
                  <span>
                    Next: {nextRace.name.replace(" Grand Prix", " GP")}
                    {nextRace.daysAway > 0 ? ` in ${nextRace.daysAway} day${nextRace.daysAway === 1 ? "" : "s"}` : " this weekend"}
                  </span>
                ) : (
                  <span>Mercedes</span>
                )}
                <span>#{DRIVER_NUMBER}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="board-spacer" aria-hidden="true" />

        <div
          className="stack-card"
          style={{ "--i": 2, "--c": "#F2A93B", "--tc": "#121A35", "--stitch": "#121A35" } as React.CSSProperties}
        >
          <h3>Building in public</h3>
          <div>
            <p>
              The journey, the F1 takes and the occasional dev-culture opinion go on{" "}
              <a href={PROFILE.links.x} target="_blank" rel="noopener noreferrer">
                X
              </a>
              . No threads about productivity.
            </p>
            <div className="mini">
              {PUBLIC_PILLARS.map((p) => (
                <span key={p}>{p}</span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
