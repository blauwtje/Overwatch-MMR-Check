import type {
  RoleMMRResult,
  Role,
  Gamemode,
  CompetitiveDivision,
} from "@/lib/algorithm/types";
import { rankColor, roleColor, roleLabel, confidenceLabel, divisionLabel } from "@/lib/rank-utils";

interface RoleCardProps {
  role: Role;
  result: RoleMMRResult;
  gamemode: Gamemode;
  showPlatformChip: boolean;
}

function compareDivisionTier(
  a: { division: CompetitiveDivision; tier: number },
  b: { division: CompetitiveDivision; tier: number }
): number {
  const order: CompetitiveDivision[] = [
    "bronze",
    "silver",
    "gold",
    "platinum",
    "diamond",
    "master",
    "grandmaster",
    "ultimate",
  ];
  const ai = order.indexOf(a.division);
  const bi = order.indexOf(b.division);
  if (ai !== bi) return ai - bi;
  // tier 1 is highest, tier 5 is lowest
  return b.tier - a.tier;
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
        className="rounded-lg p-5 flex flex-col gap-2"
        style={{
          background: "var(--surface-1)",
          border: "1px dashed var(--border-subtle)",
        }}
      >
        <p className="text-xs font-display tracking-widest uppercase" style={{ color: rColor }}>
          {roleLabel(role)}
        </p>
        <p
          className="text-2xl font-display font-bold"
          style={{ color: "var(--text-tertiary)" }}
        >
          —
        </p>
        <p
          className="text-xs font-display"
          style={{ color: "var(--text-secondary)" }}
        >
          {reason}
        </p>
      </div>
    );
  }

  // For ranked + insufficient_games and ranked statuses we share most structure
  const dLabel = result.division ? `${divisionLabel(result.division)} ${result.tier}` : "";
  const divColor = result.division ? rankColor(result.division) : "var(--text-primary)";
  const hasActualRank = !!result.division && result.tier != null;
  const sysRank = result.systemRank;

  // System vs Actual comparison
  let comparison: { arrow: "↑" | "↓" | "="; color: string } | null = null;
  if (hasActualRank && sysRank) {
    const cmp = compareDivisionTier(
      { division: sysRank.division, tier: sysRank.tier },
      { division: result.division!, tier: result.tier! }
    );
    if (cmp > 0) comparison = { arrow: "↑", color: rColor };
    else if (cmp < 0) comparison = { arrow: "↓", color: "var(--orange-accent)" };
    else comparison = { arrow: "=", color: "var(--text-tertiary)" };
  }

  if (result.status === "insufficient_games") {
    return (
      <div
        className="rounded-lg p-5 flex flex-col gap-2"
        style={{
          background: "var(--surface-2)",
          border: `1px solid ${rColor}22`,
        }}
      >
        <RoleHeader
          role={role}
          rColor={rColor}
          resolvedPlatform={result.resolvedPlatform}
          showPlatformChip={showPlatformChip}
        />
        {result.rankIcon && (
          <img src={result.rankIcon} alt={dLabel} className="w-12 h-12 opacity-80" />
        )}
        {hasActualRank ? (
          <p
            className="text-xs font-display tracking-wide"
            style={{ color: divColor }}
          >
            {dLabel}
          </p>
        ) : sysRank ? (
          <p
            className="text-xs font-display tracking-wide"
            style={{ color: rankColor(sysRank.division) }}
          >
            System: {sysRank.label}
          </p>
        ) : null}
        <p
          className="text-lg font-display font-bold"
          style={{ color: "var(--text-secondary)" }}
        >
          {result.mmr.toLocaleString()}
        </p>
        <p
          className="text-xs font-display"
          style={{ color: "var(--orange-accent)" }}
        >
          Rank-only estimate · Too few games
        </p>
      </div>
    );
  }

  // status === "ranked"
  const conf = confidenceLabel(result.confidence);
  const modifierPositive = (result.modifier ?? 0) > 0;
  const modifierZero = (result.modifier ?? 0) === 0;

  const baselineCopy =
    result.source === "unranked"
      ? "Inferred from quickplay — no Blizzard rank"
      : result.source === "blended"
      ? "vs rank baseline · blended QP+Comp"
      : "vs rank baseline";

  return (
    <div
      className="rounded-lg p-5 flex flex-col gap-3 transition-all duration-200"
      style={{
        background: "var(--surface-2)",
        border: `1px solid ${rColor}33`,
        boxShadow: `0 0 20px ${rColor}0a`,
      }}
    >
      <RoleHeader
        role={role}
        rColor={rColor}
        resolvedPlatform={result.resolvedPlatform}
        showPlatformChip={showPlatformChip}
      />

      {/* Rank icon + label(s) */}
      <div className="flex items-center gap-3">
        {result.rankIcon && (
          <img src={result.rankIcon} alt={dLabel} className="w-10 h-10 shrink-0" />
        )}
        <div className="flex flex-col">
          {hasActualRank && (
            <p
              className="text-sm font-display font-semibold tracking-wide"
              style={{ color: divColor }}
            >
              {dLabel}
            </p>
          )}
          {sysRank && (
            <p
              className="text-xs font-display tracking-wide flex items-center gap-1"
              style={{ color: hasActualRank ? "var(--text-secondary)" : rankColor(sysRank.division) }}
            >
              {hasActualRank ? "System: " : ""}
              <span style={{ color: rankColor(sysRank.division), fontWeight: 600 }}>
                {sysRank.label}
              </span>
              {comparison && (
                <span
                  className="ml-0.5 font-bold"
                  style={{ color: comparison.color }}
                  aria-label={
                    comparison.arrow === "↑"
                      ? "Overperforming"
                      : comparison.arrow === "↓"
                      ? "Underperforming"
                      : "Matches rank"
                  }
                >
                  {comparison.arrow}
                </span>
              )}
            </p>
          )}
        </div>
      </div>

      {/* MMR number */}
      <div>
        <p
          className="text-4xl font-display font-black leading-none"
          style={{ letterSpacing: "-0.02em", color: "var(--text-primary)" }}
        >
          {result.mmr.toLocaleString()}
        </p>
        {/* Modifier */}
        <p
          className="text-sm font-display mt-1 font-semibold"
          style={{
            color: modifierZero
              ? "var(--text-tertiary)"
              : modifierPositive
              ? "var(--role-support)"
              : "var(--role-damage)",
          }}
        >
          {modifierZero ? "±0" : modifierPositive ? `+${result.modifier}` : result.modifier}
          <span
            className="text-xs font-normal ml-1"
            style={{ color: "var(--text-tertiary)" }}
          >
            {baselineCopy}
          </span>
        </p>
      </div>

      {/* Confidence + smurf flag */}
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="text-xs font-display tracking-wide px-2 py-0.5 rounded"
          style={{
            background: `${conf.color}40`,
            color: conf.color,
            border: `1px solid ${conf.color}55`,
          }}
        >
          {conf.label}
        </span>
        {result.reason === "potential_smurf" && (
          <span
            className="text-xs font-display tracking-wide px-2 py-0.5 rounded"
            style={{
              background: "rgba(255,124,42,0.15)",
              color: "var(--orange-accent)",
              border: "1px solid rgba(255,124,42,0.35)",
            }}
          >
            ⚠ New / smurf?
          </span>
        )}
      </div>
    </div>
  );
}

function RoleHeader({
  role,
  rColor,
  resolvedPlatform,
  showPlatformChip,
}: {
  role: Role;
  rColor: string;
  resolvedPlatform?: "pc" | "console";
  showPlatformChip: boolean;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <p
        className="text-xs font-display tracking-widest uppercase"
        style={{ color: rColor }}
      >
        {roleLabel(role)}
      </p>
      {showPlatformChip && resolvedPlatform && (
        <span
          className="text-[10px] font-display tracking-widest uppercase px-1.5 py-0.5 rounded"
          style={{
            background: "rgba(0,212,255,0.08)",
            color: "var(--cyan-accent)",
            border: "1px solid rgba(0,212,255,0.2)",
          }}
        >
          · {resolvedPlatform.toUpperCase()}
        </span>
      )}
    </div>
  );
}
