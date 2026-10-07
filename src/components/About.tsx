import { ABOUT } from "@/data/content";

export default function About() {
  return (
    <section className="about" id="about" aria-label="About me">
      <div>
        <span className="about-lbl">{ABOUT.label}</span>
        <div className="about-body" id="about-body">
          {ABOUT.lines.map((l, i) => (
            <span className="l" key={i}>
              <span>{l}</span>
            </span>
          ))}
        </div>
        <dl className="about-facts">
          {ABOUT.facts.map((f) => (
            <div key={f.k}>
              <dt>{f.k}</dt>
              <dd>{f.v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <blockquote className="about-pull">
        <p>{ABOUT.pull}</p>
      </blockquote>
    </section>
  );
}
