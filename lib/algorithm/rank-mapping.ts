import type { CompetitiveDivision, SystemRank } from "./types";

const DIVISION_BASE: Record<CompetitiveDivision, number> = {
  bronze: 1000,
  silver: 1500,
  gold: 2000,
  platinum: 2500,
  diamond: 3000,
  master: 3500,
  grandmaster: 4000,
  ultimate: 4500, // Champion / top tier
};

// tier 5 is lowest, tier 1 is highest within a division
// tier 5 → +0, tier 1 → +400 (4 steps × 100)
export function rankToMMR(division: CompetitiveDivision, tier: number): number {
  const base = DIVISION_BASE[division];
  const tierBonus = (5 - tier) * 100; // tier 1 → 400, tier 5 → 0
  return base + tierBonus;
}

interface DivisionRange {
  division: CompetitiveDivision;
  floor: number;
}

const DIVISION_RANGES: DivisionRange[] = [
  { division: "ultimate", floor: 4500 },
  { division: "grandmaster", floor: 4000 },
  { division: "master", floor: 3500 },
  { division: "diamond", floor: 3000 },
  { division: "platinum", floor: 2500 },
  { division: "gold", floor: 2000 },
  { division: "silver", floor: 1500 },
  { division: "bronze", floor: 0 },
];

function divisionLabel(division: CompetitiveDivision): string {
  return division.charAt(0).toUpperCase() + division.slice(1);
}

/** Structured inverse of rankToMMR. */
export function mmrToRank(mmr: number): SystemRank {
  if (mmr >= 4900) {
    return { division: "ultimate", tier: 1, label: "Top 500" };
  }
  if (mmr >= 4500) {
    return { division: "ultimate", tier: 1, label: "Champion" };
  }
  const range = DIVISION_RANGES.find((r) => mmr >= r.floor) ?? DIVISION_RANGES[DIVISION_RANGES.length - 1];
  // tier 5 = lowest, tier 1 = highest within division
  const tier = Math.max(1, Math.min(5, 5 - Math.floor((mmr - range.floor) / 100)));
  return {
    division: range.division,
    tier,
    label: `${divisionLabel(range.division)} ${tier}`,
  };
}

export function mmrToLabel(mmr: number): string {
  return mmrToRank(mmr).label;
}
