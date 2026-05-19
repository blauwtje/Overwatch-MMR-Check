import type { CompetitiveDivision, SystemRank } from "@/lib/algorithm/types";

export function rankColor(division: CompetitiveDivision): string {
  const map: Record<CompetitiveDivision, string> = {
    bronze: "var(--rank-bronze)",
    silver: "var(--rank-silver)",
    gold: "var(--rank-gold)",
    platinum: "var(--rank-platinum)",
    diamond: "var(--rank-diamond)",
    master: "var(--rank-master)",
    grandmaster: "var(--rank-grandmaster)",
    ultimate: "var(--rank-ultimate)",
  };
  return map[division] ?? "white";
}

export function roleColor(role: string): string {
  const map: Record<string, string> = {
    tank: "var(--role-tank)",
    damage: "var(--role-damage)",
    support: "var(--role-support)",
  };
  return map[role] ?? "white";
}

export function roleLabel(role: string): string {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export function confidenceLabel(confidence: string): { label: string; color: string } {
  const map: Record<string, { label: string; color: string }> = {
    high: { label: "High confidence", color: "var(--role-support)" },
    medium: { label: "Medium confidence", color: "var(--rank-gold)" },
    low: { label: "Low confidence", color: "var(--orange-accent)" },
  };
  return map[confidence] ?? { label: confidence, color: "white" };
}

export function divisionLabel(division: CompetitiveDivision): string {
  return division.charAt(0).toUpperCase() + division.slice(1);
}

export const DIVISION_ORDER: readonly CompetitiveDivision[] = [
  "bronze",
  "silver",
  "gold",
  "platinum",
  "diamond",
  "master",
  "grandmaster",
  "ultimate",
];

export interface DivTier {
  division: CompetitiveDivision;
  tier: number;
}

export function tierIndex(dt: DivTier): number {
  const idx = DIVISION_ORDER.indexOf(dt.division);
  const clamped = Math.max(1, Math.min(5, dt.tier));
  return idx * 5 + (5 - clamped);
}

export function tierDelta(system: DivTier, actual: DivTier): number {
  return tierIndex(system) - tierIndex(actual);
}

export function compareDivisionTier(a: DivTier, b: DivTier): number {
  return Math.sign(tierIndex(a) - tierIndex(b));
}

export function aggregateTierDelta(
  inputs: Array<{ system?: SystemRank; actual?: DivTier; games: number }>
): number | null {
  const valid = inputs.filter((i) => i.system && i.actual);
  if (valid.length === 0) return null;

  const totalGames = valid.reduce((sum, i) => sum + i.games, 0);
  const equalWeight = totalGames === 0;

  let weightedSum = 0;
  let totalWeight = 0;

  for (const input of valid) {
    const delta = tierDelta(input.system!, input.actual!);
    const weight = equalWeight ? 1 : input.games;
    weightedSum += delta * weight;
    totalWeight += weight;
  }

  return Math.round(weightedSum / totalWeight);
}

export interface VerdictBinding {
  text: string;
  color: string;
  tone: "smurf" | "above" | "neutral" | "below" | "unknown";
}

export function verdictFor(delta: number | null, smurfFlag: boolean): VerdictBinding {
  if (smurfFlag) {
    return { text: "SMURFING DETECTED", color: "var(--orange-accent)", tone: "smurf" };
  }
  if (delta === null) {
    return { text: "MODEL-INFERRED RANK", color: "var(--text-tertiary)", tone: "unknown" };
  }
  const muted = "color-mix(in oklab, var(--role-damage) 70%, var(--text-secondary) 30%)";
  if (delta >= 3) return { text: "PLAYING WAY ABOVE RANK", color: "var(--cyan-accent)", tone: "above" };
  if (delta === 2) return { text: "PLAYING 2 TIERS ABOVE RANK", color: "var(--cyan-accent)", tone: "above" };
  if (delta === 1) return { text: "PLAYING 1 TIER ABOVE RANK", color: "var(--cyan-accent)", tone: "above" };
  if (delta === 0) return { text: "PLAYING AT RANK", color: "var(--text-secondary)", tone: "neutral" };
  if (delta === -1) return { text: "PLAYING 1 TIER BELOW RANK", color: muted, tone: "below" };
  if (delta === -2) return { text: "PLAYING 2 TIERS BELOW RANK", color: muted, tone: "below" };
  return { text: "PLAYING WAY BELOW RANK", color: muted, tone: "below" };
}
