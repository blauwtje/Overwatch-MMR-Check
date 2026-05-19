import type { PrimaryMMR, MMREstimate, Role } from "@/lib/algorithm/types";
import { rankColor, roleLabel, confidenceLabel, aggregateTierDelta } from "@/lib/rank-utils";
import { mmrToRank } from "@/lib/algorithm";
import { RankTile } from "@/components/mmr/rank-tile";
import { Verdict } from "@/components/mmr/verdict";

const ROLES: Role[] = ["tank", "damage", "support"];

interface PrimaryMMRDisplayProps {
  primary: PrimaryMMR;
  mmr: MMREstimate;
}

export function PrimaryMMRDisplay({ primary, mmr }: PrimaryMMRDisplayProps) {
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

  const systemRank = mmrToRank(primary.mmr);
  const conf = confidenceLabel(primary.confidence);
  const rColor = rankColor(systemRank.division);

  return (
    <div className="text-center py-8 px-4 flex flex-col items-center gap-4">
      <p
        className="text-xs font-display tracking-[0.4em] uppercase"
        style={{ color: "var(--cyan-accent)" }}
      >
        System Rank
      </p>

      <div className="flex flex-col items-center gap-3">
        <RankTile rank={systemRank} size={128} showModelIcon={false} />
        <p
          className="font-display font-black leading-none"
          style={{
            fontSize: "clamp(48px, 11vw, 88px)",
            letterSpacing: "-0.03em",
            color: rColor,
            textShadow: `0 0 40px color-mix(in srgb, ${rColor} 25%, transparent)`,
          }}
        >
          {systemRank.label.toUpperCase()}
        </p>
      </div>

      <Verdict delta={delta} smurfFlag={smurfFlag} size="lg" className="mb-4" />

      <p className="font-mono text-sm" style={{ color: "var(--text-tertiary)" }}>
        MMR {primary.mmr}
        <span className="mx-1">·</span>
        <span style={{ color: conf.color }}>{conf.label.toLowerCase()}</span>
        {primary.contributingRoles.length < 3 && (
          <span>{" "}· based on {primary.contributingRoles.map(roleLabel).join(" + ")}</span>
        )}
      </p>
    </div>
  );
}

export function NoPrimaryMMR({ roles }: { roles: Role[] }) {
  const hasRoles = roles.filter(Boolean).length > 0;
  return (
    <div className="text-center py-8 px-4 flex flex-col items-center gap-3">
      <p
        className="text-xs font-display tracking-[0.4em] uppercase"
        style={{ color: "var(--orange-accent)" }}
      >
        Insufficient Sample
      </p>
      <p
        className="font-display font-black"
        style={{ fontSize: "clamp(48px, 11vw, 88px)", letterSpacing: "-0.03em", color: "var(--text-primary)" }}
      >
        —
      </p>
      <p className="text-sm font-display" style={{ color: "var(--text-secondary)" }}>
        {!hasRoles
          ? "No competitive rank found on this platform"
          : "Not enough games — showing rank only"}
      </p>
    </div>
  );
}
