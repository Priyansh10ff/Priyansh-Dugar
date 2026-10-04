import { OSS_FALLBACK } from "@/data/content";
import { PROFILE } from "@/data/projects";
import type { MergedPR } from "@/lib/stats";

const when = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "";

export default function OpenSource({ prs }: { prs: MergedPR[] }) {
  const rows = prs.length ? prs : OSS_FALLBACK;
  return (
    <section className="oss" id="oss" aria-label="Open source">
      <h2 className="sec-h">Patches on other people&apos;s quilts</h2>
      <p className="sec-sub">
        Merged pull requests to repositories I don&apos;t own, {prs.length ? "pulled live from GitHub." : "from GitHub."}
      </p>
      <ol className="oss-list">
        {rows.map((r) => (
          <li key={r.href}>
            <a className="oss-row" href={r.href} target="_blank" rel="noopener noreferrer">
              <span className="oss-repo">{r.repo}</span>
              <span className="oss-title">{r.title}</span>
              <span className="oss-when">{when(r.mergedAt)}</span>
            </a>
          </li>
        ))}
      </ol>
      <p className="sec-sub" style={{ margin: "4vh 0 0" }}>
        Full history on{" "}
        <a href={`${PROFILE.links.github}?tab=overview`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline", textUnderlineOffset: 4 }}>
          GitHub
        </a>
        .
      </p>
    </section>
  );
}
