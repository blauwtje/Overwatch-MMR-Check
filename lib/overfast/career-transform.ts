import type { HeroBreakdown, Role } from "@/lib/algorithm/types";
import { HERO_TO_ROLE } from "@/lib/overfast/hero-role";
import type { components } from "@/src/types/overfast";

type HeroKey = components["schemas"]["HeroKey"];

// TrimmedCareer is defined in client.ts but not exported — redeclare locally for this module
type TrimmedCareerHero = {
  game?: Record<string, number>;
  combat?: Record<string, number>;
  assists?: Record<string, number>;
  average?: Record<string, number>;
};
type TrimmedCareer = Partial<Record<string, TrimmedCareerHero>>;

let warned = false;

export function extractHeroBreakdownByRole(
  career: TrimmedCareer
): Partial<Record<Role, HeroBreakdown[]>> {
  const result: Partial<Record<Role, HeroBreakdown[]>> = {};

  for (const [heroKey, heroData] of Object.entries(career)) {
    // Skip the all-heroes aggregate key
    if (heroKey === "all-heroes") continue;

    // Skip heroes not in HERO_TO_ROLE (unknown or experimental heroes)
    if (!(heroKey in HERO_TO_ROLE)) continue;

    // Skip null or undefined hero entries
    if (heroData == null) continue;

    const role = HERO_TO_ROLE[heroKey as keyof typeof HERO_TO_ROLE];

    const timePlayedSec = heroData.game?.["time_played"] ?? 0;
    const gamesPlayed = heroData.game?.["games_played"] ?? 0;
    const gamesWon =
      heroData.game?.["games_won"] ??
      Math.max(
        0,
        (heroData.game?.["games_played"] ?? 0) -
          (heroData.game?.["games_lost"] ?? 0)
      );
    const winrate = gamesPlayed > 0 ? (gamesWon / gamesPlayed) * 100 : 0;
    const kda =
      ((heroData.combat?.["eliminations"] ?? 0) +
        (heroData.assists?.["assists"] ?? 0)) /
      Math.max(heroData.combat?.["deaths"] ?? 0, 1);

    // Skip heroes with less than 1 minute of playtime (noise)
    if (timePlayedSec < 60) continue;

    const breakdown: HeroBreakdown = {
      hero: heroKey as HeroKey,
      timePlayedSec,
      gamesPlayed,
      gamesWon,
      winrate,
      kda,
    };

    if (!result[role]) {
      result[role] = [];
    }
    result[role]!.push(breakdown);
  }

  // Sort each role array descending by timePlayedSec and truncate to top 10
  for (const role of Object.keys(result) as Role[]) {
    result[role] = result[role]!
      .sort((a, b) => b.timePlayedSec - a.timePlayedSec)
      .slice(0, 10);
  }

  // One-time warning for suspiciously large time_played values
  if (!warned) {
    const hasSuspiciousValue = (Object.values(result) as HeroBreakdown[][]).some(
      (breakdowns) => breakdowns.some((b) => b.timePlayedSec > 1_000_000)
    );
    if (hasSuspiciousValue) {
      warned = true;
      console.warn(
        "[owMMR] career-transform: suspiciously large time_played value detected — possible unit mismatch (expected seconds)"
      );
    }
  }

  return result;
}
