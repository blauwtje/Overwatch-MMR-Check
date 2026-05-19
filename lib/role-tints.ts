import type { Role } from "@/lib/algorithm/types";

// Precomputed rgba tints for role colors — replaces runtime color-mix() in inline styles.
// Source values from app/globals.css:
//   --role-tank:    #5b9ef5  → r=91,  g=158, b=245
//   --role-damage:  #f55b5b  → r=245, g=91,  b=91
//   --role-support: #5bf5a0  → r=91,  g=245, b=160

export const ROLE_TINT_06: Readonly<Record<Role, string>> = Object.freeze({
  tank: "rgba(91,158,245,0.06)",
  damage: "rgba(245,91,91,0.06)",
  support: "rgba(91,245,160,0.06)",
});

export const ROLE_TINT_20: Readonly<Record<Role, string>> = Object.freeze({
  tank: "rgba(91,158,245,0.2)",
  damage: "rgba(245,91,91,0.2)",
  support: "rgba(91,245,160,0.2)",
});

export const ROLE_TINT_25: Readonly<Record<Role, string>> = Object.freeze({
  tank: "rgba(91,158,245,0.25)",
  damage: "rgba(245,91,91,0.25)",
  support: "rgba(91,245,160,0.25)",
});

export const ROLE_TINT_30: Readonly<Record<Role, string>> = Object.freeze({
  tank: "rgba(91,158,245,0.3)",
  damage: "rgba(245,91,91,0.3)",
  support: "rgba(91,245,160,0.3)",
});

export const ROLE_TINT_35: Readonly<Record<Role, string>> = Object.freeze({
  tank: "rgba(91,158,245,0.35)",
  damage: "rgba(245,91,91,0.35)",
  support: "rgba(91,245,160,0.35)",
});

/** rgba(245,91,91,0.08) — background for negative modifier badge in role-card */
export const DAMAGE_TINT_08 = "rgba(245,91,91,0.08)";

/** rgba(255,124,42,0.08) — smurf-flag tint (if needed) */
export const SMURF_TINT_COLOR = "rgba(255,124,42,0.08)";
