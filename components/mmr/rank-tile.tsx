import type { SystemRank } from "@/lib/algorithm/types";
import { rankColor } from "@/lib/rank-utils";
import { Cpu, Crown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface RankTileProps {
  rank: SystemRank;
  size: number;
  showModelIcon?: boolean;
  className?: string;
}

export function RankTile({ rank, size, showModelIcon = false, className }: RankTileProps) {
  const color = rankColor(rank.division);
  const fontSize = Math.round(size * 0.55);
  const iconSize = Math.round(fontSize * 0.7);
  const isChampion = rank.label === "Champion";
  const isTop500 = rank.label === "Top 500";

  return (
    <div
      className={cn("relative flex items-center justify-center rounded-md shrink-0", className)}
      style={{
        width: size,
        height: size,
        background: `color-mix(in srgb, ${color} 12%, transparent)`,
        border: `1px solid color-mix(in srgb, ${color} 50%, transparent)`,
        boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${color} 25%, transparent)`,
      }}
    >
      {isChampion ? (
        <Crown style={{ width: iconSize, height: iconSize, color }} />
      ) : isTop500 ? (
        <Sparkles style={{ width: iconSize, height: iconSize, color }} />
      ) : (
        <span
          className="font-display font-black leading-none select-none"
          style={{ fontSize, color }}
        >
          {rank.tier}
        </span>
      )}
      {showModelIcon && (
        <div className="absolute top-0.5 right-0.5 pointer-events-none">
          <Cpu style={{ width: 12, height: 12, color: "var(--cyan-accent)", opacity: 0.6 }} />
        </div>
      )}
    </div>
  );
}
