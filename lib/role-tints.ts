import type { Role } from "@/lib/algorithm/types";
import { THEME } from "@/lib/og/theme";
import { tint } from "@/lib/og/precompute";

// Generated from THEME at module init — single source of truth for role hex values
const T = THEME.roleTank;
const D = THEME.roleDamage;
const S = THEME.roleSupport;

export const ROLE_TINT_06: Readonly<Record<Role, string>> = Object.freeze({
  tank: tint(T, 0.06), damage: tint(D, 0.06), support: tint(S, 0.06),
});

export const ROLE_TINT_20: Readonly<Record<Role, string>> = Object.freeze({
  tank: tint(T, 0.20), damage: tint(D, 0.20), support: tint(S, 0.20),
});

export const ROLE_TINT_25: Readonly<Record<Role, string>> = Object.freeze({
  tank: tint(T, 0.25), damage: tint(D, 0.25), support: tint(S, 0.25),
});

export const ROLE_TINT_30: Readonly<Record<Role, string>> = Object.freeze({
  tank: tint(T, 0.30), damage: tint(D, 0.30), support: tint(S, 0.30),
});

export const DAMAGE_TINT_08 = tint(D, 0.08);
