"use client";

import { useState } from "react";
import type { Role } from "@/lib/algorithm/types";

const SIZE_PX = { sm: 40, md: 56, lg: 80 } as const;
type HeroSize = keyof typeof SIZE_PX;

const ROLE_COLORS: Record<Role, string> = {
  tank: "#5b9ef5",
  damage: "#f55b5b",
  support: "#5bf5a0",
};

interface HeroPortraitProps {
  heroKey: string;
  role: Role;
  size?: HeroSize;
  className?: string;
}

export function HeroPortrait({ heroKey, role, size = "md", className }: HeroPortraitProps) {
  const [imgError, setImgError] = useState(false);
  const px = SIZE_PX[size];
  const color = ROLE_COLORS[role];

  if (!imgError) {
    return (
      <img
        src={`/heroes/${heroKey}.webp`}
        alt={heroKey}
        width={px}
        height={px}
        onError={() => setImgError(true)}
        className={className}
        style={{ width: px, height: px, objectFit: "cover", borderRadius: 4 }}
      />
    );
  }

  return (
    <div
      className={className}
      style={{
        width: px,
        height: px,
        borderRadius: 4,
        background: `linear-gradient(160deg, color-mix(in srgb, ${color} 10%, transparent), color-mix(in srgb, ${color} 22%, transparent))`,
        border: `1px solid color-mix(in srgb, ${color} 28%, transparent)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        style={{ width: px * 0.55, height: px * 0.55, color, opacity: 0.35 }}
      >
        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
      </svg>
    </div>
  );
}
