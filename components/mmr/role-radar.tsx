// Server component — no "use client".
// Pure SVG radar chart compatible with both the live DOM and satori (@vercel/og).
// No DOM APIs, no client hooks, all colors via props as literal hex/rgba strings.

interface RoleRadarProps {
  zScores: Record<string, number>;
  roleColor: string; // hex or rgba literal, e.g. "#5b9ef5"
  size?: number;     // default 220
}

const LABEL_MAP: Record<string, string> = {
  winrate: "Win%",
  kda: "KDA",
  topHeroKda: "Top KDA",
  avgDeaths: "Deaths",
  avgDamage: "Damage",
  avgHealing: "Healing",
};

/** Clamp a value to [-3, 3]. */
function clamp3(v: number): number {
  return Math.max(-3, Math.min(3, v));
}

/**
 * Map a clamped z-score [-3, 3] to a radius in [0, outerRadius].
 * z = -3 → 0 (center), z = 3 → outerRadius.
 */
function zToRadius(z: number, outerRadius: number): number {
  return ((clamp3(z) + 3) / 6) * outerRadius;
}

/** Cartesian point from polar coordinates. */
function polar(cx: number, cy: number, r: number, angle: number): [number, number] {
  return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
}

export function RoleRadar({ zScores, roleColor, size = 220 }: RoleRadarProps) {
  const cx = size / 2;
  const cy = size / 2;
  // 0.32 keeps labels (outerRadius + 8) well within the viewBox on lateral axes
  const outerRadius = size * 0.32;

  // Determine axis key order: winrate, kda-or-topHeroKda, avgDeaths, avgDamage, avgHealing
  const kdaKey = "topHeroKda" in zScores ? "topHeroKda" : "kda";
  const axisKeys = ["winrate", kdaKey, "avgDeaths", "avgDamage", "avgHealing"];
  const N = axisKeys.length;

  // Compute angle for each axis: -π/2 + (2π * i / N)
  const angles = axisKeys.map((_, i) => -Math.PI / 2 + (2 * Math.PI * i) / N);

  // Data polygon points
  const dataPoints = axisKeys.map((key, i) => {
    const z = zScores[key] ?? 0;
    const r = zToRadius(z, outerRadius);
    return polar(cx, cy, r, angles[i]);
  });
  const polygonPath = dataPoints
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`)
    .join(" ") + " Z";

  // Inner ring sits at zToRadius(0) = outerRadius/2, i.e. the z=0 (mean) line
  const halfRadius = outerRadius / 2;

  // Axis line endpoints
  const axisEndpoints = angles.map((angle) => polar(cx, cy, outerRadius, angle));

  // Label positions: slightly beyond the outer ring in the axis direction
  const LABEL_OFFSET = 8;
  const labelPositions = angles.map((angle) =>
    polar(cx, cy, outerRadius + LABEL_OFFSET, angle)
  );

  // Text anchor logic: right side → "start", left side → "end", top/bottom → "middle"
  function textAnchor(angle: number): "start" | "middle" | "end" {
    const cos = Math.cos(angle);
    if (cos > 0.1) return "start";
    if (cos < -0.1) return "end";
    return "middle";
  }

  // Dominant baseline for satori compat: approximate with dy offset instead
  // For labels above center (sin < 0), shift up a bit; below center, shift down
  function labelDy(angle: number): number {
    const sin = Math.sin(angle);
    if (sin < -0.1) return -2; // above center
    if (sin > 0.1) return 9;   // below center — push below the point
    return 4;                   // middle height
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Grid ring — half radius */}
      <circle
        cx={cx}
        cy={cy}
        r={halfRadius}
        fill="none"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth={0.75}
      />
      {/* Grid ring — full outer radius */}
      <circle
        cx={cx}
        cy={cy}
        r={outerRadius}
        fill="none"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth={0.75}
      />

      {/* Axis lines from center to outer ring */}
      {axisEndpoints.map(([ex, ey], i) => (
        <line
          key={`axis-${i}`}
          x1={cx}
          y1={cy}
          x2={ex.toFixed(2)}
          y2={ey.toFixed(2)}
          stroke="rgba(255,255,255,0.14)"
          strokeWidth={0.75}
        />
      ))}

      {/* Filled polygon */}
      <path
        d={polygonPath}
        fill={roleColor}
        fillOpacity={0.3}
        stroke="none"
      />

      {/* Stroke polygon */}
      <path
        d={polygonPath}
        fill="none"
        stroke={roleColor}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />

      {/* Axis labels */}
      {axisKeys.map((key, i) => {
        const [lx, ly] = labelPositions[i];
        const anchor = textAnchor(angles[i]);
        const dy = labelDy(angles[i]);
        return (
          <text
            key={`label-${i}`}
            x={lx.toFixed(2)}
            y={(ly + dy).toFixed(2)}
            textAnchor={anchor}
            fill="#f5f5f7"
            style={{ fontSize: 9, fontFamily: "Barlow Condensed, sans-serif" }}
          >
            {LABEL_MAP[key] ?? key}
          </text>
        );
      })}
    </svg>
  );
}
