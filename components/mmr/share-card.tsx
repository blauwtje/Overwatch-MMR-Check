import type { Platform, Gamemode, MMREstimate, Role } from "@/lib/algorithm/types";
import {
  rankColor,
  roleColor,
  divisionLabel,
  aggregateTierDelta,
  verdictFor,
  tierDelta,
} from "@/lib/rank-utils";
import { mmrToLabel } from "@/lib/algorithm";
import { Verdict } from "@/components/mmr/verdict";
import { RoleIcon } from "@/components/mmr/role-icon";
import { ShareButton } from "@/components/mmr/share-button";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

const ROLES: Role[] = ["tank", "damage", "support"];
const ROLE_SHORT: Record<Role, string> = { tank: "TANK", damage: "DPS", support: "SUP" };
const PLATFORM_LABEL: Record<Platform, string> = { pc: "PC", console: "CONSOLE", mixed: "MIXED" };
const GAMEMODE_LABEL: Record<Gamemode, string> = { ranked: "RANKED", unranked: "UNRANKED", both: "BOTH" };

interface ShareCardProps {
  username: string;
  displayTag: string;
  avatar: string | null;
  platform: Platform;
  gamemode: Gamemode;
  mmr: MMREstimate;
  shareUrl: string;
  ogUrl?: string;
}

