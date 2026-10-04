// Server-only fetchers. Every one of these fails soft: a null field means
// "API down / rate-limited", and the UI renders a fallback instead of crashing.

import { PROFILE } from "@/data/projects";

const HOUR = 3600;
const UA = { "User-Agent": `${PROFILE.github}-portfolio (${PROFILE.email})` };

async function getJSON<T>(url: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, { ...init, headers: { ...UA, ...(init?.headers ?? {}) }, next: { revalidate: HOUR } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/* ---------------- GitHub ---------------- */

export type HeatDay = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 };
export type GitHubStats = {
  repos: number | null;
  followers: number | null;
  stars: number | null;
  contributions: number | null; // last 12 months
  heat: HeatDay[]; // 371 days, oldest first; empty if no token
};

export async function getGitHub(): Promise<GitHubStats> {
  const token = process.env.GITHUB_TOKEN;

  const user = await getJSON<{ public_repos: number; followers: number }>(
    `https://api.github.com/users/${PROFILE.github}`,
    token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
  );

  const repos = await getJSON<{ stargazers_count: number; fork: boolean }[]>(
    `https://api.github.com/users/${PROFILE.github}/repos?per_page=100&type=owner`,
    token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
  );
  const stars = repos ? repos.filter((r) => !r.fork).reduce((n, r) => n + r.stargazers_count, 0) : null;

  let contributions: number | null = null;
  let heat: HeatDay[] = [];
  if (token) {
    type GQL = {
      data?: {
        user?: {
          contributionsCollection: {
            contributionCalendar: {
              totalContributions: number;
              weeks: { contributionDays: { date: string; contributionCount: number; contributionLevel: string }[] }[];
            };
          };
        };
      };
    };
    const gql = await getJSON<GQL>("https://api.github.com/graphql", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `query($login:String!){ user(login:$login){ contributionsCollection{ contributionCalendar{ totalContributions weeks{ contributionDays{ date contributionCount contributionLevel } } } } } }`,
        variables: { login: PROFILE.github },
      }),
    });
    const cal = gql?.data?.user?.contributionsCollection.contributionCalendar;
    if (cal) {
      contributions = cal.totalContributions;
      const levelMap: Record<string, HeatDay["level"]> = {
        NONE: 0,
        FIRST_QUARTILE: 1,
        SECOND_QUARTILE: 2,
        THIRD_QUARTILE: 3,
        FOURTH_QUARTILE: 4,
      };
      heat = cal.weeks.flatMap((w) =>
        w.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount, level: levelMap[d.contributionLevel] ?? 0 })),
      );
    }
  }

  return { repos: user?.public_repos ?? null, followers: user?.followers ?? null, stars, contributions, heat };
}

/* ---------------- LeetCode ---------------- */

export type LeetCodeStats = { solved: number | null; easy: number | null; medium: number | null; hard: number | null; ranking: number | null };

export async function getLeetCode(): Promise<LeetCodeStats> {
  type R = {
    data?: {
      matchedUser?: {
        profile: { ranking: number };
        submitStatsGlobal: { acSubmissionNum: { difficulty: string; count: number }[] };
      };
    };
  };
  const r = await getJSON<R>("https://leetcode.com/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json", Referer: "https://leetcode.com" },
    body: JSON.stringify({
      query: `query($u:String!){ matchedUser(username:$u){ profile{ ranking } submitStatsGlobal{ acSubmissionNum{ difficulty count } } } }`,
      variables: { u: PROFILE.leetcode },
    }),
  });
  const u = r?.data?.matchedUser;
  const by = (d: string) => u?.submitStatsGlobal.acSubmissionNum.find((x) => x.difficulty === d)?.count ?? null;
  return { solved: by("All"), easy: by("Easy"), medium: by("Medium"), hard: by("Hard"), ranking: u?.profile.ranking ?? null };
}

/* ---------------- Codeforces ---------------- */

export type CodeforcesStats = { rating: number | null; maxRating: number | null; rank: string | null; solved: number | null };

export async function getCodeforces(): Promise<CodeforcesStats> {
  type Info = { status: string; result: { rating?: number; maxRating?: number; rank?: string }[] };
  type Status = { status: string; result: { verdict?: string; problem: { contestId?: number; index: string } }[] };
  const [info, status] = await Promise.all([
    getJSON<Info>(`https://codeforces.com/api/user.info?handles=${PROFILE.codeforces}`),
    getJSON<Status>(`https://codeforces.com/api/user.status?handle=${PROFILE.codeforces}`),
  ]);
  const me = info?.status === "OK" ? info.result[0] : undefined;
  let solved: number | null = null;
  if (status?.status === "OK") {
    const set = new Set<string>();
    for (const s of status.result) if (s.verdict === "OK") set.add(`${s.problem.contestId}-${s.problem.index}`);
    solved = set.size;
  }
  return { rating: me?.rating ?? null, maxRating: me?.maxRating ?? null, rank: me?.rank ?? null, solved };
}

/* ---------------- Chess.com ---------------- */

export type ChessStats = { rapid: number | null; blitz: number | null; bullet: number | null; puzzles: number | null };

export async function getChess(): Promise<ChessStats> {
  type R = {
    chess_rapid?: { last: { rating: number } };
    chess_blitz?: { last: { rating: number } };
    chess_bullet?: { last: { rating: number } };
    tactics?: { highest: { rating: number } };
  };
  const r = await getJSON<R>(`https://api.chess.com/pub/player/${PROFILE.chess}/stats`);
  return {
    rapid: r?.chess_rapid?.last.rating ?? null,
    blitz: r?.chess_blitz?.last.rating ?? null,
    bullet: r?.chess_bullet?.last.rating ?? null,
    puzzles: r?.tactics?.highest.rating ?? null,
  };
}

/* ---------------- all ---------------- */

export type AllStats = {
  github: GitHubStats;
  leetcode: LeetCodeStats;
  codeforces: CodeforcesStats;
  chess: ChessStats;
};

export async function getAllStats(): Promise<AllStats> {
  const [github, leetcode, codeforces, chess] = await Promise.all([getGitHub(), getLeetCode(), getCodeforces(), getChess()]);
  return { github, leetcode, codeforces, chess };
}

export const fmt = (n: number | null, fallback = "—") => (n == null ? fallback : new Intl.NumberFormat("en-IN").format(n));

/* ---------------- GitHub: merged PRs to other people's repos ---------------- */

export type MergedPR = { repo: string; title: string; href: string; mergedAt: string };

export async function getMergedPRs(): Promise<MergedPR[]> {
  const token = process.env.GITHUB_TOKEN;
  type R = { items?: { title: string; html_url: string; repository_url: string; pull_request?: { merged_at: string | null } }[] };
  const q = encodeURIComponent(`is:pr is:merged author:${PROFILE.github} -user:${PROFILE.github}`);
  const r = await getJSON<R>(`https://api.github.com/search/issues?q=${q}&sort=updated&order=desc&per_page=8`, {
    headers: { Accept: "application/vnd.github+json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  return (r?.items ?? [])
    .filter((i) => i.pull_request?.merged_at)
    .map((i) => ({
      repo: i.repository_url.replace("https://api.github.com/repos/", ""),
      title: i.title,
      href: i.html_url,
      mergedAt: i.pull_request!.merged_at!,
    }));
}
