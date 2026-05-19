import type { Role } from "./types";

export interface StatWeights {
  winrate: number;
  kda: number;
  avgDeaths: number;   // lower is better — sign-flipped in computation
  avgDamage: number;
  avgHealing: number;
}

export const ROLE_WEIGHTS: Record<Role, StatWeights> = {
  tank: {
    winrate: 0.40,
    kda: 0.15,
    avgDeaths: 0.20,  // front-line positioning signal
    avgDamage: 0.15,
    avgHealing: 0.10,
  },
  damage: {
    winrate: 0.40,
    kda: 0.20,
    avgDeaths: 0.15,
    avgDamage: 0.20,
    avgHealing: 0.05,
  },
  support: {
    winrate: 0.40,
    kda: 0.10,
    avgDeaths: 0.20, // survival = utility for support
    avgDamage: 0.10,
    avgHealing: 0.20,
  },
};
