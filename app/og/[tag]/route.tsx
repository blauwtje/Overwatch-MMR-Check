export const runtime = "nodejs";

import { ImageResponse } from "@vercel/og";
import { headers } from "next/headers";
import fs from "node:fs";
import path from "node:path";

// Module-level font cache — read once per cold start, not per request
let _fontCache: Promise<[Buffer, Buffer]> | null = null;
function getFonts(): Promise<[Buffer, Buffer]> {
  const fontDir = path.join(process.cwd(), "app/fonts");
  return (_fontCache ??= Promise.all([
    fs.promises.readFile(path.join(fontDir, "barlow-condensed-700.woff2")),
    fs.promises.readFile(path.join(fontDir, "barlow-condensed-900.woff2")),
  ]));
}
import { fetchPlayerData } from "@/lib/fetch-player";
import {
  verdictFor,
  divisionLabel,
  tierDelta,
  aggregateTierDelta,
} from "@/lib/rank-utils";
import { mmrToLabel, ALGORITHM_VERSION } from "@/lib/algorithm";
import { THEME } from "@/lib/og/theme";
import { rankColorHex, roleTint, MUTED_DAMAGE_COLOR } from "@/lib/og/precompute";
import { RoleRadar } from "@/components/mmr/role-radar";
import type { Role } from "@/lib/algorithm/types";

const ROLES: Role[] = ["tank", "damage", "support"];
const ROLE_LABEL: Record<Role, string> = { tank: "TANK", damage: "DPS", support: "SUP" };

function verdictColorFromTone(tone: string): string {
  if (tone === "above") return THEME.cyanAccent;
  if (tone === "smurf") return THEME.rankGrandmaster;
  if (tone === "neutral") return THEME.textSecondary;
  if (tone === "below") return MUTED_DAMAGE_COLOR;
  return THEME.textTertiary; // unknown
}

function parsePlatform(raw: string | undefined) {
  if (raw === "console" || raw === "mixed" || raw === "pc") return raw;
  return "pc" as const;
}

