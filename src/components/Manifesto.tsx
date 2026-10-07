const TEXT =
  "Most software breaks quietly. An API changes, a field disappears, and someone finds out at 2am. I build the tools that notice first, and the patches that land before anyone wakes up.";
const HIGHLIGHT = new Set(["notice", "first,", "patches"]);

export default function Manifesto() {
  return (
    <section className="manifesto" aria-label="About">
      <p id="manifesto">
        {TEXT.split(/\s+/).map((w, i) => (
          <span className={`w${HIGHLIGHT.has(w) ? " hl" : ""}`} key={i}>
            {w}
            <i aria-hidden="true" />
          </span>
        ))}
      </p>
      <div className="man-needle" id="man-needle" aria-hidden="true" />
    </section>
  );
}
