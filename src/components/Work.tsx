import { FEATURED } from "@/data/projects";

const ext = (href: string) => (href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {});

export default function Work() {
  return (
    <section className="work" id="work" aria-label="Work">
      <div className="track" id="track">
        <div className="work-intro">
          <h2>Things I&apos;ve sewn together</h2>
          <p>Keep scrolling. Each patch is something I built, broke, and fixed.</p>
        </div>

        {FEATURED.map((c) => (
          <article className="card" key={c.title}>
            <div className="card-in" style={c.style as React.CSSProperties}>
              <div>
                <h3>{c.title}</h3>
                <p>{c.blurb}</p>
              </div>
              <div>
                <ul>
                  {c.tags.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
                <p className="links">
                  {c.links.map((l) => (
                    <a href={l.href} key={l.href} {...ext(l.href)}>
                      {l.label}
                    </a>
                  ))}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
