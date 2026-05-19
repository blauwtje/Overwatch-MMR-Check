import type { PlayerSummary, PlayerStatsSummary } from "./client";
import type {
  Role,
  ResolvedPlatform,
  RoleStats,
  CompetitiveDivision,
  HeroBreakdown,
} from "@/lib/algorithm/types";

export interface PlayerCompetitiveRank {
  division: CompetitiveDivision;
  tier: number;
  rank_icon?: string;
}

const ROLES: Role[] = ["tank", "damage", "support"];

export function isPrivateSummary(summary: PlayerSummary): boolean {
  return !summary.competitive;
}

export function extractCompetitive(
  summary: PlayerSummary,
  platform: ResolvedPlatform
): Partial<Record<Role, PlayerCompetitiveRank | null>> {
  const platformRanks = summary.competitive?.[platform];
  const result: Partial<Record<Role, PlayerCompetitiveRank | null>> = {};
  for (const role of ROLES) {
    const rank = platformRanks?.[role];
    if (rank) {
      result[role] = {
        division: rank.division as CompetitiveDivision,
        tier: rank.tier,
        rank_icon: rank.rank_icon,
      };
    } else {
      result[role] = null;
    }
  }
  return result;
}

export function extractRoleStats(
  stats: PlayerStatsSummary | null
): Partial<Record<Role, RoleStats | null>> {
  const result: Partial<Record<Role, RoleStats | null>> = {};
  const statsRoles = stats?.roles;
  for (const role of ROLES) {
    const rs = statsRoles?.[role];
    if (!rs) {
      result[role] = null;
      continue;
    }
    result[role] = {
      games_played: rs.games_played,
      games_won: rs.games_won,
      winrate: rs.winrate,
      kda: rs.kda,
      average: {
        deaths: rs.average.deaths,
        damage: rs.average.damage,
        healing: rs.average.healing,
      },
      total: {
        eliminations: rs.total.eliminations,
        assists: rs.total.assists,
        deaths: rs.total.deaths,
        damage: rs.total.damage,
        healing: rs.total.healing,
      },
    } satisfies RoleStats;
  }
  return result;
}

export function extractSeason(
  summary: PlayerSummary,
  platform: ResolvedPlatform
): number | null {
  return summary.competitive?.[platform]?.season ?? null;
}

export function attachHeroBreakdowns(
  roleStats: Partial<Record<Role, RoleStats | null>>,
  heroBreakdownsByRole: Partial<Record<Role, HeroBreakdown[]>>
): void {
  for (const [roleKey, breakdowns] of Object.entries(heroBreakdownsByRole) as [Role, HeroBreakdown[]][]) {
    const rs = roleStats[roleKey];
    if (rs == null) continue;

    rs.heroBreakdown = breakdowns;

    const totalTime = breakdowns.reduce((sum, b) => sum + b.timePlayedSec, 0);
    rs.specializationRatio =
      totalTime > 0 ? breakdowns[0].timePlayedSec / totalTime : 0;

    rs.heroCount = breakdowns.filter((b) => b.timePlayedSec >= 3600).length;
  }
}
