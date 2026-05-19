import { getPlayerSummary, getPlayerStats } from "@/lib/overfast/client";
import {
  extractCompetitive,
  extractRoleStats,
  extractSeason,
  isPrivateSummary,
} from "@/lib/overfast/transform";
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

const ROLES: Role[] = ["tank", "damage", "support"];

function emptyRoleMap(): Partial<Record<Role, RoleStats | null>> {
  return { tank: null, damage: null, support: null };
}

export async function fetchPlayerData(
  tag: string,
  platform: Platform,
  gamemode: Gamemode = "ranked"
): Promise<PlayerPageData> {
  const platformsToFetch = RESOLVED_PLATFORMS_FOR(platform);
  const gamemodesToFetch = STATS_GAMEMODES_FOR(gamemode);

  const statsKeys: Array<{ platform: ResolvedPlatform; gamemode: "competitive" | "quickplay" }> = [];
  for (const p of platformsToFetch) {
    for (const g of gamemodesToFetch) {
      statsKeys.push({ platform: p, gamemode: g });
    }
  }

  const [summaryResult, ...statsResults] = await Promise.all([
    getPlayerSummary(tag),
    ...statsKeys.map((k) => getPlayerStats(tag, k)),
  ]);

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

  let statsPartial = false;
  const byPlatform: Partial<Record<ResolvedPlatform, PlatformDataInput>> = {};

  for (const p of platformsToFetch) {
    let rankedStats: Partial<Record<Role, RoleStats | null>> = emptyRoleMap();
    let unrankedStats: Partial<Record<Role, RoleStats | null>> = emptyRoleMap();

    for (let i = 0; i < statsKeys.length; i++) {
      if (statsKeys[i].platform !== p) continue;
      const r = statsResults[i];
      if (!r.ok) {
        statsPartial = true;
        continue;
      }
      const extracted = extractRoleStats(r.data);
      if (statsKeys[i].gamemode === "competitive") rankedStats = extracted;
      else unrankedStats = extracted;
    }

    byPlatform[p] = {
      competitive: extractCompetitive(summary, p),
      rankedStats,
      unrankedStats,
    };
  }

  // For ranked mode in single-platform requests, mark statsPartial only if we actually
  // wanted comp stats for that platform and the call failed.
  // (already handled above — statsPartial reflects any failed fetch among the ones we asked for)

  const mmr = estimateMMR({ platform, gamemode, byPlatform });

  let season: number | null = null;
  if (platform === "mixed") {
    season = extractSeason(summary, "pc") ?? extractSeason(summary, "console");
  } else {
    season = extractSeason(summary, platform);
  }
  void ROLES;

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
