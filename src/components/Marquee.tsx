const TOOLS = ["Next.js", "Supabase", "Claude API", "Tailwind", "TypeScript", "Cursor"];

function Row({ outline, dir }: { outline?: boolean; dir: 1 | -1 }) {
  const items = Array.from({ length: 4 }, () => TOOLS).flat();
  return (
    <div className={`mq-row${outline ? " outline" : ""}`} data-dir={dir}>
      <div className="mq-inner">
        {items.map((t, i) => (
          <span key={i} style={{ display: "contents" }}>
            <span>{t}</span>
            <svg viewBox="0 0 40 40" aria-hidden="true">
              <path d="M8 8 L32 32 M32 8 L8 32" />
            </svg>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Marquee() {
  return (
    <section className="marquee" aria-label="Tools I use">
      <Row dir={1} />
      <Row outline dir={-1} />
    </section>
  );
}