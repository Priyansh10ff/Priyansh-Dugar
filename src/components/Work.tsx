type Card = {
  title: string;
  blurb: string;
  tags: string[];
  cta: string;
  href: string;
  style: Record<string, string>;
};

const CARDS: Card[] = [
  {
    title: "Patchwork",
    blurb:
      "A GitHub App that spots breaking API changes in your dependencies and opens a pull request with the fix already written.",
    tags: ["GitHub App", "Claude API", "Next.js"],
    cta: "Read the case study",
    href: "#",
    style: { "--w": "min(580px,80vw)", "--h": "66vh", "--r": "-2deg", "--c": "#F2A93B", "--tc": "#121A35", "--stitch": "#121A35" },
  },
  {
    title: "Argument Gym",
    blurb: "[One line on what Argument Gym does and who it's for.]",
    tags: ["[Stack]", "[Stack]"],
    cta: "See the project",
    href: "#",
    style: { "--w": "min(460px,80vw)", "--h": "54vh", "--mt": "10vh", "--r": "2.5deg", "--c": "#EFEBE3", "--tc": "#121A35", "--stitch": "#B83A28" },
  },
  {
    title: "Abhaya",
    blurb: "[One line on what the Abhaya app does.]",
    tags: ["[Stack]", "[Stack]"],
    cta: "See the project",
    href: "#",
    style: { "--w": "min(520px,80vw)", "--h": "60vh", "--mt": "-8vh", "--r": "-1.5deg", "--c": "#2E4078", "--tc": "#EFEBE3" },
  },
  {
    title: "OpenEnv",
    blurb: "[What you built at the OpenEnv hackathon, and how it placed.]",
    tags: ["Hackathon", "[Stack]"],
    cta: "See the project",
    href: "#",
    style: { "--w": "min(440px,80vw)", "--h": "50vh", "--mt": "6vh", "--r": "3deg", "--c": "#B83A28", "--tc": "#EFEBE3" },
  },
];

export default function Work() {
  return (
    <section className="work" id="work" aria-label="Work">
      <div className="track" id="track">
        <div className="work-intro">
          <h2>Things I&apos;ve sewn together</h2>
          <p>Keep scrolling. Each patch is something I built, broke, and fixed.</p>
        </div>

        {CARDS.map((c) => (
          <article className="card" key={c.title}>
            <div className="card-in" style={c.style as React.CSSProperties}>
              <div>
                <h3>{c.title}</h3>
                <p>{c.blurb}</p>
              </div>
              <div>
                <ul>
                  {c.tags.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
                <p>
                  <a href={c.href}>{c.cta}</a>
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}