function parseGamemode(raw: string | undefined) {
  if (raw === "unranked" || raw === "both" || raw === "ranked") return raw;
  return "ranked" as const;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ tag: string }> }
) {
  const { tag } = await params;
  const url = new URL(_req.url);
  const platform = parsePlatform(url.searchParams.get("platform") ?? undefined);
  const gamemode = parseGamemode(url.searchParams.get("gamemode") ?? undefined);

  const h = await headers();
  const host = h.get("host") ?? "owmmr.app";
  const proto = h.get("x-forwarded-proto") ?? "https";

  const [font700, font900] = await getFonts();

  const opts = {
    width: 1200,
    height: 630,
    fonts: [
      { name: "Barlow Condensed", data: font700.buffer as ArrayBuffer, weight: 700 as const, style: "normal" as const },
      { name: "Barlow Condensed", data: font900.buffer as ArrayBuffer, weight: 900 as const, style: "normal" as const },
    ],
  };

  // Fallback builder
  function fallbackResponse() {
    const fallbackJsx = (
      <div
        style={{
          display: "flex",
          width: 1200,
          height: 630,
          background: THEME.surface1,
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Barlow Condensed",
        }}
      >
        <span style={{ color: THEME.textSecondary, fontSize: 36, fontWeight: 700 }}>
          Profile unavailable
        </span>
      </div>
    );
    const img = new ImageResponse(fallbackJsx, opts);
    return new Response(img.body, {
      headers: {
        ...Object.fromEntries(img.headers.entries()),
        "Cache-Control": "public, max-age=60, s-maxage=60",
      },
    });
  }

  let data;
  try {
    data = await fetchPlayerData(tag, platform, gamemode);
  } catch {
    return fallbackResponse();
  }

  if (data.status !== "ok") {
    return fallbackResponse();
  }

  const mmr = data.mmr;

  // Verdict
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
  const binding = verdictFor(delta, smurfFlag);
  const verdictColor = verdictColorFromTone(binding.tone);

  // Featured hero
  const allHeroes = ROLES.flatMap((role) =>
    (mmr.perRole[role].heroBreakdown ?? []).map((h) => ({ ...h, role }))
  );
  allHeroes.sort((a, b) => b.timePlayedSec - a.timePlayedSec);
  const featuredHero = allHeroes[0] ?? null;

  const displayTag = tag.replace(/-(?=\d{4,8}$)/, "#");
  const heroImgUrl = featuredHero
    ? `${proto}://${host}/heroes/${featuredHero.hero}.webp`
    : null;

  const PLATFORM_LABEL: Record<string, string> = { pc: "PC", console: "CONSOLE", mixed: "MIXED" };
  const GAMEMODE_LABEL: Record<string, string> = { ranked: "RANKED", unranked: "UNRANKED", both: "BOTH" };

  const jsx = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: 1200,
        height: 630,
        background: THEME.surface1,
        fontFamily: "Barlow Condensed",
        position: "relative",
        borderTop: `3px solid ${THEME.cyanAccent}`,
        overflow: "hidden",
      }}
    >
      {/* Radial glow top-left */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 1200,
          height: 630,
          background: "radial-gradient(ellipse at 0% 0%, rgba(0,212,255,0.07) 0%, transparent 55%)",
        }}
      />

      {/* Featured hero portrait */}
      {heroImgUrl && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            width: 480, // 40% of 1200
            height: 630,
            display: "flex",
            overflow: "hidden",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImgUrl}
            alt=""
            style={{
              width: 480,
              height: 630,
              objectFit: "cover",
              objectPosition: "top center",
              opacity: 0.1,
            }}
          />
        </div>
      )}

      {/* Content layer */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: 1200,
          height: 630,
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            padding: "14px 28px",
            height: 54,
          }}
        >
          {/* Wordmark */}
          <span
            style={{
              fontFamily: "Barlow Condensed",
              fontWeight: 900,
              fontSize: 20,
              color: THEME.textPrimary,
              letterSpacing: "-0.01em",
            }}
          >
            ow
            <span style={{ color: THEME.cyanAccent, fontStyle: "italic" }}>MMR</span>
          </span>

          {/* Separator */}
          <span style={{ color: THEME.textDisabled, fontSize: 16 }}>·</span>

          {/* Player tag */}
          <span
            style={{
              fontFamily: "Barlow Condensed",
              fontWeight: 900,
              fontSize: 22,
              color: THEME.textPrimary,
              letterSpacing: "-0.01em",
            }}
          >
            {displayTag}
          </span>

          {/* Platform chip */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "2px 8px",
              borderRadius: 4,
              background: "rgba(0,212,255,0.1)",
              border: "1px solid rgba(0,212,255,0.2)",
            }}
          >
            <span
              style={{
                fontFamily: "Barlow Condensed",
                fontWeight: 700,
                fontSize: 11,
                color: THEME.cyanAccent,
                letterSpacing: "0.12em",
              }}
            >
              {PLATFORM_LABEL[platform]}
            </span>
          </div>

          {/* Gamemode chip */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "2px 8px",
              borderRadius: 4,
              background: "rgba(0,212,255,0.06)",
              border: "1px solid rgba(0,212,255,0.15)",
            }}
          >
            <span
              style={{
                fontFamily: "Barlow Condensed",
                fontWeight: 700,
                fontSize: 11,
                color: THEME.cyanAccent,
                letterSpacing: "0.12em",
              }}
            >
              {GAMEMODE_LABEL[gamemode]}
            </span>
          </div>
        </div>

        {/* Verdict block */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "8px 28px 14px",
          }}
        >
          <span
            style={{
              fontFamily: "Barlow Condensed",
              fontWeight: 900,
              fontSize: 36,
              color: verdictColor,
              letterSpacing: "0.06em",
              lineHeight: 1.1,
            }}
          >
            {binding.text}
          </span>
          {mmr.primary && (
            <span
              style={{
                fontFamily: "Barlow Condensed",
                fontWeight: 700,
                fontSize: 15,
                color: THEME.textTertiary,
                letterSpacing: "0.04em",
                marginTop: 4,
              }}
            >
              MMR {mmr.primary.mmr.toLocaleString()} · {mmrToLabel(mmr.primary.mmr)}
            </span>
          )}
        </div>

        {/* Role triptych */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            flex: 1,
            borderTop: `1px solid ${THEME.borderSubtle}`,
          }}
        >
          {ROLES.map((role, idx) => {
            const r = mmr.perRole[role];
            const roleColorHex =
              role === "tank"
                ? THEME.roleTank
                : role === "damage"
                ? THEME.roleDamage
                : THEME.roleSupport;

            const hasActual = !!r.division && r.tier != null;
            const actualLabel = hasActual
              ? `${divisionLabel(r.division!)} ${r.tier}`
              : "—";
            const actualColor = hasActual ? rankColorHex(r.division!) : THEME.textTertiary;

            let diff: number | null = null;
            if (hasActual && r.systemRank) {
              diff = tierDelta(
                { division: r.systemRank.division, tier: r.systemRank.tier },
                { division: r.division!, tier: r.tier! }
              );
            }

            const arrowColor =
              diff === null || diff === 0
                ? THEME.textTertiary
                : diff > 0
                ? THEME.cyanAccent
                : MUTED_DAMAGE_COLOR;

            const magnitude =
              diff === null || diff === 0
                ? ""
                : diff > 0
                ? `+${diff}`
                : `${diff}`;

            const sysLabel = r.systemRank
              ? `${divisionLabel(r.systemRank.division)} ${r.systemRank.tier}`
              : "—";
            const sysColor = r.systemRank
              ? rankColorHex(r.systemRank.division)
              : THEME.textTertiary;

            const zScores = r.breakdown?.zScores ?? {};

            return (
              <div
                key={role}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  flex: 1,
                  padding: "14px 8px",
                  background: THEME.surface1,
                  borderTop: `2px solid ${roleTint(role, 0.35)}`,
                  borderLeft: idx > 0 ? `1px solid ${THEME.borderSubtle}` : "none",
                  gap: 6,
                }}
              >
                {/* Role label */}
                <span
                  style={{
                    fontFamily: "Barlow Condensed",
                    fontWeight: 700,
                    fontSize: 13,
                    color: roleColorHex,
                    letterSpacing: "0.12em",
                  }}
                >
                  {ROLE_LABEL[role]}
                </span>

                {/* Actual rank */}
                <span
                  style={{
                    fontFamily: "Barlow Condensed",
                    fontWeight: 700,
                    fontSize: 20,
                    color: actualColor,
                  }}
                >
                  {actualLabel}
                </span>

                {/* Delta arrow + magnitude */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 3,
                    minHeight: 16,
                  }}
                >
                  {diff === null || diff === 0 ? (
                    <svg width="12" height="12" viewBox="0 0 24 24">
                      <rect x="3" y="11" width="18" height="2" fill={arrowColor} />
                    </svg>
                  ) : diff > 0 ? (
                    <svg width="12" height="12" viewBox="0 0 24 24">
                      <path d="M12 3L4 15h5v6h6v-6h5z" fill={arrowColor} />
                    </svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24">
                      <path d="M12 21L4 9h5V3h6v6h5z" fill={arrowColor} />
                    </svg>
                  )}
                  {magnitude && (
                    <span
                      style={{
                        fontFamily: "Barlow Condensed",
                        fontWeight: 700,
                        fontSize: 12,
                        color: arrowColor,
                      }}
                    >
                      {magnitude}
                    </span>
                  )}
                </div>

                {/* Radar chart */}
                {Object.keys(zScores).length > 0 && (
                  <RoleRadar
                    zScores={zScores}
                    roleColor={roleColorHex}
                    size={140}
                  />
                )}

                {/* System rank */}
                <span
                  style={{
                    fontFamily: "Barlow Condensed",
                    fontWeight: 700,
                    fontSize: 14,
                    color: sysColor,
                  }}
                >
                  Sys: {sysLabel}
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "6px 28px",
            background: "rgba(0,0,0,0.25)",
            borderTop: `1px solid ${THEME.borderSubtle}`,
            height: 32,
          }}
        >
          <span
            style={{
              fontFamily: "Barlow Condensed",
              fontWeight: 700,
              fontSize: 11,
              color: THEME.textDisabled,
              letterSpacing: "0.04em",
            }}
          >
            v{ALGORITHM_VERSION}
          </span>
          <span
            style={{
              fontFamily: "Barlow Condensed",
              fontWeight: 700,
              fontSize: 11,
              color: THEME.textDisabled,
              letterSpacing: "0.04em",
            }}
          >
            {host}/player/{tag}
          </span>
        </div>
      </div>
    </div>
  );

  const img = new ImageResponse(jsx, opts);
  return new Response(img.body, {
    headers: {
      ...Object.fromEntries(img.headers.entries()),
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
