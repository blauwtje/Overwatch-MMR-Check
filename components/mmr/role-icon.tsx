import type { CSSProperties } from "react";
import type { Role } from "@/lib/algorithm/types";

interface RoleIconProps {
  role: Role;
  size?: number;
  className?: string;
  style?: CSSProperties;
}

export function RoleIcon({ role, size = 24, className, style }: RoleIconProps) {
  const shared = {
    width: size,
    height: size,
    fill: "none" as const,
    stroke: "currentColor" as const,
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    style,
  };

  if (role === "tank") {
    return (
      <svg viewBox="0 0 24 24" {...shared}>
        <path d="M4 3 L20 3 L20 13 Q20 18 12 21 Q4 18 4 13 Z" />
      </svg>
    );
  }
  if (role === "damage") {
    return (
      <svg viewBox="0 0 24 24" {...shared}>
        <circle cx="12" cy="12" r="7" />
        <circle cx="12" cy="12" r="2" />
        <line x1="12" y1="2" x2="12" y2="5" />
        <line x1="12" y1="19" x2="12" y2="22" />
        <line x1="2" y1="12" x2="5" y2="12" />
        <line x1="19" y1="12" x2="22" y2="12" />
      </svg>
    );
  }
  // support
  return (
    <svg viewBox="0 0 24 24" {...shared}>
      <rect x="10" y="3" width="4" height="18" rx="2" />
      <rect x="3" y="10" width="18" height="4" rx="2" />
    </svg>
  );
}
