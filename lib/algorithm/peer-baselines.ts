import type { PeerBaselines } from "./types";

// Seeded from community data / leaderboard observation.
// Will be auto-recalculated from DB snapshots post-launch.
// winrate: percent (0-100), kda: ratio, avgDeaths/avgDamage/avgHealing: per 10 min
const BASELINE_TEMPLATE = {
  tank: {
    bronze:     { winrate:{mean:45,stddev:9}, kda:{mean:1.8,stddev:0.7}, avgDeaths:{mean:10,stddev:3}, avgDamage:{mean:6000,stddev:2500}, avgHealing:{mean:400,stddev:300} },
    silver:     { winrate:{mean:47,stddev:9}, kda:{mean:2.0,stddev:0.7}, avgDeaths:{mean:9.5,stddev:3}, avgDamage:{mean:7000,stddev:2500}, avgHealing:{mean:450,stddev:300} },
    gold:       { winrate:{mean:49,stddev:9}, kda:{mean:2.3,stddev:0.7}, avgDeaths:{mean:9.0,stddev:2.5}, avgDamage:{mean:8000,stddev:2500}, avgHealing:{mean:500,stddev:300} },
    platinum:   { winrate:{mean:49,stddev:9}, kda:{mean:2.6,stddev:0.8}, avgDeaths:{mean:8.5,stddev:2.5}, avgDamage:{mean:9000,stddev:2500}, avgHealing:{mean:550,stddev:300} },
    diamond:    { winrate:{mean:50,stddev:8}, kda:{mean:2.9,stddev:0.8}, avgDeaths:{mean:8.0,stddev:2}, avgDamage:{mean:10000,stddev:3000}, avgHealing:{mean:600,stddev:350} },
    master:     { winrate:{mean:50,stddev:8}, kda:{mean:3.3,stddev:0.9}, avgDeaths:{mean:7.5,stddev:2}, avgDamage:{mean:11000,stddev:3000}, avgHealing:{mean:650,stddev:350} },
    grandmaster:{ winrate:{mean:51,stddev:8}, kda:{mean:3.8,stddev:1.0}, avgDeaths:{mean:7.0,stddev:2}, avgDamage:{mean:12500,stddev:3500}, avgHealing:{mean:700,stddev:400} },
    ultimate:   { winrate:{mean:52,stddev:7}, kda:{mean:4.5,stddev:1.2}, avgDeaths:{mean:6.0,stddev:2}, avgDamage:{mean:14000,stddev:4000}, avgHealing:{mean:800,stddev:500} },
  },
  damage: {
    bronze:     { winrate:{mean:45,stddev:9}, kda:{mean:1.5,stddev:0.7}, avgDeaths:{mean:10,stddev:3}, avgDamage:{mean:8000,stddev:3000}, avgHealing:{mean:100,stddev:100} },
    silver:     { winrate:{mean:47,stddev:9}, kda:{mean:1.8,stddev:0.7}, avgDeaths:{mean:9.5,stddev:3}, avgDamage:{mean:9000,stddev:3000}, avgHealing:{mean:100,stddev:100} },
    gold:       { winrate:{mean:49,stddev:9}, kda:{mean:2.1,stddev:0.7}, avgDeaths:{mean:9.0,stddev:2.5}, avgDamage:{mean:10500,stddev:3000}, avgHealing:{mean:120,stddev:100} },
    platinum:   { winrate:{mean:49,stddev:9}, kda:{mean:2.4,stddev:0.8}, avgDeaths:{mean:8.5,stddev:2.5}, avgDamage:{mean:12000,stddev:3000}, avgHealing:{mean:130,stddev:100} },
    diamond:    { winrate:{mean:50,stddev:8}, kda:{mean:2.8,stddev:0.8}, avgDeaths:{mean:8.0,stddev:2}, avgDamage:{mean:14000,stddev:3500}, avgHealing:{mean:150,stddev:120} },
    master:     { winrate:{mean:50,stddev:8}, kda:{mean:3.3,stddev:1.0}, avgDeaths:{mean:7.5,stddev:2}, avgDamage:{mean:16000,stddev:4000}, avgHealing:{mean:180,stddev:150} },
    grandmaster:{ winrate:{mean:51,stddev:8}, kda:{mean:3.9,stddev:1.1}, avgDeaths:{mean:7.0,stddev:2}, avgDamage:{mean:18000,stddev:4000}, avgHealing:{mean:200,stddev:150} },
    ultimate:   { winrate:{mean:52,stddev:7}, kda:{mean:4.8,stddev:1.3}, avgDeaths:{mean:6.0,stddev:2}, avgDamage:{mean:21000,stddev:5000}, avgHealing:{mean:250,stddev:200} },
  },
  support: {
    bronze:     { winrate:{mean:45,stddev:9}, kda:{mean:1.8,stddev:0.7}, avgDeaths:{mean:9,stddev:3}, avgDamage:{mean:3000,stddev:1500}, avgHealing:{mean:6000,stddev:2500} },
    silver:     { winrate:{mean:47,stddev:9}, kda:{mean:2.1,stddev:0.7}, avgDeaths:{mean:8.5,stddev:2.5}, avgDamage:{mean:3500,stddev:1500}, avgHealing:{mean:7000,stddev:2500} },
    gold:       { winrate:{mean:49,stddev:9}, kda:{mean:2.4,stddev:0.7}, avgDeaths:{mean:8.0,stddev:2.5}, avgDamage:{mean:4000,stddev:1500}, avgHealing:{mean:8000,stddev:3000} },
    platinum:   { winrate:{mean:49,stddev:9}, kda:{mean:2.7,stddev:0.8}, avgDeaths:{mean:7.5,stddev:2}, avgDamage:{mean:4500,stddev:1500}, avgHealing:{mean:8500,stddev:3000} },
    diamond:    { winrate:{mean:50,stddev:8}, kda:{mean:3.1,stddev:0.8}, avgDeaths:{mean:7.0,stddev:2}, avgDamage:{mean:5000,stddev:2000}, avgHealing:{mean:9000,stddev:3000} },
    master:     { winrate:{mean:50,stddev:8}, kda:{mean:3.6,stddev:0.9}, avgDeaths:{mean:6.5,stddev:2}, avgDamage:{mean:5500,stddev:2000}, avgHealing:{mean:9500,stddev:3500} },
    grandmaster:{ winrate:{mean:51,stddev:8}, kda:{mean:4.2,stddev:1.0}, avgDeaths:{mean:6.0,stddev:1.5}, avgDamage:{mean:6500,stddev:2500}, avgHealing:{mean:10500,stddev:4000} },
    ultimate:   { winrate:{mean:52,stddev:7}, kda:{mean:5.1,stddev:1.2}, avgDeaths:{mean:5.0,stddev:1.5}, avgDamage:{mean:8000,stddev:3000}, avgHealing:{mean:12000,stddev:5000} },
  },
} as const;

// Console meta is slightly different: generally lower damage numbers, more forgiving KDA
// We apply a conservative scaling (0.9× damage baselines, otherwise same)
function scaleForConsole(
  base: typeof BASELINE_TEMPLATE
): typeof BASELINE_TEMPLATE {
  return Object.fromEntries(
    Object.entries(base).map(([role, rankMap]) => [
      role,
      Object.fromEntries(
        Object.entries(rankMap).map(([rank, vals]) => [
          rank,
          {
            ...vals,
            avgDamage: {
              mean: vals.avgDamage.mean * 0.9,
              stddev: vals.avgDamage.stddev * 0.9,
            },
          },
        ])
      ),
    ])
  ) as typeof BASELINE_TEMPLATE;
}

export const PEER_BASELINES: PeerBaselines = {
  pc: BASELINE_TEMPLATE,
  console: scaleForConsole(BASELINE_TEMPLATE),
};
