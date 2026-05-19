import type { PrimaryMMR, Role } from "@/lib/algorithm/types";
import { roleLabel, confidenceLabel } from "@/lib/rank-utils";
import { mmrToLabel } from "@/lib/algorithm";

interface PrimaryMMRDisplayProps {
  primary: PrimaryMMR;
}

export function PrimaryMMRDisplay({ primary }: PrimaryMMRDisplayProps) {
  const conf = confidenceLabel(primary.confidence);
  const label = mmrToLabel(primary.mmr);

  return (
    <div className="text-center py-8">
      <p
        className="text-xs font-display tracking-[0.4em] uppercase mb-3"
        style={{ color: "var(--cyan-accent)" }}
      >
        Estimated MMR
      </p>

      {/* The big number */}
      <div className="relative inline-block">
        <p
          className="font-display font-black leading-none"
          style={{
            fontSize: "clamp(72px, 16vw, 128px)",
            letterSpacing: "-0.04em",
            color: "var(--text-primary)",
            textShadow: "0 0 40px rgba(0,212,255,0.2)",
          }}
        >
          {primary.mmr.toLocaleString()}
        </p>
      </div>

      {/* Rank label */}
      <p
        className="text-xl font-display font-semibold mt-1 tracking-wide"
        style={{ color: "var(--cyan-accent)" }}
      >
        {label}
      </p>

      {/* Confidence */}
      <p
        className="text-sm font-display mt-2 tracking-wide"
        style={{ color: conf.color }}
      >
        {conf.label}
        {primary.contributingRoles.length < 3 && (
          <span
            className="ml-2 text-xs"
            style={{ color: "var(--text-secondary)" }}
          >
            (based on {primary.contributingRoles.map(roleLabel).join(" + ")})
          </span>
        )}
      </p>
    </div>
  );
}

export function NoPrimaryMMR({ roles }: { roles: Role[] }) {
  const rankedRoles = roles.filter(Boolean);
  return (
    <div className="text-center py-8">
      <p
        className="text-xs font-display tracking-[0.4em] uppercase mb-3"
        style={{ color: "var(--orange-accent)" }}
      >
        Primary MMR
      </p>
      <p
        className="text-2xl font-display font-bold"
        style={{ color: "var(--text-primary)" }}
      >
        —
      </p>
      <p
        className="text-sm font-display mt-2"
        style={{ color: "var(--text-secondary)" }}
      >
        {rankedRoles.length === 0
          ? "No competitive rank found on this platform"
          : "Need ≥20 competitive games per role for primary estimate"}
      </p>
    </div>
  );
}
