import type { RoleMMRResult, Role, Gamemode } from "@/lib/algorithm/types";
import {
  rankColor,
  roleColor,
  roleLabel,
  confidenceLabel,
  divisionLabel,
  tierDelta,
} from "@/lib/rank-utils";
import { RankTile } from "@/components/mmr/rank-tile";
import { RoleIcon } from "@/components/mmr/role-icon";
import { HeroPortrait } from "@/components/mmr/hero-portrait";
import { ArrowUp, ArrowDown, Minus, Sparkles } from "lucide-react";

interface RoleCardProps {
  role: Role;
  result: RoleMMRResult;
  gamemode: Gamemode;
  showPlatformChip: boolean;
}

export function RoleCard({ role, result, gamemode, showPlatformChip }: RoleCardProps) {
  const rColor = roleColor(role);

  if (result.status === "unranked") {
    const reason =
      gamemode === "unranked"
        ? "No quickplay data this season"
        : gamemode === "both"
        ? "No data this season"
        : "Not ranked this season";

    return (
      <div
        className="rounded-lg flex flex-col overflow-hidden"
        style={{
          background: "var(--surface-1)",
          border: "1px dashed var(--border-subtle)",
        }}
      >
        <div style={{ height: 4, background: "var(--border-subtle)" }} />
        <div className="p-5 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <RoleIcon role={role} size={12} style={{ color: rColor, opacity: 0.5 }} />
            <p className="text-xs font-display tracking-widest uppercase" style={{ color: rColor, opacity: 0.5 }}>
              {roleLabel(role)}
            </p>
          </div>
          <p className="text-2xl font-display font-bold" style={{ color: "var(--text-tertiary)" }}>
            —
          </p>
          <p className="text-xs font-display" style={{ color: "var(--text-secondary)" }}>
            {reason}
          </p>
        </div>
      </div>
    );
  }

  const hasActualRank = !!result.division && result.tier != null;
  const sysRank = result.systemRank;
  const dLabel = hasActualRank
    ? `${divisionLabel(result.division!)} ${result.tier}`
    : "";
  const divColor = hasActualRank ? rankColor(result.division!) : "var(--text-tertiary)";

  let diff: number | null = null;
  if (hasActualRank && sysRank && result.status !== "insufficient_games") {
    diff = tierDelta(
      { division: sysRank.division, tier: sysRank.tier },
      { division: result.division!, tier: result.tier! }
    );
  }

  const modifierPositive = (result.modifier ?? 0) > 0;
  const modifierZero = (result.modifier ?? 0) === 0;
  const conf = result.status === "ranked" ? confidenceLabel(result.confidence) : null;
  const topHeroes = result.heroBreakdown?.slice(0, 3) ?? [];

  return (
    <div
      className="rounded-lg flex flex-col overflow-hidden transition-all duration-200"
      style={{
        background: "var(--surface-2)",
        border: `1px solid color-mix(in srgb, ${rColor} 20%, transparent)`,
        borderTop: `4px solid ${rColor}`,
        boxShadow: `0 0 24px color-mix(in srgb, ${rColor} 6%, transparent)`,
      }}
    >
      <div className="p-5 flex flex-col gap-4">
        {/* Region A — Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <RoleIcon role={role} size={13} style={{ color: rColor }} />
            <p className="text-xs font-display tracking-widest uppercase" style={{ color: rColor }}>
              {roleLabel(role)}
            </p>
            {showPlatformChip && result.resolvedPlatform && (
              <span
                className="text-[10px] font-display tracking-widest uppercase px-1.5 py-0.5 rounded"
                style={{
                  background: "rgba(0,212,255,0.08)",
                  color: "var(--cyan-accent)",
                  border: "1px solid rgba(0,212,255,0.2)",
                }}
              >
                {result.resolvedPlatform.toUpperCase()}
              </span>
            )}
          </div>
          {result.reason === "potential_smurf" && (
            <div className="flex items-center gap-1 shrink-0">
              <Sparkles style={{ width: 10, height: 10, color: "var(--orange-accent)" }} />
              <span
                className="text-[10px] font-display tracking-widest uppercase"
                style={{ color: "var(--orange-accent)" }}
              >
                SMURF?
              </span>
            </div>
          )}
        </div>

        {/* Region B — Twin chips */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
          {/* Your Rank */}
          <div className="flex flex-col items-center gap-1">
            <span
              className="text-[10px] font-display tracking-widest uppercase"
              style={{ color: "var(--text-tertiary)" }}
            >
              Your Rank
            </span>
            {hasActualRank && result.rankIcon ? (
              <img
                src={result.rankIcon}
                alt={dLabel}
                className="w-14 h-14"
                style={{ opacity: result.status === "insufficient_games" ? 0.6 : 1 }}
              />
            ) : hasActualRank ? (
              <div
                className="w-14 h-14 rounded flex items-center justify-center"
                style={{
                  background: "var(--surface-3)",
                  border: `1px solid color-mix(in srgb, ${divColor} 30%, transparent)`,
                  opacity: result.status === "insufficient_games" ? 0.6 : 1,
                }}
              >
                <span className="font-display font-black text-xl" style={{ color: divColor }}>
                  {result.tier}
                </span>
              </div>
            ) : (
              <div
                className="w-14 h-14 rounded flex items-center justify-center"
                style={{ background: "var(--surface-3)" }}
              >
                <span className="font-display font-black text-xl" style={{ color: "var(--text-tertiary)" }}>
                  —
                </span>
              </div>
            )}
            <span
              className="text-[11px] font-display font-semibold text-center"
              style={{ color: hasActualRank ? divColor : "var(--text-tertiary)" }}
            >
              {hasActualRank ? dLabel : "—"}
            </span>
          </div>

          {/* Delta arrow */}
          <div className="flex flex-col items-center gap-0.5">
            {diff === null || diff === 0 ? (
              <Minus
                style={{ width: 28, height: 28, color: "var(--text-tertiary)" }}
                strokeWidth={2.5}
              />
            ) : diff > 0 ? (
              <>
                <ArrowUp
                  style={{ width: 28, height: 28, color: "var(--cyan-accent)" }}
                  strokeWidth={2.5}
                />
                <span className="font-mono text-xs font-bold" style={{ color: "var(--cyan-accent)" }}>
                  +{diff}
                </span>
              </>
            ) : (
              <>
                <ArrowDown
                  style={{
                    width: 28,
                    height: 28,
                    color: "color-mix(in oklab, var(--role-damage) 70%, var(--text-secondary) 30%)",
                  }}
                  strokeWidth={2.5}
                />
                <span
                  className="font-mono text-xs font-bold"
                  style={{ color: "color-mix(in oklab, var(--role-damage) 70%, var(--text-secondary) 30%)" }}
                >
                  {diff}
                </span>
              </>
            )}
          </div>

          {/* System Rank */}
          <div className="flex flex-col items-center gap-1">
            <span
              className="text-[10px] font-display tracking-widest uppercase"
              style={{ color: "var(--cyan-accent)" }}
            >
              System Rank
            </span>
            {sysRank ? (
              <>
                <RankTile rank={sysRank} size={56} showModelIcon />
                <span
                  className="text-[11px] font-display font-semibold text-center"
                  style={{ color: rankColor(sysRank.division) }}
                >
                  {sysRank.label}
                </span>
              </>
            ) : (
              <>
                <div
                  className="w-14 h-14 rounded flex items-center justify-center"
                  style={{ background: "var(--surface-3)" }}
                >
                  <span className="font-display font-black text-xl" style={{ color: "var(--text-tertiary)" }}>
                    ?
                  </span>
                </div>
                <em className="text-[11px] font-display" style={{ color: "var(--text-tertiary)" }}>
                  no inferred rank
                </em>
              </>
            )}
          </div>
        </div>

        {/* Region C — Hero portrait strip */}
        {topHeroes.length > 0 && (
          <div
            className="flex gap-2.5 pt-3"
            style={{ borderTop: "1px solid var(--border-subtle)" }}
          >
            {topHeroes.map((hero) => (
              <div key={hero.hero} className="flex flex-col items-center gap-1">
                <div className="relative">
                  <HeroPortrait heroKey={hero.hero} role={role} size="sm" />
                  <span
                    className="absolute -bottom-0.5 -right-0.5 font-mono text-[8px] leading-none px-0.5 py-px rounded-sm"
                    style={{
                      background: "rgba(0,0,0,0.85)",
                      color: "var(--text-secondary)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    {hero.gamesPlayed}g
                  </span>
                </div>
                <span
                  className="font-mono text-[9px] leading-none"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {hero.kda.toFixed(1)} kda
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Region D — Details row */}
        <div
          className="flex items-center justify-between gap-2 pt-3"
          style={{ borderTop: "1px solid var(--border-subtle)" }}
        >
          {result.status === "insufficient_games" ? (
            <span className="font-mono text-xs" style={{ color: "var(--text-tertiary)" }}>
              Not enough games — showing rank only
            </span>
          ) : (
            <>
              <span className="font-mono text-xs shrink-0" style={{ color: "var(--text-tertiary)" }}>
                MMR {result.mmr.toLocaleString()}
              </span>
              <span
                className="font-mono text-xs font-bold px-1.5 py-0.5 rounded shrink-0"
                style={{
                  color: modifierZero
                    ? "var(--text-tertiary)"
                    : modifierPositive
                    ? "var(--role-support)"
                    : "color-mix(in oklab, var(--role-damage) 70%, var(--text-secondary) 30%)",
                  background: modifierZero
                    ? "transparent"
                    : modifierPositive
                    ? "rgba(91,245,160,0.1)"
                    : "rgba(245,91,91,0.08)",
                }}
              >
                {modifierZero ? "±0" : modifierPositive ? `+${result.modifier}` : result.modifier}
              </span>
              {conf && (
                <span
                  className="text-xs font-display tracking-wide px-2 py-0.5 rounded"
                  style={{
                    background: `color-mix(in srgb, ${conf.color} 15%, transparent)`,
                    color: conf.color,
                    border: `1px solid color-mix(in srgb, ${conf.color} 35%, transparent)`,
                  }}
                >
                  {conf.label}
                </span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
