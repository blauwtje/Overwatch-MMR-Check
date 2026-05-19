import { rankToMMR, mmrToRank } from "./rank-mapping";
import { PEER_BASELINES } from "./peer-baselines";
import { ROLE_WEIGHTS } from "./weights";
import type {
  Role,
  Platform,
  ResolvedPlatform,
  Gamemode,
  RoleStats,
  RoleMMRResult,
  MMREstimate,
  CompetitiveDivision,
  Confidence,
  MMRSource,
  SystemRank,
} from "./types";

export const ALGORITHM_VERSION = "1.1.0";

const ROLES: Role[] = ["tank", "damage", "support"];
const UNRANKED_REFERENCE_DIVISION: CompetitiveDivision = "platinum";
const UNRANKED_MMR_SPAN = 1500; // 10× the ranked coefficient

function zscore(value: number, mean: number, stddev: number): number {
  if (stddev === 0) return 0;
  return (value - mean) / stddev;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// log10-based weight: full trust at 200 games, near zero below 5
function sampleSizeWeight(gamesPlayed: number): number {
  return clamp(Math.log10(gamesPlayed + 1) / Math.log10(200), 0, 1);
}

function confidenceFor(sampleWeight: number): Confidence {
  return sampleWeight > 0.7 ? "high" : sampleWeight > 0.4 ? "medium" : "low";
}

/** Weighted blend of two stat samples by games_played. */
function blendStats(
  comp: RoleStats | null | undefined,
  qp: RoleStats | null | undefined
): RoleStats | null {
  if (!comp && !qp) return null;
  if (!qp) return comp ?? null;
  if (!comp) return qp;
  const total = comp.games_played + qp.games_played;
  if (total === 0) return comp;
  const cw = comp.games_played / total;
  const qw = qp.games_played / total;
  return {
    games_played: total,
    games_won: comp.games_won + qp.games_won,
    winrate: comp.winrate * cw + qp.winrate * qw,
    kda: comp.kda * cw + qp.kda * qw,
    average: {
      deaths: comp.average.deaths * cw + qp.average.deaths * qw,
      damage: comp.average.damage * cw + qp.average.damage * qw,
      healing: comp.average.healing * cw + qp.average.healing * qw,
    },
    total: {
      eliminations: comp.total.eliminations + qp.total.eliminations,
      assists: comp.total.assists + qp.total.assists,
      deaths: comp.total.deaths + qp.total.deaths,
      damage: comp.total.damage + qp.total.damage,
      healing: comp.total.healing + qp.total.healing,
    },
  };
}

function computeZScores(
  platform: ResolvedPlatform,
  role: Role,
  division: CompetitiveDivision,
  stats: RoleStats
) {
  const peers = PEER_BASELINES[platform][role][division];
  return {
    winrate: zscore(stats.winrate, peers.winrate.mean, peers.winrate.stddev),
    kda: zscore(stats.kda, peers.kda.mean, peers.kda.stddev),
    avgDeaths: -zscore(stats.average.deaths, peers.avgDeaths.mean, peers.avgDeaths.stddev),
    avgDamage: zscore(stats.average.damage, peers.avgDamage.mean, peers.avgDamage.stddev),
    avgHealing: zscore(stats.average.healing, peers.avgHealing.mean, peers.avgHealing.stddev),
  };
}

interface CompetitiveRankInput {
  division: CompetitiveDivision;
  tier: number;
  rank_icon?: string;
}

/** Ranked path: stats anchored against the player's actual rank. */
function computeRankedRoleMMR(
  role: Role,
  platform: ResolvedPlatform,
  competitive: CompetitiveRankInput,
  stats: RoleStats,
  source: MMRSource,
  sampleSizes: { competitiveGames?: number; quickplayGames?: number }
): RoleMMRResult {
  const baseMMR = rankToMMR(competitive.division, competitive.tier);

  if (stats.games_played < 5) {
    return {
      status: "insufficient_games",
      mmr: baseMMR,
      baseMMR,
      modifier: 0,
      confidence: "low",
      division: competitive.division,
      tier: competitive.tier,
      rankIcon: competitive.rank_icon,
      source,
      systemRank: mmrToRank(baseMMR),
      ...sampleSizes,
      reason: "insufficient_games",
    };
  }

  const zScores = computeZScores(platform, role, competitive.division, stats);
  const weights = ROLE_WEIGHTS[role];

  const rawScore =
    zScores.winrate * weights.winrate +
    zScores.kda * weights.kda +
    zScores.avgDeaths * weights.avgDeaths +
    zScores.avgDamage * weights.avgDamage +
    zScores.avgHealing * weights.avgHealing;

  const sampleWeight = sampleSizeWeight(stats.games_played);
  const rawModifier = rawScore * 150 * sampleWeight;
  const modifier = clamp(rawModifier, -300, 300);
  const estimatedMMR = Math.round(baseMMR + modifier);

  const baseConfidence = confidenceFor(sampleWeight);
  const isPotentialSmurf =
    stats.games_played < 30 &&
    stats.winrate > 65 &&
    (competitive.division === "bronze" || competitive.division === "silver");

  return {
    status: "ranked",
    mmr: estimatedMMR,
    baseMMR,
    modifier: Math.round(modifier),
    confidence: isPotentialSmurf ? "low" : baseConfidence,
    division: competitive.division,
    tier: competitive.tier,
    rankIcon: competitive.rank_icon,
    systemRank: mmrToRank(estimatedMMR),
    source,
    ...sampleSizes,
    breakdown: {
      winRateMod: Math.round(zScores.winrate * weights.winrate * 150 * sampleWeight),
      kdaMod: Math.round(zScores.kda * weights.kda * 150 * sampleWeight),
      roleMod: Math.round(
        (zScores.avgDeaths * weights.avgDeaths +
          zScores.avgDamage * weights.avgDamage +
          zScores.avgHealing * weights.avgHealing) *
          150 *
          sampleWeight
      ),
      sampleWeight,
      zScores,
    },
    reason: isPotentialSmurf ? "potential_smurf" : undefined,
  };
}

/**
 * Unranked path: no Blizzard rank to anchor against. Project the raw performance
 * score against a Platinum baseline across the full ladder. The visible modifier
 * is the residual against the inferred division's base.
 */
function computeUnrankedRoleMMR(
  role: Role,
  platform: ResolvedPlatform,
  stats: RoleStats,
  source: MMRSource,
  sampleSizes: { competitiveGames?: number; quickplayGames?: number }
): RoleMMRResult {
  if (stats.games_played < 5) {
    return {
      status: "insufficient_games",
      mmr: 0,
      baseMMR: 0,
      modifier: 0,
      confidence: "low",
      source,
      ...sampleSizes,
      reason: "insufficient_games",
    };
  }

  const zScores = computeZScores(platform, role, UNRANKED_REFERENCE_DIVISION, stats);
  const weights = ROLE_WEIGHTS[role];

  const rawScore =
    zScores.winrate * weights.winrate +
    zScores.kda * weights.kda +
    zScores.avgDeaths * weights.avgDeaths +
    zScores.avgDamage * weights.avgDamage +
    zScores.avgHealing * weights.avgHealing;

  const sampleWeight = sampleSizeWeight(stats.games_played);
  const platinumAnchor = rankToMMR("platinum", 5); // 2500
  const estimatedMMR = Math.round(
    clamp(platinumAnchor + rawScore * UNRANKED_MMR_SPAN * sampleWeight, 1000, 4500)
  );

  const systemRank = mmrToRank(estimatedMMR);
  const baseMMR = rankToMMR(systemRank.division, systemRank.tier);
  const modifier = estimatedMMR - baseMMR;

  return {
    status: "ranked",
    mmr: estimatedMMR,
    baseMMR,
    modifier,
    confidence: confidenceFor(sampleWeight),
    systemRank,
    source,
    ...sampleSizes,
    breakdown: {
      winRateMod: Math.round(zScores.winrate * weights.winrate * UNRANKED_MMR_SPAN * sampleWeight),
      kdaMod: Math.round(zScores.kda * weights.kda * UNRANKED_MMR_SPAN * sampleWeight),
      roleMod: Math.round(
        (zScores.avgDeaths * weights.avgDeaths +
          zScores.avgDamage * weights.avgDamage +
          zScores.avgHealing * weights.avgHealing) *
          UNRANKED_MMR_SPAN *
          sampleWeight
      ),
      sampleWeight,
      zScores,
    },
  };
}

export interface PlatformDataInput {
  competitive: Partial<Record<Role, CompetitiveRankInput | null>>;
  rankedStats: Partial<Record<Role, RoleStats | null>>;
  unrankedStats: Partial<Record<Role, RoleStats | null>>;
}

export interface PlayerInput {
  platform: Platform;
  gamemode: Gamemode;
  byPlatform: Partial<Record<ResolvedPlatform, PlatformDataInput>>;
}

/** Sum of games_played relevant to the active gamemode for a role on one platform. */
function relevantGames(data: PlatformDataInput | undefined, role: Role, gamemode: Gamemode): number {
  if (!data) return 0;
  const comp = data.rankedStats[role]?.games_played ?? 0;
  const qp = data.unrankedStats[role]?.games_played ?? 0;
  if (gamemode === "ranked") return comp;
  if (gamemode === "unranked") return qp;
  return comp + qp;
}

/**
 * For platform=mixed: per role, return the platform with more games of the relevant
 * gamemode. Tie-breaker: platform where the role has a current competitive rank; else PC.
 */
function resolveRoleSource(
  role: Role,
  byPlatform: PlayerInput["byPlatform"],
  gamemode: Gamemode
): ResolvedPlatform {
  const pcGames = relevantGames(byPlatform.pc, role, gamemode);
  const consoleGames = relevantGames(byPlatform.console, role, gamemode);

  if (pcGames > consoleGames) return "pc";
  if (consoleGames > pcGames) return "console";

  // Tie-breaker: prefer the platform where this role has a current ranked entry.
  const pcRanked = byPlatform.pc?.competitive?.[role];
  const consoleRanked = byPlatform.console?.competitive?.[role];
  if (pcRanked && !consoleRanked) return "pc";
  if (consoleRanked && !pcRanked) return "console";
  return "pc";
}

function emptyUnrankedResult(source: MMRSource): RoleMMRResult {
  return {
    status: "unranked",
    mmr: 0,
    baseMMR: 0,
    modifier: 0,
    confidence: "low",
    source,
  };
}

function computeRoleForResolvedPlatform(
  role: Role,
  resolvedPlatform: ResolvedPlatform,
  data: PlatformDataInput | undefined,
  gamemode: Gamemode
): RoleMMRResult {
  if (!data) return emptyUnrankedResult(gamemode === "unranked" ? "unranked" : "ranked");

  const competitive = data.competitive[role] ?? null;
  const rankedStats = data.rankedStats[role] ?? null;
  const unrankedStats = data.unrankedStats[role] ?? null;

  if (gamemode === "ranked") {
    if (!competitive) return emptyUnrankedResult("ranked");
    if (!rankedStats) {
      const baseMMR = rankToMMR(competitive.division, competitive.tier);
      return {
        status: "insufficient_games",
        mmr: baseMMR,
        baseMMR,
        modifier: 0,
        confidence: "low",
        division: competitive.division,
        tier: competitive.tier,
        rankIcon: competitive.rank_icon,
        systemRank: mmrToRank(baseMMR),
        source: "ranked",
        reason: "no_stats",
      };
    }
    return computeRankedRoleMMR(role, resolvedPlatform, competitive, rankedStats, "ranked", {
      competitiveGames: rankedStats.games_played,
    });
  }

  if (gamemode === "unranked") {
    if (!unrankedStats) return emptyUnrankedResult("unranked");
    return computeUnrankedRoleMMR(role, resolvedPlatform, unrankedStats, "unranked", {
      quickplayGames: unrankedStats.games_played,
    });
  }

  // gamemode === "both"
  const blended = blendStats(rankedStats, unrankedStats);
  if (!blended) return emptyUnrankedResult("blended");

  const sampleSizes = {
    competitiveGames: rankedStats?.games_played ?? 0,
    quickplayGames: unrankedStats?.games_played ?? 0,
  };

  if (competitive) {
    return computeRankedRoleMMR(role, resolvedPlatform, competitive, blended, "blended", sampleSizes);
  }
  // No competitive rank — infer from blended stats (effectively QP-only when comp is absent).
  return computeUnrankedRoleMMR(role, resolvedPlatform, blended, "blended", sampleSizes);
}

export function estimateMMR(player: PlayerInput): MMREstimate {
  const perRole = {} as Record<Role, RoleMMRResult>;

  for (const role of ROLES) {
    let resolvedPlatform: ResolvedPlatform;
    let data: PlatformDataInput | undefined;

    if (player.platform === "mixed") {
      resolvedPlatform = resolveRoleSource(role, player.byPlatform, player.gamemode);
      data = player.byPlatform[resolvedPlatform];
    } else {
      resolvedPlatform = player.platform;
      data = player.byPlatform[resolvedPlatform];
    }

    const result = computeRoleForResolvedPlatform(role, resolvedPlatform, data, player.gamemode);
    if (player.platform === "mixed") {
      result.resolvedPlatform = resolvedPlatform;
    }
    perRole[role] = result;
  }

  // Primary MMR: weighted average by games_played, only roles with ≥20 games and "ranked" status
  const eligible = ROLES.filter((r) => {
    const res = perRole[r];
    if (res.status !== "ranked") return false;
    const games = (res.competitiveGames ?? 0) + (res.quickplayGames ?? 0);
    return games >= 20;
  });

  let primary: MMREstimate["primary"] = null;
  if (eligible.length > 0) {
    const totalGames = eligible.reduce(
      (sum, r) => sum + ((perRole[r].competitiveGames ?? 0) + (perRole[r].quickplayGames ?? 0)),
      0
    );
    const weightedMMR = eligible.reduce((sum, r) => {
      const games = (perRole[r].competitiveGames ?? 0) + (perRole[r].quickplayGames ?? 0);
      return sum + perRole[r].mmr * games;
    }, 0);
    const avgMMR = Math.round(weightedMMR / totalGames);

    const allHigh = eligible.every((r) => perRole[r].confidence === "high");
    const anyLow = eligible.some((r) => perRole[r].confidence === "low");
    const primaryConfidence: Confidence = allHigh ? "high" : anyLow ? "low" : "medium";

    primary = {
      mmr: avgMMR,
      confidence: primaryConfidence,
      contributingRoles: eligible,
    };
  }

  return { perRole, primary, algorithmVersion: ALGORITHM_VERSION };
}

export { rankToMMR, mmrToLabel, mmrToRank } from "./rank-mapping";
export type {
  MMREstimate,
  RoleMMRResult,
  Role,
  Platform,
  ResolvedPlatform,
  Gamemode,
  Confidence,
  SystemRank,
} from "./types";
