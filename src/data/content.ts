// Journey, Now, Off the clock, open-source fallback. Edit freely.
// Lines marked TODO are my best guess or a placeholder; correct them.

export type TimelineItem = {
  when: string;
  title: string;
  org: string;
  body: string;
  kind: "education" | "build" | "hackathon" | "oss" | "work";
  href?: string;
};

export const TIMELINE: TimelineItem[] = [
  {
    when: "2026",
    title: "OpenEnv India Hackathon, Round 2",
    org: "Hugging Face · OpenEnv",
    body: "VC Term Sheet Negotiation Arena: an RL environment plus a GRPO-trained Qwen2.5-1.5B agent, deployed to Spaces.",
    kind: "hackathon",
    href: "https://huggingface.co/spaces/Priyansh10oooo/vc-negotiation-env",
  },
  {
    when: "2026",
    title: "OpenEnv India Hackathon, Round 1",
    org: "Hugging Face · OpenEnv",
    body: "Insurance Claims Adjudication environment, FastAPI backend, Docker Space.",
    kind: "hackathon",
    href: "https://huggingface.co/spaces/Priyansh10oooo/insurance-claims-env",
  },
  {
    when: "2025 →",
    title: "Open-source contributor, Prismor",
    org: "prismor.dev",
    body: "Runtime control plane for AI agents: intercepts tool calls, enforces policy, redacts secrets, keeps audit trails. Merged PRs are pulled live below.",
    kind: "oss",
    href: "https://github.com/Priyansh10ff/prismor",
  },
  {
    when: "2025", // TODO: year
    title: "Meta PyTorch Hackathon, finalist",
    org: "Meta · PyTorch",
    body: "Prompt Injection Defender. Top ~800 of 31,000+ teams.",
    kind: "hackathon",
  },
  {
    when: "2024 → 2028", // TODO: exact batch years
    title: "B.Tech, Computer Science",
    org: "Scaler School of Technology, Bengaluru",
    body: "Moved to Bengaluru for it. Advanced DSA, DBMS, full-stack; most of the learning happens in the projects above.",
    kind: "education",
  },
  {
    when: "2021",
    title: "First lines of code",
    org: "2D browser games",
    body: "Started with small JavaScript games: a T-Rex runner, a supply-drop mission, a Newton's cradle. Still on GitHub.",
    kind: "build",
    href: "https://github.com/Priyansh10ff/Trex10",
  },
];

export const NOW: { label: string; text: string }[] = [
  { label: "Learning", text: "Every day. Going back over my own projects and making them better." },
  { label: "Building", text: "Weft to production, Watchdog, Interview Arena." },
  { label: "Open to", text: "Internships in Bengaluru or remote, full-stack or AI engineering." },
];

// Shown if the GitHub search API is unavailable or returns nothing.
export const OSS_FALLBACK: { repo: string; title: string; href: string; mergedAt?: string }[] = [
  { repo: "prismor", title: "Contributions to prismor.dev", href: "https://prismor.dev" }, // TODO: real PR links
];

// Chips on the "Building in public" card.
export const PUBLIC_PILLARS = ["Startup journey", "F1", "Dev culture", "Bengaluru"];

export const DRIVER_NUMBER = "63"; // TODO: 63 Russell or 12 Antonelli

export const F1_LINE = "Every race, including the boring ones. Mercedes, through the good years and the others. Built F1Hub because the official app wasn't enough.";

// Sketchfab CC licences require attribution. Fill in and it shows in the footer; leave author empty to hide.
export const F1_MODEL_CREDIT = { title: "2026 Mercedes W17", author: "", href: "" }; // TODO: author name + model URL

// Loader interstitial shown before the site opens. Set `show` to false when the site is done.
export const WIP = {
  show: true,
  tag: "Work in progress",
  title: "Still stitching.",
  body: "This site is under development. Changes land here as they're made, so some seams are visible.",
};

// Handwritten notes around the sticker in the hero (use \n for a line break). Three fit; the second hides on phones.
export const HERO_NOTES = [
  "same guy. started with\n2D games in 2021.",
  "probably mid-game\non chess.com right now.",
  "fun fact: the first thing\nI shipped was a T-Rex runner.",
];

// About beat. Placeholder copy in Priyansh's voice; rewrite freely. One sentence per line.
export const ABOUT = {
  label: "about, honestly",
  lines: [
    "I am nineteen, in Bengaluru, and most of what I know I learned by shipping something slightly too ambitious and then fixing it.",
    "I like tools that notice problems before people do.",
    "I play the London because I would rather understand one opening than memorise ten.",
    "I am looking for a team that lets me build real things and tells me when they are wrong.",
  ],
  facts: [
    { k: "Based", v: "Bengaluru, from [hometown]" }, // TODO
    { k: "Studying", v: "CS at Scaler School of Technology" },
    { k: "Working on", v: "Weft, Watchdog, Interview Arena" },
    { k: "Open to", v: "internships, full-stack or AI" },
  ],
  pull: "Build the thing that notices first.",
};
