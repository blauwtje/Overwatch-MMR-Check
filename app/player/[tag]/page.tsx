import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import type { Metadata } from "next";
import { fetchPlayerData } from "@/lib/fetch-player";
import { RoleCard } from "@/components/mmr/role-card";
import { PrimaryMMRDisplay, NoPrimaryMMR } from "@/components/mmr/primary-mmr";
import { AlgorithmBreakdown } from "@/components/mmr/breakdown";
import { ShareCard } from "@/components/mmr/share-card";
import { AlertTriangle } from "lucide-react";
import type { Platform, Role, Gamemode } from "@/lib/algorithm/types";

interface Props {
  params: Promise<{ tag: string }>;
  searchParams: Promise<{ platform?: string; gamemode?: string }>;
}

function parsePlatform(raw: string | undefined): Platform {
  if (raw === "console" || raw === "mixed" || raw === "pc") return raw;
  return "pc";
}

function parseGamemode(raw: string | undefined): Gamemode {
  if (raw === "unranked" || raw === "both" || raw === "ranked") return raw;
  return "ranked";
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { tag } = await params;
  const { platform } = await searchParams;
  const displayTag = tag.replace("-", "#");
  return {
    title: `${displayTag} — owMMR`,
    description: `Estimated MMR for Overwatch 2 player ${displayTag} on ${platform ?? "PC"}.`,
  };
}

const ROLES: Role[] = ["tank", "damage", "support"];
const PLATFORMS: Platform[] = ["pc", "console", "mixed"];
const GAMEMODES: Gamemode[] = ["ranked", "unranked", "both"];

const PLATFORM_LABEL: Record<Platform, string> = {
  pc: "PC",
  console: "CONSOLE",
  mixed: "MIXED",
};

const GAMEMODE_LABEL: Record<Gamemode, string> = {
  ranked: "RANKED",
  unranked: "UNRANKED",
  both: "BOTH",
};

export default async function PlayerPage({ params, searchParams }: Props) {
  const { tag } = await params;
  const sp = await searchParams;
  const platform = parsePlatform(sp.platform);
  const gamemode = parseGamemode(sp.gamemode);

  const data = await fetchPlayerData(tag, platform, gamemode);

  if (data.status === "not_found") notFound();

  if (data.status === "private") {
    return (
      <ErrorPage
        title="Private Profile"
        message={`${data.username}'s career is set to private.`}
        detail="They can enable it at battle.net/account/management/profile-privacy."
      />
    );
  }

  if (data.status === "rate_limited") {
    return (
      <ErrorPage
        title="Rate Limited"
        message="We've hit the API rate limit."
        detail="Please wait a moment and try again."
      />
    );
  }

  if (data.status === "error") {
    return (
      <ErrorPage
        title="Upstream Error"
        message="The OverFast API is temporarily unavailable."
        detail={data.message}
      />
    );
  }

  const displayTag = tag.replace(/-(?=\d{4,8}$)/, "#");
  const buildHref = (next: { platform?: Platform; gamemode?: Gamemode }) =>
    `/player/${tag}?platform=${next.platform ?? platform}&gamemode=${next.gamemode ?? gamemode}`;

  // Build canonical share URL from request headers
  const h = await headers();
  const host = h.get("host") ?? "owmmr.app";
  const proto = h.get("x-forwarded-proto") ?? "https";
  const qs = new URLSearchParams();
  if (sp.platform) qs.set("platform", sp.platform);
  if (sp.gamemode) qs.set("gamemode", sp.gamemode);
  const qsStr = qs.toString();
  const shareUrl = `${proto}://${host}/player/${tag}${qsStr ? `?${qsStr}` : ""}`;

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--surface-0)", color: "var(--text-primary)" }}
    >
      {/* Background grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,212,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,212,255,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8 pb-16">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-display tracking-widest uppercase mb-8 transition-opacity hover:opacity-70"
          style={{ color: "var(--cyan-accent)" }}
        >
          ← Back
        </Link>

        {/* Share card — full-width trading card */}
        <ShareCard
          username={data.username}
          displayTag={displayTag}
          avatar={data.avatar}
          platform={data.platform}
          gamemode={data.gamemode}
          mmr={data.mmr}
          shareUrl={shareUrl}
        />

        {/* Narrow center column: banner + primary MMR + toggles */}
        <div className="max-w-2xl mx-auto">
          {/* Stats-partial banner */}
          {data.statsPartial && (
            <div
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg mb-6 text-sm font-display"
              style={{
                background: "rgba(255,124,42,0.08)",
                border: "1px solid rgba(255,124,42,0.2)",
                borderLeftWidth: "3px",
                borderLeftColor: "var(--orange-accent)",
                color: "var(--text-secondary)",
              }}
            >
              <AlertTriangle
                style={{ width: 14, height: 14, color: "var(--orange-accent)", flexShrink: 0 }}
              />
              <span>Some stats are unavailable — estimate may be less precise</span>
            </div>
          )}

          {/* Primary MMR card */}
          <div
            className="rounded-xl mb-6 relative overflow-hidden"
            style={{
              background: "var(--surface-1)",
              border: "1px solid var(--border-accent)",
              boxShadow: "0 0 40px rgba(0,212,255,0.05)",
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 0%, rgba(0,212,255,0.08) 0%, transparent 70%)",
              }}
            />
            <div className="relative">
              {data.mmr.primary ? (
                <PrimaryMMRDisplay primary={data.mmr.primary} mmr={data.mmr} />
              ) : (
                <NoPrimaryMMR roles={ROLES} />
              )}
            </div>
          </div>

          {/* Toggle panel */}
          <div
            className="rounded-lg mb-6 overflow-hidden"
            style={{
              background: "var(--surface-1)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <ToggleRow
              label="Platform"
              options={PLATFORMS}
              value={platform}
              labelFor={(p) => PLATFORM_LABEL[p]}
              hrefFor={(p) => buildHref({ platform: p })}
            />
            <div style={{ borderTop: "1px solid var(--border-subtle)" }} />
            <ToggleRow
              label="Game mode"
              options={GAMEMODES}
              value={gamemode}
              labelFor={(g) => GAMEMODE_LABEL[g]}
              hrefFor={(g) => buildHref({ gamemode: g })}
            />
          </div>
        </div>

        {/* Role cards — triptych on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {ROLES.map((role) => (
            <RoleCard
              key={role}
              role={role}
              result={data.mmr.perRole[role]}
              gamemode={data.gamemode}
              showPlatformChip={data.platform === "mixed"}
            />
          ))}
        </div>

        {/* Algorithm breakdown — three columns on desktop */}
        <AlgorithmBreakdown mmr={data.mmr} gamemode={data.gamemode} />

        {/* Footer disclaimer */}
        <p
          className="text-xs font-display text-center mt-8 tracking-wide max-w-2xl mx-auto"
          style={{ color: "var(--text-disabled)" }}
        >
          Unofficial estimate · Our model&apos;s estimate, not Blizzard&apos;s official MMR ·
          Not affiliated with Blizzard Entertainment
        </p>
      </div>
    </div>
  );
}

