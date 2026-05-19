import type { CompetitiveDivision } from "@/lib/algorithm/types";
import { THEME } from "./theme";

// hex "#rrggbb" + alpha → "rgba(r,g,b,alpha)"; replaces color-mix() at every call site
export function tint(hex: string, alpha: number): string {
  const clean = hex.startsWith("#") ? hex.slice(1) : hex;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function roleTint(role: string, alpha: number): string {
  const map: Record<string, string> = {
    tank: THEME.roleTank,
    damage: THEME.roleDamage,
    support: THEME.roleSupport,
  };
  return tint(map[role] ?? "#ffffff", alpha);
}

export function rankColorHex(division: CompetitiveDivision): string {
  const map: Record<CompetitiveDivision, string> = {
    bronze: THEME.rankBronze,
    silver: THEME.rankSilver,
    gold: THEME.rankGold,
    platinum: THEME.rankPlatinum,
    diamond: THEME.rankDiamond,
    master: THEME.rankMaster,
    grandmaster: THEME.rankGrandmaster,
    ultimate: THEME.rankUltimate,
  };
  return map[division] ?? "#ffffff";
}

// precomputed: color-mix(in oklab, var(--role-damage) 70%, var(--text-secondary) 30%)
export const MUTED_DAMAGE_COLOR = "rgba(221,108,108,0.85)";
