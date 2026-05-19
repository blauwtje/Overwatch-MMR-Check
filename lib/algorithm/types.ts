import type { components } from "@/src/types/overfast";

type HeroKey = components["schemas"]["HeroKey"];

export type CompetitiveDivision =
  | "bronze"
  | "silver"
  | "gold"
  | "platinum"
  | "diamond"
  | "master"
  | "grandmaster"
  | "ultimate";

export type Role = "tank" | "damage" | "support";
export type Platform = "pc" | "console" | "mixed";
export type ResolvedPlatform = "pc" | "console";
export type Gamemode = "ranked" | "unranked" | "both";
export type MMRSource = "ranked" | "unranked" | "blended";
export type Confidence = "low" | "medium" | "high";

export interface HeroBreakdown {
  hero: HeroKey;
  timePlayedSec: number;
  gamesPlayed: number;
  gamesWon: number;
  winrate: number; // percentage (0-100)
  kda: number;
}

export interface RoleStats {
  games_played: number;
  games_won: number;
  winrate: number; // 0-100
  kda: number;
  average: {
    deaths: number;  // per 10 min
    damage: number;  // per 10 min
    healing: number; // per 10 min
  };
  total: {
    eliminations: number;
    assists: number;
    deaths: number;
    damage: number;
    healing: number;
  };
  // Optional career enrichment fields (populated when career data is available)
  heroBreakdown?: HeroBreakdown[]; // sorted desc by timePlayedSec, top 10
  specializationRatio?: number; // top-1-hero timePlayedSec / total role timePlayedSec
  heroCount?: number; // count of heroes with timePlayedSec >= 3600
}

export interface SystemRank {
  division: CompetitiveDivision;
  tier: number;
  label: string;
}

export interface RoleMMRResult {
  status: "ranked" | "unranked" | "insufficient_games";
  mmr: number;
  baseMMR: number;
  modifier: number;
  confidence: Confidence;
  division?: CompetitiveDivision;
  tier?: number;
  rankIcon?: string;
  /** When platform=mixed, indicates which platform was chosen for this role. */
  resolvedPlatform?: ResolvedPlatform;
  /** Inferred rank derived from estimated MMR — for system vs actual comparison. */
  systemRank?: SystemRank;
  /** Provenance of the MMR estimate. */
  source?: MMRSource;
  /** Combined sample size (used when source=blended). */
  competitiveGames?: number;
  quickplayGames?: number;
  breakdown?: {
    winRateMod: number;
    kdaMod: number;
    roleMod: number;
    sampleWeight: number;
    zScores: Record<string, number>;
  };
  heroBreakdown?: HeroBreakdown[];
  reason?: string;
}

export interface PrimaryMMR {
  mmr: number;
  confidence: Confidence;
  contributingRoles: Role[];
}

export interface MMREstimate {
  perRole: Record<Role, RoleMMRResult>;
  primary: PrimaryMMR | null;
  algorithmVersion: string;
}

export interface PeerBaseline {
  winrate: { mean: number; stddev: number };
  kda: { mean: number; stddev: number };
  avgDeaths: { mean: number; stddev: number };
  avgDamage: { mean: number; stddev: number };
  avgHealing: { mean: number; stddev: number };
}

export type PeerBaselines = Record<
  ResolvedPlatform,
  Record<Role, Record<CompetitiveDivision, PeerBaseline>>
>;
