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
    when: "2026 →",
    title: "Patchwork",
    org: "Founder, solo",
    body: "GitHub App that reads third-party API changelogs, finds the change that will break your code, and opens a PR with the fix. Closed beta.",
    kind: "build",
  },
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
    when: "2025", // TODO: year
    title: "Meta PyTorch Hackathon, finalist",
    org: "Meta · PyTorch",
    body: "Prompt Injection Defender. Top ~800 of 31,000+ teams.",
    kind: "hackathon",
  },
  {
    when: "2025 →", // TODO: when you started contributing
    title: "Open-source contributor",
    org: "Prismor and others",
    body: "Bug fixes and features on other people's codebases. Merged PRs are pulled live below.",
    kind: "oss",
    href: "https://prismor.dev",
  },
  {
    when: "2024 → 2028", // TODO: exact batch years
    title: "B.Tech, Computer Science",
    org: "Scaler School of Technology, Bengaluru",
    body: "Moved to Bengaluru for it. Advanced DSA, DBMS, full-stack; most of the learning happens in the projects above.",
    kind: "education",
  },
];

export const NOW: { label: string; text: string }[] = [
  { label: "Building", text: "Patchwork, and Interview Arena Pro (real company-specific interview rounds)." },
  { label: "Learning", text: "Rebuilding an Uber-style ride app from scratch, no AI assistance, to learn the systems underneath." },
  { label: "Daily", text: "One Codeforces problem, one LeetCode problem, one open-source contribution." },
  { label: "Open to", text: "Internships in Bengaluru or remote, full-stack or AI engineering." },
];

// Shown if the GitHub search API is unavailable or returns nothing.
export const OSS_FALLBACK: { repo: string; title: string; href: string; mergedAt?: string }[] = [
  { repo: "prismor", title: "Contributions to prismor.dev", href: "https://prismor.dev" }, // TODO: real PR links
];

// Chips on the "Building in public" card.
export const PUBLIC_PILLARS = ["Startup journey", "F1", "Dev culture", "Bengaluru"];

export const DRIVER_NUMBER = "63"; // TODO: 63 Russell or 12 Antonelli

export const F1_LINE = "Every race, including the boring ones. Mercedes, through the good years and the others. Built F1Hub and hotlapdaily because the official app wasn't enough.";
