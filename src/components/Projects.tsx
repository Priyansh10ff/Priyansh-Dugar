import { PROJECTS, PATCH_STYLES, PROFILE } from "@/data/projects";

export default function Projects() {
  return (
    <section className="projects" id="projects" aria-label="All projects">
      <h2 className="sec-h">The rest of the quilt</h2>
      <p className="sec-sub">
        Hackathons, tools I needed and nobody had built, and things made purely to learn. Everything is on{" "}
        <a href={PROFILE.links.github} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline", textUnderlineOffset: 4 }}>
          GitHub
        </a>
        .
      </p>
      <div className="proj-grid">
        {PROJECTS.map((p, i) => (
          <a
            className="proj"
            href={p.href}
            target="_blank"
            rel="noopener noreferrer"
            key={p.title}
            style={PATCH_STYLES[i % PATCH_STYLES.length] as React.CSSProperties}
          >
            <div>
              <span className="tag">{p.kind}</span>
              <h3>{p.title}</h3>
              <p>{p.blurb}</p>
            </div>
            <ul>
              {p.tags.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </a>
        ))}
      </div>
    </section>
  );
}
