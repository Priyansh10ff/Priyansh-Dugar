import { PROFILE } from "@/data/projects";
import { fmt, type AllStats } from "@/lib/stats";

type Tile = {
  k: string;
  v: string;
  n: number | null;
  s: string;
  href: string;
  style: Record<string, string>;
};

export default function Stats({ stats }: { stats: AllStats }) {
  const { github, leetcode, codeforces, chess } = stats;

  const tiles: Tile[] = [
    {
      k: "GitHub",
      v: fmt(github.contributions ?? github.repos),
      n: github.contributions ?? github.repos,
      s: github.contributions != null
        ? `contributions in the last year · ${fmt(github.repos)} repos · ${fmt(github.stars)} stars`
        : github.repos != null
          ? `public repos · ${fmt(github.stars)} stars · ${fmt(github.followers)} followers`
          : `@${PROFILE.github}`,
      href: PROFILE.links.github,
      style: { "--r": "-1.2deg", "--c": "#EFEBE3", "--tc": "#121A35", "--stitch": "#2E4078" },
    },
    {
      k: "LeetCode",
      v: fmt(leetcode.solved),
      n: leetcode.solved,
      s: leetcode.solved != null
        ? `solved · ${fmt(leetcode.easy)} easy / ${fmt(leetcode.medium)} medium / ${fmt(leetcode.hard)} hard`
        : `@${PROFILE.leetcode}`,
      href: PROFILE.links.leetcode,
      style: { "--r": "1deg", "--c": "#F2A93B", "--tc": "#121A35", "--stitch": "#121A35" },
    },
    {
      k: "Codeforces",
      v: fmt(codeforces.rating),
      n: codeforces.rating,
      s: codeforces.rating != null
        ? `${codeforces.rank ?? "rated"} · max ${fmt(codeforces.maxRating)} · ${fmt(codeforces.solved)} solved`
        : `@${PROFILE.codeforces}`,
      href: PROFILE.links.codeforces,
      style: { "--r": "-0.8deg", "--c": "#2E4078", "--tc": "#EFEBE3" },
    },
    {
      k: "Chess.com",
      v: fmt(chess.rapid ?? chess.blitz),
      n: chess.rapid ?? chess.blitz,
      s: chess.rapid != null
        ? `rapid · ${fmt(chess.blitz)} blitz · ${fmt(chess.bullet)} bullet`
        : `@${PROFILE.chess}`,
      href: PROFILE.links.chess,
      style: { "--r": "1.4deg", "--c": "#B83A28", "--tc": "#EFEBE3" },
    },
  ];

  return (
    <section className="stats" id="stats" aria-label="By the numbers">
      <h2 className="sec-h">By the numbers</h2>
      <p className="sec-sub">Pulled live from each platform and refreshed hourly. No screenshots, no rounding up.</p>
      <div className="stat-grid">
        {tiles.map((t) => (
          <a className="stat" href={t.href} target="_blank" rel="noopener noreferrer" key={t.k} style={t.style as React.CSSProperties}>
            <span className="k">{t.k}</span>
            <span>
              <span className="v" data-n={t.n ?? undefined}>
                {t.v}
              </span>
              <span className="s" style={{ display: "block" }}>
                {t.s}
              </span>
            </span>
          </a>
        ))}
      </div>

      {github.heat.length > 0 && (
        <div className="heat-wrap" aria-label="GitHub contribution calendar">
          <div className="heat-head">
            <span>{fmt(github.contributions)} contributions in the last year</span>
            <span>less → more</span>
          </div>
          <div className="heat">
            {github.heat.map((d) => (
              <i key={d.date} className={d.level ? `l${d.level}` : undefined} title={`${d.date}: ${d.count}`} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
