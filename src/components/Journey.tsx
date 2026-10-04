import { TIMELINE, NOW } from "@/data/content";

export default function Journey() {
  return (
    <section className="journey" id="journey" aria-label="Journey">
      <h2 className="sec-h">The thread so far</h2>
      <div className="journey-grid">
        <ol className="tl">
          {TIMELINE.map((t) => (
            <li className="tl-item" key={t.title} data-kind={t.kind}>
              <span className="tl-when">{t.when}</span>
              <div className="tl-body">
                <span className="tl-org">{t.org}</span>
                <h3>
                  {t.href ? (
                    <a href={t.href} target="_blank" rel="noopener noreferrer">
                      {t.title}
                    </a>
                  ) : (
                    t.title
                  )}
                </h3>
                <p>{t.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <aside className="now" aria-label="Now">
          <span className="now-k">Now</span>
          <dl>
            {NOW.map((n) => (
              <div key={n.label}>
                <dt>{n.label}</dt>
                <dd>{n.text}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>
    </section>
  );
}
