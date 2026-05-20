"use client";

import { useState, memo } from "react";
import type { MMREstimate, Role, Gamemode } from "@/lib/algorithm/types";
import { roleLabel, roleColor } from "@/lib/rank-utils";
import { RoleRadar } from "@/components/mmr/role-radar";

interface BreakdownProps {
  mmr: MMREstimate;
  gamemode: Gamemode;
}

const ZSCORE_LABELS: Record<string, string> = {
  winrate: "Win rate",
  kda: "KDA",
  avgDeaths: "Avg deaths",
  avgDamage: "Avg damage",
  avgHealing: "Avg healing",
  topHeroKda: "Top hero KDA",
};

const BreakdownHeader = memo(function BreakdownHeader({ algorithmVersion }: { algorithmVersion: string }) {
  return (
    <>
      <span
        className="text-xs font-display tracking-widest uppercase"
        style={{ color: "var(--cyan-accent)" }}
      >
        Algorithm breakdown
      </span>
      <span
        className="text-xs font-display px-2 py-0.5 rounded"
        style={{
          background: "rgba(0,212,255,0.18)",
          color: "var(--cyan-accent)",
          border: "1px solid rgba(0,212,255,0.2)",
        }}
      >
        v{algorithmVersion}
      </span>
    </>
  );
});

export const AlgorithmBreakdown = memo(function AlgorithmBreakdown({ mmr }: BreakdownProps) {
  const [open, setOpen] = useState(false);
  const roles: Role[] = ["tank", "damage", "support"];

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ border: "1px solid var(--border-subtle)" }}
    >
      {/* Toggle button — mobile only */}
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden w-full flex items-center justify-between px-5 py-4 text-left transition-all duration-150 hover:bg-white/[0.03]"
        style={{ background: "var(--surface-1)" }}
      >
        <div className="flex items-center gap-3">
          <BreakdownHeader algorithmVersion={mmr.algorithmVersion} />
        </div>
        <span
          className="text-lg transition-transform duration-200 font-display"
          style={{
            color: "var(--cyan-accent)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            display: "inline-block",
          }}
        >
          ↓
        </span>
      </button>

      {/* Desktop-always-visible header */}
      <div
        className="hidden lg:flex items-center gap-3 px-5 py-4"
        style={{ background: "var(--surface-1)", borderBottom: "1px solid var(--border-subtle)" }}
      >
        <BreakdownHeader algorithmVersion={mmr.algorithmVersion} />
      </div>

      {/* Content — mobile: accordion; desktop: always open */}
      <div
        className={`${open ? "" : "hidden"} lg:block`}
        style={{ background: "var(--surface-1)" }}
      >
        {/* Description */}
        <div
          className="px-5 pt-4 pb-2 text-xs font-display tracking-wide"
          style={{ borderTop: "1px solid var(--border-subtle)", color: "var(--text-secondary)" }}
        >
          Z-scores measure how far your stats deviate from average peers at your rank. The modifier
          applies log-scaled dampening based on games played.
        </div>

        {/* Role columns — stack on mobile, three-col on desktop */}
        <div className="px-5 pb-5 grid grid-cols-1 lg:grid-cols-3 lg:gap-8 space-y-6 lg:space-y-0">
          {roles.map((role) => {
            const result = mmr.perRole[role];
            if (result.status !== "ranked" || !result.breakdown) return null;

            const bd = result.breakdown;
            const rColor = roleColor(role);
            const hasQPCaveat = result.source !== "ranked";
            const showSampleSizes =
              result.competitiveGames !== undefined || result.quickplayGames !== undefined;

            return (
              <div key={role} className="pt-4 lg:pt-0">
                <p
                  className="text-xs font-display tracking-widest uppercase mb-3"
                  style={{ color: rColor }}
                >
                  {roleLabel(role)}
                </p>

                {/* Sample sizes (blended mode) */}
                {showSampleSizes && (
                  <p
                    className="text-xs font-display mb-2"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    {result.competitiveGames !== undefined && `Comp: ${result.competitiveGames}g`}
                    {result.competitiveGames !== undefined && result.quickplayGames !== undefined && " · "}
                    {result.quickplayGames !== undefined && `QP: ${result.quickplayGames}g`}
                  </p>
                )}

                {/* Sample weight progress bar */}
                <div className="mb-3">
                  <div
                    className="flex justify-between text-xs font-display mb-1"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <span>Sample confidence</span>
                    <span>{Math.round(bd.sampleWeight * 100)}%</span>
                  </div>
                  <div
                    className="h-1.5 rounded-full overflow-hidden"
                    style={{ background: "var(--surface-3)" }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${bd.sampleWeight * 100}%`,
                        background: `linear-gradient(90deg, ${rColor} 0%, var(--cyan-accent) 100%)`,
                      }}
                    />
                  </div>
                </div>

                {/* Role radar chart */}
                <div className="mb-3">
                  <RoleRadar zScores={bd.zScores} roleColor={rColor} size={220} />
                </div>

                {/* Modifier breakdown */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    { label: "Win Rate", value: bd.winRateMod },
                    { label: "KDA", value: bd.kdaMod },
                    { label: "Role Stats", value: bd.roleMod },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="rounded p-2 text-center"
                      style={{ background: "var(--surface-2)" }}
                    >
                      <p
                        className="text-xs font-display mb-1"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {label}
                      </p>
                      <p
                        className="text-base font-display font-bold"
                        style={{
                          color:
                            value === 0
                              ? "var(--text-tertiary)"
                              : value > 0
                              ? "var(--role-support)"
                              : "var(--role-damage)",
                        }}
                      >
                        {value > 0 ? `+${value}` : value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Z-scores table */}
                <div className="space-y-1">
                  {Object.entries(bd.zScores).map(([stat, z]) => {
                    const pct = Math.min(100, Math.abs(z) * 30 + 50);
                    const isPositive = z >= 0;
                    return (
                      <div key={stat} className="flex items-center gap-3">
                        <span
                          className="text-xs font-display w-28 shrink-0 capitalize"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {ZSCORE_LABELS[stat] ?? stat.replace(/([A-Z])/g, " $1").toLowerCase()}
                        </span>
                        <div
                          className="flex-1 h-1 rounded-full overflow-hidden"
                          style={{ background: "var(--surface-3)" }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${pct}%`,
                              background: isPositive ? "var(--role-support)" : "var(--role-damage)",
                              opacity: 0.6,
                            }}
                          />
                        </div>
                        <span
                          className="text-xs font-display w-12 text-right"
                          style={{
                            color: isPositive ? "var(--role-support)" : "var(--role-damage)",
                          }}
                        >
                          {z > 0 ? "+" : ""}
                          {z.toFixed(2)}σ
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* QP/Comp caveat */}
                {hasQPCaveat && (
                  <p
                    className="text-xs font-display mt-2"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    Quickplay performance compared against competitive peer baselines — interpret with caution.
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <p
          className="px-5 pb-5 text-xs font-display"
          style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "0.75rem", color: "var(--text-disabled)" }}
        >
          Peer baselines are seeded from community data and updated monthly. Estimates are not
          official Blizzard data.
        </p>
      </div>
    </div>
  );
});
