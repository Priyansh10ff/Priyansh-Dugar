// Single source of truth for everything project-related.
// Edit text/links here; components only render this.

export const PROFILE = {
  name: "Priyansh Dugar",
  handle: "Priyansh",
  email: "priyansh10work@gmail.com",
  github: "Priyansh10ff",
  leetcode: "_priyansh_10",
  codeforces: "Priyansh_10",
  chess: "priyanshh_10",
  huggingface: "Priyansh10oooo",
  links: {
    github: "https://github.com/Priyansh10ff",
    linkedin: "https://www.linkedin.com/in/priyansh-dugar-709333363/",
    x: "https://x.com/_Priyansh_10",
    leetcode: "https://leetcode.com/u/_priyansh_10",
    codeforces: "https://codeforces.com/profile/Priyansh_10",
    chess: "https://www.chess.com/member/priyanshh_10",
    huggingface: "https://huggingface.co/Priyansh10oooo",
    resume: "/resume.pdf", // drop your PDF into /public/resume.pdf
  },
};

export type Featured = {
  title: string;
  blurb: string;
  tags: string[];
  links: { label: string; href: string }[];
  style: Record<string, string>;
};

// Horizontal-scroll cards. Sizes/rotations/colors are the prototype's.
export const FEATURED: Featured[] = [
  {
    title: "Patchwork",
    blurb:
      "A GitHub App that reads third-party API changelogs, spots the change that will break your code, and opens a pull request with the fix already written.",
    tags: ["GitHub App", "Claude API", "Next.js", "Supabase", "Octokit"],
    links: [{ label: "In private beta", href: "#contact" }],
    style: { "--w": "min(580px,80vw)", "--h": "66vh", "--r": "-2deg", "--c": "#F2A93B", "--tc": "#121A35", "--stitch": "#121A35" },
  },
  {
    title: "Argument Gym",
    blurb:
      "Debate training against adaptive AI opponents. ELO ratings, Court and Sales modes, live human vs human rounds with an AI judge.",
    tags: ["Next.js", "Convex", "OpenRouter", "SSE"],
    links: [
      { label: "Live", href: "https://argument-gym.vercel.app" },
      { label: "GitHub", href: "https://github.com/Priyansh10ff/Argument-Gym" },
    ],
    style: { "--w": "min(460px,80vw)", "--h": "54vh", "--mt": "10vh", "--r": "2.5deg", "--c": "#EFEBE3", "--tc": "#121A35", "--stitch": "#B83A28" },
  },
  {
    title: "Abhaya",
    blurb:
      "Open-source mobile app for women's safety in India: emergency guide, legal rights AI, timestamped evidence vault, FIR escalator, safety map and more.",
    tags: ["Expo", "React Native", "Supabase", "Next.js"],
    links: [
      { label: "Site", href: "https://abhaya-web.vercel.app" },
      { label: "Survey", href: "https://abhaya-survey.vercel.app" },
    ],
    style: { "--w": "min(520px,80vw)", "--h": "60vh", "--mt": "-8vh", "--r": "-1.5deg", "--c": "#2E4078", "--tc": "#EFEBE3" },
  },
  {
    title: "VC Negotiation Arena",
    blurb:
      "OpenEnv RL environment where an LLM agent negotiates a term sheet against a founder with hidden preferences. Trained Qwen2.5-1.5B with GRPO. OpenEnv India Hackathon, Round 2.",
    tags: ["OpenEnv", "FastAPI", "TRL / GRPO", "HF Spaces"],
    links: [
      { label: "Environment", href: "https://huggingface.co/spaces/Priyansh10oooo/vc-negotiation-env" },
      { label: "Model", href: "https://huggingface.co/Priyansh10oooo/vc-negotiation-model" },
      { label: "GitHub", href: "https://github.com/Priyansh10ff/vc-negotiation-env" },
    ],
    style: { "--w": "min(440px,80vw)", "--h": "50vh", "--mt": "6vh", "--r": "3deg", "--c": "#B83A28", "--tc": "#EFEBE3" },
  },
  {
    title: "Interview Arena",
    blurb:
      "Terminal-brutalist AI code interview trainer. Timed rounds, follow-up questions that actually probe, and a Pro track built around real company interview formats.",
    tags: ["React", "Firebase", "Claude API"],
    links: [{ label: "GitHub", href: "https://github.com/Priyansh10ff" }], // TODO: repo URL
    style: { "--w": "min(500px,80vw)", "--h": "58vh", "--mt": "-4vh", "--r": "-2.5deg", "--c": "#121A35", "--tc": "#EFEBE3" },
  },
  {
    title: "MirrorMind",
    blurb:
      "An AI digital twin built from your own Twitter and Reddit history. Embeds everything you've ever posted, then answers in your voice.",
    tags: ["Claude API", "OpenAI embeddings", "Supabase", "Next.js"],
    links: [{ label: "GitHub", href: "https://github.com/Priyansh10ff" }], // TODO: repo URL
    style: { "--w": "min(470px,80vw)", "--h": "52vh", "--mt": "8vh", "--r": "1.5deg", "--c": "#EFEBE3", "--tc": "#121A35", "--stitch": "#2E4078" },
  },
];

