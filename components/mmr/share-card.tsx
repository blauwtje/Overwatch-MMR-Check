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
}

export function ShareCard({
  username,
  displayTag,
  avatar,
  platform,
  gamemode,
  mmr,
  shareUrl,
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

  return (
    <section
      id="share-card-root"
      className="rounded-xl relative overflow-hidden mb-6"
      style={{
        background: "var(--surface-1)",
        border: "1px solid var(--border-accent)",
        boxShadow: "0 0 60px rgba(0,212,255,0.08)",
      }}
    >
      {/* Scanlines overlay */}
      <div className="scanlines absolute inset-0 pointer-events-none opacity-40" style={{ zIndex: 0 }} />
      {/* Top-left radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 0% 0%, rgba(0,212,255,0.06) 0%, transparent 60%)",
          zIndex: 0,
        }}
      />

      <div className="relative" style={{ zIndex: 1 }}>
        {/* Top row */}
        <div className="flex items-start gap-4 p-5 sm:p-6">
          {avatar ? (
            <img
              src={avatar}
              alt={username}
              className="w-16 h-16 rounded-lg shrink-0"
              style={{ border: "2px solid var(--cyan-accent)" }}
            />
          ) : (
            <div
              className="w-16 h-16 rounded-lg shrink-0 flex items-center justify-center"
              style={{ background: "var(--surface-3)", border: "2px solid var(--border-accent)" }}
            >
              <span className="font-display font-black text-xl" style={{ color: "var(--text-tertiary)" }}>
                {username.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h1
              className="font-display font-black leading-none truncate"
              style={{
                fontSize: "clamp(24px, 5vw, 36px)",
                letterSpacing: "-0.02em",
                color: "var(--text-primary)",
              }}
            >
              {displayTag}
            </h1>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span
                className="text-[10px] font-display tracking-widest uppercase px-1.5 py-0.5 rounded"
                style={{
                  background: "rgba(0,212,255,0.1)",
                  color: "var(--cyan-accent)",
                  border: "1px solid rgba(0,212,255,0.2)",
                }}
              >
                {PLATFORM_LABEL[platform]}
              </span>
              <span
                className="text-[10px] font-display tracking-widest uppercase px-1.5 py-0.5 rounded"
                style={{
                  background: "rgba(0,212,255,0.06)",
                  color: "var(--cyan-accent)",
                  border: "1px solid rgba(0,212,255,0.15)",
                }}
              >
                {GAMEMODE_LABEL[gamemode]}
              </span>
            </div>
          </div>

          <ShareButton
            title={`owMMR — ${displayTag}`}
            text={shareText}
            url={shareUrl}
            className="shrink-0 mt-0.5"
          />
        </div>

        {/* Verdict block */}
        {!primaryMissing && (
          <div
            className="px-5 sm:px-6 py-3 text-center"
            style={{ borderTop: "1px solid var(--border-subtle)" }}
          >
            <Verdict delta={delta} smurfFlag={smurfFlag} size="md" />
            {mmr.primary && (
              <p className="font-mono text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
                MMR {mmr.primary.mmr} · {mmrToLabel(mmr.primary.mmr)}
              </p>
            )}
          </div>
        )}

        {primaryMissing && (
          <div
            className="px-5 sm:px-6 py-3 text-center"
            style={{ borderTop: "1px solid var(--border-subtle)" }}
          >
            <p className="font-display text-sm" style={{ color: "var(--text-secondary)" }}>
              No MMR estimate available — try a different platform/gamemode
            </p>
          </div>
        )}

        {/* Role mini-rows */}
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
            const sysColor = r.systemRank
              ? rankColor(r.systemRank.division)
              : "var(--text-tertiary)";

            return (
              <div
                key={role}
                className="flex flex-col items-center gap-1 px-2 py-3"
                style={{ background: "var(--surface-1)" }}
              >
                <div className="flex items-center gap-1">
                  <RoleIcon role={role} size={14} style={{ color: rColor }} />
                  <span
                    className="text-[10px] font-display tracking-widest uppercase"
                    style={{ color: rColor }}
                  >
                    {ROLE_SHORT[role]}
                  </span>
                </div>
                <span
                  className="text-[11px] font-display font-semibold"
                  style={{ color: actualColor }}
                >
                  {actualLabel}
                </span>
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

        {/* Wordmark row */}
        <div
          className="flex items-center justify-between px-5 py-2.5"
          style={{
            background: "rgba(0,0,0,0.3)",
            borderTop: "1px solid var(--border-subtle)",
          }}
        >
          <span className="font-display font-black text-sm" style={{ color: "var(--text-primary)" }}>
            ow<em style={{ fontStyle: "italic", color: "var(--cyan-accent)" }}>MMR</em>
          </span>
          <span className="font-mono text-[10px]" style={{ color: "var(--text-disabled)" }}>
            v{mmr.algorithmVersion}
          </span>
        </div>
      </div>
    </section>
  );
}