interface ToggleRowProps<T extends string> {
  label: string;
  options: readonly T[];
  value: T;
  labelFor: (option: T) => string;
  hrefFor: (option: T) => string;
}

function ToggleRow<T extends string>({ label, options, value, labelFor, hrefFor }: ToggleRowProps<T>) {
  return (
    <div className="flex flex-wrap items-center gap-2 px-4 py-3">
      <span
        className="text-xs tracking-widest uppercase font-display mr-2 w-20 shrink-0"
        style={{ color: "var(--text-tertiary)" }}
      >
        {label}
      </span>
      {options.map((opt) => {
        const active = opt === value;
        return (
          <Link
            key={opt}
            href={hrefFor(opt)}
            className="px-4 py-1.5 rounded text-xs font-display tracking-widest uppercase transition-all duration-150"
            style={{
              background: active ? "var(--cyan-accent)" : "var(--surface-2)",
              color: active ? "var(--surface-0)" : "var(--text-secondary)",
              border: active ? "1px solid var(--cyan-accent)" : "1px solid var(--border-subtle)",
              fontWeight: active ? 700 : 500,
            }}
          >
            {labelFor(opt)}
          </Link>
        );
      })}
    </div>
  );
}

function ErrorPage({
  title,
  message,
  detail,
}: {
  title: string;
  message: string;
  detail?: string;
}) {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--surface-0)" }}
    >
      <div className="text-center max-w-md">
        <p
          className="text-xs font-display tracking-[0.4em] uppercase mb-4"
          style={{ color: "var(--orange-accent)" }}
        >
          {title}
        </p>
        <p
          className="text-xl font-display font-bold mb-2"
          style={{ color: "var(--text-primary)" }}
        >
          {message}
        </p>
        {detail && (
          <p
            className="text-sm font-display mb-8"
            style={{ color: "var(--text-secondary)" }}
          >
            {detail}
          </p>
        )}
        <Link
          href="/"
          className="inline-block px-6 py-2.5 rounded font-display text-sm tracking-widest uppercase transition-opacity hover:opacity-80"
          style={{ background: "var(--cyan-accent)", color: "var(--surface-0)", fontWeight: 700 }}
        >
          Search Again
        </Link>
      </div>
    </div>
  );
}