export type Project = {
  title: string;
  blurb: string;
  tags: string[];
  href: string;
  kind: "shipped" | "hackathon" | "open source" | "wip" | "research";
};

const GH = "https://github.com/Priyansh10ff";

// Everything else. Links marked TODO point at the profile until you give me the repo.
export const PROJECTS: Project[] = [
  {
    title: "Prompt Injection Defender",
    blurb: "Meta PyTorch hackathon finalist. Top ~800 of 31,000+ teams.",
    tags: ["PyTorch", "LLM security"],
    href: GH, // TODO
    kind: "hackathon",
  },
  {
    title: "Insurance Claims Env",
    blurb: "OpenEnv Round 1. An RL environment for claims adjudication, deployed as a Docker Space.",
    tags: ["OpenEnv", "FastAPI", "HF Spaces"],
    href: "https://huggingface.co/spaces/Priyansh10oooo/insurance-claims-env",
    kind: "hackathon",
  },
  {
    title: "Jarvis",
    blurb: "Voice-activated agent loop with vision-based screen control, running a local LLaMA on an RTX GPU.",
    tags: ["Python", "LLaMA", "Vision"],
    href: GH, // TODO
    kind: "shipped",
  },
  {
    title: "git-profile-switcher",
    blurb: "CLI that swaps Git identity and SSH key per command across multiple GitHub accounts.",
    tags: ["PowerShell", "Bash", "Nushell"],
    href: GH, // TODO
    kind: "open source",
  },
  {
    title: "PixelPeel",
    blurb: "Desktop background remover built on classical OpenCV (GrabCut, edge refine, color range). No ML dependency. Cross-platform CI.",
    tags: ["Python", "OpenCV", "PyInstaller"],
    href: "https://github.com/Priyansh10ff/pixelpeel",
    kind: "shipped",
  },
  {
    title: "F1Hub",
    blurb: "F1 dashboard with live standings from the Jolpica API and a mathematical race predictor.",
    tags: ["Next.js", "Jolpica API"],
    href: GH, // TODO
    kind: "shipped",
  },
  {
    title: "hotlapdaily",
    blurb: "Procedurally generated F1 track racer in the browser. A new circuit every day.",
    tags: ["Next.js", "Canvas"],
    href: GH, // TODO
    kind: "shipped",
  },
  {
    title: "MeshRoom",
    blurb: "AI 3D asset generator. Prompt in, mesh out.",
    tags: ["AI", "3D"],
    href: GH, // TODO
    kind: "shipped",
  },
  {
    title: "Prismor",
    blurb: "Open-source contributions to prismor.dev.",
    tags: ["Open source"],
    href: "https://prismor.dev",
    kind: "open source",
  },
  {
    title: "SQL Gym",
    blurb: "Gamified SQL learning with a GitHub-style streak heatmap.",
    tags: ["Next.js", "SQL"],
    href: GH, // TODO
    kind: "shipped",
  },
  {
    title: "Uber clone, from scratch",
    blurb: "Web ride-hailing clone built without AI assistance, to actually learn the underlying systems.",
    tags: ["MERN", "WebSockets", "Maps"],
    href: GH, // TODO
    kind: "wip",
  },
  {
    title: "SKILLSBANK",
    blurb: "Research ideation on skill systems for LLM agents and an overclogging degradation model.",
    tags: ["LLM agents", "Research"],
    href: GH, // TODO
    kind: "research",
  },
];

// Rotations/colors cycle through these so the grid reads as patches, not tiles.
export const PATCH_STYLES: Record<string, string>[] = [
  { "--r": "-1.4deg", "--c": "#EFEBE3", "--tc": "#121A35", "--stitch": "#2E4078" },
  { "--r": "1.1deg", "--c": "#2E4078", "--tc": "#EFEBE3" },
  { "--r": "-0.8deg", "--c": "#F2A93B", "--tc": "#121A35", "--stitch": "#121A35" },
  { "--r": "1.6deg", "--c": "#B83A28", "--tc": "#EFEBE3" },
  { "--r": "-1.2deg", "--c": "#121A35", "--tc": "#EFEBE3" },
  { "--r": "0.9deg", "--c": "#EFEBE3", "--tc": "#121A35", "--stitch": "#B83A28" },
];

export const TOOLS = ["Next.js", "TypeScript", "Supabase", "Claude API", "Tailwind", "Python", "FastAPI", "Convex", "Expo", "Cursor"];
