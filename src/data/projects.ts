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
    title: "Weft",
    blurb:
      "Multimodal ingestion pipeline: video, audio, images, PDFs and JSON become a timestamped, linked knowledge graph for RAG. Every answer traces back to the exact frame, page or second.",
    tags: ["Python", "OpenCV", "ChromaDB", "RAG"],
    links: [{ label: "GitHub", href: "https://github.com/Priyansh10ff/Weft" }],
    style: { "--w": "min(580px,80vw)", "--h": "66vh", "--r": "-2deg", "--c": "#F2A93B", "--tc": "#121A35", "--stitch": "#121A35" },
  },
  {
    title: "Watchdog",
    blurb:
      "Uptime and incident monitoring for websites and APIs. Scheduled checks, failure-threshold incident detection, deduplicated email alerts and a public status page.",
    tags: ["MongoDB", "Express", "React", "Node"],
    links: [{ label: "GitHub", href: "https://github.com/Priyansh10ff/Watchdog" }],
    style: { "--w": "min(460px,80vw)", "--h": "54vh", "--mt": "10vh", "--r": "2.5deg", "--c": "#EFEBE3", "--tc": "#121A35", "--stitch": "#B83A28" },
  },
  {
    title: "Interview Arena",
    blurb:
      "Real company interview rounds with a live AI interviewer. Machine coding, LLD, system design, DSA and behavioural rounds modelled on 9 companies, with voice, a code editor and hire/no-hire scorecards.",
    tags: ["React", "Firebase", "OpenRouter"],
    links: [
      { label: "Live", href: "https://scaler-web-dev-term-3-end-term-proj.vercel.app" },
      { label: "GitHub", href: "https://github.com/Priyansh10ff/Interview-Arena" },
    ],
    style: { "--w": "min(520px,80vw)", "--h": "60vh", "--mt": "-8vh", "--r": "-1.5deg", "--c": "#2E4078", "--tc": "#EFEBE3" },
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
    style: { "--w": "min(440px,80vw)", "--h": "50vh", "--mt": "6vh", "--r": "3deg", "--c": "#B83A28", "--tc": "#EFEBE3" },
  },
  {
    title: "git-profile-switcher",
    blurb:
      "CLI that swaps Git identity and SSH key per command across multiple GitHub accounts. PowerShell, Bash and Nushell, one config.",
    tags: ["PowerShell", "Bash", "Nushell"],
    links: [
      { label: "Site", href: "https://git-profile-switcher.vercel.app" },
      { label: "GitHub", href: "https://github.com/Priyansh10ff/git-profile-switcher" },
    ],
    style: { "--w": "min(500px,80vw)", "--h": "58vh", "--mt": "-4vh", "--r": "-2.5deg", "--c": "#121A35", "--tc": "#EFEBE3" },
  },
  {
    title: "Patchwork",
    blurb:
      "A GitHub App that reads third-party API changelogs, spots the change that will break your code, and opens a pull request with the fix already written.",
    tags: ["GitHub App", "Claude API", "Next.js", "Supabase", "Octokit"],
    links: [{ label: "In private beta", href: "#contact" }],
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
    title: "MeshRoom",
    blurb: "AI 3D asset generator. Prompt in, mesh out.",
    tags: ["AI", "3D"],
    href: GH, // TODO
    kind: "shipped",
  },
  {
    title: "SQL Gym",
    blurb: "Gamified SQL learning with a GitHub-style streak heatmap.",
    tags: ["Next.js", "SQL"],
    href: GH, // TODO
    kind: "shipped",
  },
  {
    title: "SKILLSBANK",
    blurb: "Research ideation on skill systems for LLM agents and an overclogging degradation model.",
    tags: ["LLM agents", "Research"],
    href: GH, // TODO
    kind: "research",
  },
  {
    title: "PixelPeel",
    blurb: "Desktop background remover built on classical OpenCV (GrabCut, edge refine, color range). No ML dependency. Cross-platform CI.",
    tags: ["Python", "OpenCV", "PyInstaller"],
    href: GH, // TODO
    kind: "shipped",
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
