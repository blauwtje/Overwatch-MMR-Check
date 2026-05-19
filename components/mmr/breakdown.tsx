"use client";

import { useState } from "react";
import type { MMREstimate, Role } from "@/lib/algorithm/types";
import { roleLabel, roleColor } from "@/lib/rank-utils";

interface BreakdownProps {
  mmr: MMREstimate;
}

export function AlgorithmBreakdown({ mmr }: BreakdownProps) {
  const [open, setOpen] = useState(false);
  const roles: Role[] = ["tank", "damage", "support"];

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ border: "1px solid var(--border-subtle)" }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left transition-all duration-150 hover:bg-white/[0.03]"
        style={{ background: "var(--surface-1)" }}
      >
        <div className="flex items-center gap-3">
          <span
            className="text-xs font-display tracking-widest uppercase"
            style={{ color: "var(--cyan-accent)" }}
          >
            Algorithm breakdown
          </span>
          <span
            className="text-xs font-display px-2 py-0.5 rounded"
            style={{
              background: "rgba(0,212,255,0.1)",
              color: "var(--cyan-accent)",
              border: "1px solid rgba(0,212,255,0.2)",
            }}
          >
            v{mmr.algorithmVersion}
          </span>
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

      {open && (
        <div className="px-5 pb-5 space-y-6" style={{ background: "var(--surface-1)" }}>
          <div
            className="pt-4 pb-2 text-xs font-display tracking-wide opacity-50"
            style={{ borderTop: "1px solid var(--border-subtle)" }}
          >
            Z-scores measure how far your stats deviate from average peers at your rank. The modifier
            applies log-scaled dampening based on games played.
          </div>

          {roles.map((role) => {
            const result = mmr.perRole[role];
            if (result.status !== "ranked" || !result.breakdown) return null;

            const bd = result.breakdown;
            const rColor = roleColor(role);

            return (
              <div key={role}>
                <p
                  className="text-xs font-display tracking-widest uppercase mb-3"
                  style={{ color: rColor }}
                >
                  {roleLabel(role)}
                </p>

                {/* Sample weight progress bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs font-display opacity-50 mb-1">
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
                      <p className="text-xs font-display opacity-40 mb-1">{label}</p>
                      <p
                        className="text-base font-display font-bold"
                        style={{
                          color:
                            value === 0
                              ? "rgba(255,255,255,0.3)"
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
                        <span className="text-xs font-display opacity-40 w-28 shrink-0 capitalize">
                          {stat.replace(/([A-Z])/g, " $1").toLowerCase()}
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
              </div>
            );
          })}

          <p className="text-xs opacity-30 font-display pt-2" style={{ borderTop: "1px solid var(--border-subtle)" }}>
            Peer baselines are seeded from community data and updated monthly. Estimates are not
            official Blizzard data.
          </p>
        </div>
      )}
    </div>
  );
}
