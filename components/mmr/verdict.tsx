import { verdictFor } from "@/lib/rank-utils";
import { cn } from "@/lib/utils";

interface VerdictProps {
  delta: number | null;
  smurfFlag: boolean;
  size?: "lg" | "md";
  className?: string;
}

const GLOW_COLORS: Partial<Record<string, string>> = {
  above: "rgba(0,212,255,0.25)",
  smurf: "rgba(255,124,42,0.25)",
};

export function Verdict({ delta, smurfFlag, size = "md", className }: VerdictProps) {
  const binding = verdictFor(delta, smurfFlag);
  const isLarge = size === "lg";
  const glowColor = isLarge ? GLOW_COLORS[binding.tone] : undefined;

  return (
    <p
      className={cn(
        "font-display font-black uppercase tracking-[0.05em]",
        isLarge ? "text-2xl sm:text-3xl" : "text-xl",
        className
      )}
      style={{
        color: binding.color,
        textShadow: glowColor ? `0 0 24px ${glowColor}` : undefined,
      }}
    >
      {binding.text}
    </p>
  );
}
