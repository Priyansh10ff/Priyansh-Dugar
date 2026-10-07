import { MANIFESTO } from "@/data/content";

export default function Manifesto() {
  const hl = new Set(MANIFESTO.highlight);
  return (
    <section className="manifesto" aria-label="In short">
      <p id="manifesto">
        {MANIFESTO.text.split(/\s+/).map((w, i) => (
          <span className={`w${hl.has(w.replace(/[.,;:]$/, "")) ? " hl" : ""}`} key={i}>
            {w}
            <i aria-hidden="true" />
          </span>
        ))}
      </p>
      <div className="man-needle" id="man-needle" aria-hidden="true" />
    </section>
  );
}
