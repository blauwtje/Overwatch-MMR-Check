import type { components } from "@/src/types/overfast";
import type { Role } from "@/lib/algorithm/types";

type HeroKey = components["schemas"]["HeroKey"];

export const HERO_TO_ROLE = {
  // Tank heroes
  dva: "tank",
  doomfist: "tank",
  hazard: "tank",
  "junker-queen": "tank",
  mauga: "tank",
  orisa: "tank",
  ramattra: "tank",
  reinhardt: "tank",
  roadhog: "tank",
  sigma: "tank",
  winston: "tank",
  "wrecking-ball": "tank",
  zarya: "tank",
  // Support heroes
  ana: "support",
  baptiste: "support",
  brigitte: "support",
  illari: "support",
  juno: "support",
  kiriko: "support",
  lifeweaver: "support",
  lucio: "support",
  mercy: "support",
  moira: "support",
  zenyatta: "support",
  // Damage heroes
  ashe: "damage",
  bastion: "damage",
  cassidy: "damage",
  echo: "damage",
  genji: "damage",
  hanzo: "damage",
  junkrat: "damage",
  mei: "damage",
  pharah: "damage",
  reaper: "damage",
  sojourn: "damage",
  "soldier-76": "damage",
  sombra: "damage",
  symmetra: "damage",
  torbjorn: "damage",
  tracer: "damage",
  venture: "damage",
  widowmaker: "damage",
} satisfies Partial<Record<HeroKey, Role>>;
