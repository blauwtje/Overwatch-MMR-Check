import type { CompetitiveDivision } from "@/lib/algorithm/types";

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
