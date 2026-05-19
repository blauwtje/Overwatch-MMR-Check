import { getPlayerSummary, getPlayerStats, getPlayerCareer } from "@/lib/overfast/client";
import type { OverFastResult } from "@/lib/overfast/client";
import {
  extractCompetitive,
  extractRoleStats,
  extractSeason,
  isPrivateSummary,
  attachHeroBreakdowns,
} from "@/lib/overfast/transform";
import { extractHeroBreakdownByRole } from "@/lib/overfast/career-transform";
import { estimateMMR } from "@/lib/algorithm";
import type {
  MMREstimate,
  Platform,
  Gamemode,
  ResolvedPlatform,
  Role,
  RoleStats,
} from "@/lib/algorithm/types";
import type { PlatformDataInput } from "@/lib/algorithm";
import type { PlayerSummary, PlayerStatsSummary } from "@/lib/overfast/client";

export type PlayerPageData =
  | {
      status: "ok";
      username: string;
      avatar: string | null;
      platform: Platform;
      gamemode: Gamemode;
      season: number | null;
      mmr: MMREstimate;
      statsPartial: boolean;
    }
  | { status: "not_found" }
  | { status: "private"; username: string }
  | { status: "rate_limited" }
  | { status: "error"; message: string };

const RESOLVED_PLATFORMS_FOR = (platform: Platform): ResolvedPlatform[] =>
  platform === "mixed" ? ["pc", "console"] : [platform];

const STATS_GAMEMODES_FOR = (gamemode: Gamemode): ("competitive" | "quickplay")[] => {
  if (gamemode === "ranked") return ["competitive"];
  if (gamemode === "unranked") return ["quickplay"];
  return ["competitive", "quickplay"];
};

function emptyRoleMap(): Partial<Record<Role, RoleStats | null>> {
  return { tank: null, damage: null, support: null };
}

// Discriminated-union types for the fan-out
type FetchRequest =
  | { kind: "summary" }
  | { kind: "stats"; platform: ResolvedPlatform; gamemode: "competitive" | "quickplay" }
  | { kind: "career"; platform: ResolvedPlatform; gamemode: "competitive" | "quickplay" };

type TrimmedCareer = Awaited<ReturnType<typeof getPlayerCareer>> extends OverFastResult<infer T> ? T : never;

type FetchResult =
  | { kind: "summary"; result: OverFastResult<PlayerSummary> }
  | { kind: "stats"; platform: ResolvedPlatform; gamemode: "competitive" | "quickplay"; result: OverFastResult<PlayerStatsSummary> }
  | { kind: "career"; platform: ResolvedPlatform; gamemode: "competitive" | "quickplay"; result: OverFastResult<TrimmedCareer> };

export async function fetchPlayerData(
  tag: string,
  platform: Platform,
  gamemode: Gamemode = "ranked"
): Promise<PlayerPageData> {
  const platformsToFetch = RESOLVED_PLATFORMS_FOR(platform);
  const gamemodesToFetch = STATS_GAMEMODES_FOR(gamemode);

  // Build discriminated-union request list
  const requests: FetchRequest[] = [{ kind: "summary" }];
  for (const p of platformsToFetch) {
    for (const g of gamemodesToFetch) {
      requests.push({ kind: "stats", platform: p, gamemode: g });
      requests.push({ kind: "career", platform: p, gamemode: g });
    }
  }

  const results: FetchResult[] = await Promise.all(
    requests.map(async (req): Promise<FetchResult> => {
      switch (req.kind) {
        case "summary":
          return { kind: "summary", result: await getPlayerSummary(tag) };
        case "stats":
          return { kind: "stats", platform: req.platform, gamemode: req.gamemode, result: await getPlayerStats(tag, req) };
        case "career":
          return { kind: "career", platform: req.platform, gamemode: req.gamemode, result: await getPlayerCareer(tag, req) };
      }
    })
  );

  // Group results by kind
  let summaryResult: OverFastResult<PlayerSummary> | undefined;
  const statsResultsByKey = new Map<string, OverFastResult<PlayerStatsSummary>>();
  const careerResultsByKey = new Map<string, OverFastResult<TrimmedCareer>>();

  for (const res of results) {
    switch (res.kind) {
      case "summary":
        summaryResult = res.result;
        break;
      case "stats":
        statsResultsByKey.set(`${res.platform}:${res.gamemode}`, res.result);
        break;
      case "career":
        careerResultsByKey.set(`${res.platform}:${res.gamemode}`, res.result);
        break;
    }
  }

  if (!summaryResult) {
    return { status: "error", message: "Internal error: summary result missing" };
  }

  if (!summaryResult.ok) {
    const err = summaryResult.error;
    if (err.type === "not_found") return { status: "not_found" };
    if (err.type === "rate_limited") return { status: "rate_limited" };
    return { status: "error", message: `Upstream error: ${err.type}` };
  }

  const summary = summaryResult.data;

  if (isPrivateSummary(summary)) {
    return { status: "private", username: summary.username };
  }

  // statsPartial indicates that one or more of the stats or career fetches failed; MMR is computed best-effort
  let statsPartial = false;
  const byPlatform: Partial<Record<ResolvedPlatform, PlatformDataInput>> = {};

  for (const p of platformsToFetch) {
    let rankedStats: Partial<Record<Role, RoleStats | null>> = emptyRoleMap();
    let unrankedStats: Partial<Record<Role, RoleStats | null>> = emptyRoleMap();

    for (const g of gamemodesToFetch) {
      const statsResult = statsResultsByKey.get(`${p}:${g}`);
      if (!statsResult) continue;

      if (!statsResult.ok) {
        statsPartial = true;
        continue;
      }

      const extracted = extractRoleStats(statsResult.data);

      // Wire career enrichment: attach hero breakdowns when career data is available
      const careerResult = careerResultsByKey.get(`${p}:${g}`);
      if (careerResult && careerResult.ok) {
        const heroBreakdownsByRole = extractHeroBreakdownByRole(careerResult.data);
        attachHeroBreakdowns(extracted, heroBreakdownsByRole);
      } else if (careerResult && !careerResult.ok) {
        statsPartial = true;
      }

      if (g === "competitive") rankedStats = extracted;
      else unrankedStats = extracted;
    }

    byPlatform[p] = {
      competitive: extractCompetitive(summary, p),
      rankedStats,
      unrankedStats,
    };
  }

  const mmr = estimateMMR({ platform, gamemode, byPlatform });

  let season: number | null = null;
  if (platform === "mixed") {
    season = extractSeason(summary, "pc") ?? extractSeason(summary, "console");
  } else {
    season = extractSeason(summary, platform);
  }

  return {
    status: "ok",
    username: summary.username,
    avatar: summary.avatar ?? null,
    platform,
    gamemode,
    season,
    mmr,
    statsPartial,
  };
}
