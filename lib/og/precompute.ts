/**
 * Pure, side-effect-free helper functions for OG generation.
 * Precomputes colors and resolves CSS variables to concrete values.
 *
 * Used by OG route (Phase 2c) and performance pass (Phase 3).
 */

import type { CompetitiveDivision } from "@/lib/algorithm/types";
import { THEME } from "./theme";

/**
 * Convert a 6-char hex color + alpha to rgba(r,g,b,alpha).
 * Takes a hex string with or without leading #, returns rgba string.
 * Replaces every `color-mix(in srgb, ${rColor} N%, transparent)` site.
 */
export function tint(hex: string, alpha: number): string {
  const clean = hex.startsWith("#") ? hex.slice(1) : hex;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/**
 * Convenience wrapper: pick a role color from THEME and apply alpha tinting.
 */
export function roleTint(role: string, alpha: number): string {
  const map: Record<string, string> = {
    tank: THEME.roleTank,
    damage: THEME.roleDamage,
    support: THEME.roleSupport,
  };
  const color = map[role] ?? "#ffffff";
  return tint(color, alpha);
}

/**
 * Resolve a CompetitiveDivision to its hex color from THEME.
 * Returns the color as a plain hex string (no CSS vars).
 */
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

/**
 * Precomputed color equivalent of:
 * color-mix(in oklab, var(--role-damage) 70%, var(--text-secondary) 30%)
 *
 * Used in verdictFor() for below-rank messages (delta < 0).
 */
export const MUTED_DAMAGE_COLOR = "rgba(221,108,108,0.85)";