export function ShareCard({
  username,
  displayTag,
  avatar,
  platform,
  gamemode,
  mmr,
  shareUrl,
  ogUrl,
}: ShareCardProps) {
  const verdictInputs = ROLES.map((role) => {
    const r = mmr.perRole[role];
    return {
      system: r.systemRank,
      actual:
        r.division && r.tier != null
          ? { division: r.division, tier: r.tier }
          : undefined,
      games: (r.competitiveGames ?? 0) + (r.quickplayGames ?? 0),
    };
  });

  const delta = aggregateTierDelta(verdictInputs);
  const smurfFlag = Object.values(mmr.perRole).some((r) => r.reason === "potential_smurf");
  const binding = verdictFor(delta, smurfFlag);
  const primaryMissing =
    mmr.primary == null && ROLES.every((r) => mmr.perRole[r].status !== "ranked");

  const shareText = `${binding.text} — ${displayTag}`;

  // Primary hero: highest timePlayedSec across all roles
  const allHeroes = ROLES.flatMap((role) =>
    (mmr.perRole[role].heroBreakdown ?? []).map((h) => ({ ...h, role }))
  );
  allHeroes.sort((a, b) => b.timePlayedSec - a.timePlayedSec);
  const featuredHero = allHeroes[0] ?? null;

  return (
    <section
      id="share-card-root"
      className="rounded-xl relative overflow-hidden mb-6"
      style={{
        background: "var(--surface-1)",
        border: "1px solid var(--border-accent)",
        boxShadow: "0 0 60px rgba(0,212,255,0.10)",
      }}
    >
      {/* Scanlines overlay */}
      <div className="scanlines absolute inset-0 pointer-events-none opacity-40" style={{ zIndex: 0 }} />

      {/* Radial glow — top-left */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 0% 0%, rgba(0,212,255,0.07) 0%, transparent 55%)",
          zIndex: 0,
        }}
      />

      {/* Featured hero portrait — right-side fade */}
      {featuredHero && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/heroes/${featuredHero.hero}.webp`}
            alt=""
            aria-hidden="true"
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              height: "100%",
              width: "40%",
              objectFit: "cover",
              objectPosition: "top center",
              opacity: 0.12,
              zIndex: 0,
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(90deg, var(--surface-1) 40%, transparent 80%)",
              zIndex: 0,
            }}
          />
        </>
      )}

      <div className="relative flex flex-col" style={{ zIndex: 1 }}>
        {/* Top bar — wordmark · tag · share */}
        <div className="flex items-center gap-3 px-5 sm:px-6 pt-4 pb-3">
          {/* Wordmark */}
          <span className="font-display font-black text-sm shrink-0" style={{ color: "var(--text-primary)" }}>
            ow<em style={{ fontStyle: "italic", color: "var(--cyan-accent)" }}>MMR</em>
          </span>

          {/* Player identity */}
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {avatar ? (
              <img
                src={avatar}
                alt={username}
                className="w-6 h-6 rounded shrink-0"
                style={{ border: "1px solid var(--border-accent)" }}
              />
            ) : null}
            <span
              className="font-display font-black truncate"
              style={{ fontSize: "clamp(13px, 2.5vw, 18px)", letterSpacing: "-0.01em", color: "var(--text-primary)" }}
            >
              {displayTag}
            </span>
            <span
              className="text-[10px] font-display tracking-widest uppercase px-1.5 py-0.5 rounded shrink-0"
              style={{ background: "rgba(0,212,255,0.1)", color: "var(--cyan-accent)", border: "1px solid rgba(0,212,255,0.2)" }}
            >
              {PLATFORM_LABEL[platform]}
            </span>
            <span
              className="text-[10px] font-display tracking-widest uppercase px-1.5 py-0.5 rounded shrink-0"
              style={{ background: "rgba(0,212,255,0.06)", color: "var(--cyan-accent)", border: "1px solid rgba(0,212,255,0.15)" }}
            >
              {GAMEMODE_LABEL[gamemode]}
            </span>
          </div>

          <ShareButton
            title={`owMMR — ${displayTag}`}
            text={shareText}
            url={shareUrl}
            ogUrl={ogUrl}
            displayTag={displayTag}
            className="shrink-0"
          />
        </div>

        {/* Verdict — dominant typographic block */}
        {!primaryMissing && (
          <div className="px-5 sm:px-6 pb-4">
            <Verdict delta={delta} smurfFlag={smurfFlag} size="lg" />
            {mmr.primary && (
              <p className="font-mono text-xs mt-1.5" style={{ color: "var(--text-tertiary)" }}>
                MMR {mmr.primary.mmr.toLocaleString()} · {mmrToLabel(mmr.primary.mmr)}
              </p>
            )}
          </div>
        )}

        {primaryMissing && (
          <div className="px-5 sm:px-6 pb-4">
            <p className="font-display text-sm" style={{ color: "var(--text-secondary)" }}>
              No MMR estimate — try a different platform or gamemode
            </p>
          </div>
        )}

        {/* Role triptych with hero thumbnails */}
        <div
          className="grid grid-cols-3 gap-px"
          style={{ background: "var(--border-subtle)", borderTop: "1px solid var(--border-subtle)" }}
        >
          {ROLES.map((role) => {
            const r = mmr.perRole[role];
            const rColor = roleColor(role);
            const hasActual = !!r.division && r.tier != null;
            const actualLabel = hasActual
              ? `${divisionLabel(r.division!)} ${r.tier}`
              : "—";
            const actualColor = hasActual ? rankColor(r.division!) : "var(--text-tertiary)";
            const topHero = r.heroBreakdown?.[0] ?? null;

            let diff: number | null = null;
            if (hasActual && r.systemRank) {
              diff = tierDelta(
                { division: r.systemRank.division, tier: r.systemRank.tier },
                { division: r.division!, tier: r.tier! }
              );
            }

            const arrowColor =
              diff === null || diff === 0
                ? "var(--text-tertiary)"
                : diff > 0
                ? "var(--cyan-accent)"
                : "color-mix(in oklab, var(--role-damage) 70%, var(--text-secondary) 30%)";

            const magnitude =
              diff === null || diff === 0
                ? ""
                : diff > 0
                ? `+${diff}`
                : `${diff}`;

            const sysLabel = r.systemRank ? r.systemRank.label : "—";
            const sysColor = r.systemRank ? rankColor(r.systemRank.division) : "var(--text-tertiary)";

            return (
              <div
                key={role}
                className="flex flex-col items-center gap-1 px-2 py-3 relative"
                style={{
                  background: "var(--surface-1)",
                  borderTop: `2px solid color-mix(in srgb, ${rColor} 30%, transparent)`,
                }}
              >
                {/* Role icon + label */}
                <div className="flex items-center gap-1">
                  <RoleIcon role={role} size={11} style={{ color: rColor }} />
                  <span
                    className="text-[9px] font-display tracking-widest uppercase"
                    style={{ color: rColor }}
                  >
                    {ROLE_SHORT[role]}
                  </span>
                </div>

                {/* Top hero micro-portrait */}
                {topHero && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/heroes/${topHero.hero}.webp`}
                    alt=""
                    aria-hidden="true"
                    width={20}
                    height={20}
                    style={{
                      width: 20,
                      height: 20,
                      objectFit: "cover",
                      borderRadius: 3,
                      opacity: 0.7,
                      border: `1px solid color-mix(in srgb, ${rColor} 25%, transparent)`,
                    }}
                  />
                )}

                {/* Actual rank */}
                <span
                  className="text-[11px] font-display font-semibold"
                  style={{ color: actualColor }}
                >
                  {actualLabel}
                </span>

                {/* Delta arrow */}
                <div className="flex items-center gap-0.5 min-h-[14px]">
                  {diff === null || diff === 0 ? (
                    <Minus style={{ width: 10, height: 10, color: arrowColor }} />
                  ) : diff > 0 ? (
                    <ArrowUp style={{ width: 10, height: 10, color: arrowColor }} />
                  ) : (
                    <ArrowDown style={{ width: 10, height: 10, color: arrowColor }} />
                  )}
                  {magnitude && (
                    <span className="font-mono text-[10px]" style={{ color: arrowColor }}>
                      {magnitude}
                    </span>
                  )}
                </div>

                {/* System rank */}
                <span
                  className="text-[11px] font-display font-semibold"
                  style={{ color: sysColor }}
                >
                  {sysLabel}
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer — version + URL */}
        <div
          className="flex items-center justify-between px-5 py-2"
          style={{ background: "rgba(0,0,0,0.25)", borderTop: "1px solid var(--border-subtle)" }}
        >
          <span className="font-mono text-[10px]" style={{ color: "var(--text-disabled)" }}>
            v{mmr.algorithmVersion}
          </span>
          <span className="font-mono text-[10px]" style={{ color: "var(--text-disabled)" }}>
            {shareUrl.replace(/^https?:\/\//, "")}
          </span>
        </div>
      </div>
    </section>
  );
}
