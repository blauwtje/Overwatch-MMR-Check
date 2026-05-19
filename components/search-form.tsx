"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { useRouter } from "next/navigation";

const BATTLETAG_REGEX = /^[\p{L}\d]{2,12}[#-]\d{4,8}$/u;
const RECENT_KEY = "owmmr:recent";
const PLATFORM_KEY = "owmmr:platform";
const GAMEMODE_KEY = "owmmr:gamemode";
const MAX_RECENT = 5;

type Platform = "pc" | "console" | "mixed";
type Gamemode = "ranked" | "unranked" | "both";

interface RecentSearch {
  tag: string;
  platform: Platform;
  gamemode: Gamemode;
  ts: number;
}

function loadRecent(): RecentSearch[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveRecent(tag: string, platform: Platform, gamemode: Gamemode) {
  const items = loadRecent().filter((r) => r.tag !== tag);
  items.unshift({ tag, platform, gamemode, ts: Date.now() });
  localStorage.setItem(RECENT_KEY, JSON.stringify(items.slice(0, MAX_RECENT)));
}

function tagToUrl(tag: string): string {
  return tag.replace("#", "-");
}

const PLATFORM_LABELS: Record<Platform, string> = { pc: "PC", console: "CONSOLE", mixed: "MIXED" };
const GAMEMODE_LABELS: Record<Gamemode, string> = { ranked: "RANKED", unranked: "UNRANKED", both: "BOTH" };

export function SearchForm() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [platform, setPlatform] = useState<Platform>("pc");
  const [gamemode, setGamemode] = useState<Gamemode>("ranked");
  const [error, setError] = useState("");
  const [recent, setRecent] = useState<RecentSearch[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedPlatform = localStorage.getItem(PLATFORM_KEY) as Platform | null;
    if (savedPlatform === "pc" || savedPlatform === "console" || savedPlatform === "mixed") {
      setPlatform(savedPlatform);
    }
    const savedGamemode = localStorage.getItem(GAMEMODE_KEY) as Gamemode | null;
    if (savedGamemode === "ranked" || savedGamemode === "unranked" || savedGamemode === "both") {
      setGamemode(savedGamemode);
    }
    setRecent(loadRecent());
    inputRef.current?.focus();
  }, []);

  function handlePlatformChange(p: Platform) {
    setPlatform(p);
    localStorage.setItem(PLATFORM_KEY, p);
  }

  function handleGamemodeChange(g: Gamemode) {
    setGamemode(g);
    localStorage.setItem(GAMEMODE_KEY, g);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!BATTLETAG_REGEX.test(trimmed)) {
      setError("Format: Name#1234 or Name-1234");
      return;
    }
    setError("");
    saveRecent(trimmed, platform, gamemode);
    setRecent(loadRecent());
    router.push(`/player/${tagToUrl(trimmed)}?platform=${platform}&gamemode=${gamemode}`);
  }

  function handleRecentClick(item: RecentSearch) {
    const gm: Gamemode =
      item.gamemode === "ranked" || item.gamemode === "unranked" || item.gamemode === "both"
        ? item.gamemode
        : "ranked";
    router.push(`/player/${tagToUrl(item.tag)}?platform=${item.platform}&gamemode=${gm}`);
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* BattleTag input */}
        <div className="relative">
          <div
            className="absolute inset-0 rounded-lg pointer-events-none"
            style={{
              background: "linear-gradient(135deg, rgba(0,212,255,0.15) 0%, transparent 60%)",
              border: "1px solid var(--border-accent)",
            }}
          />
          <div className="relative flex items-center">
            <span
              className="absolute left-4 text-sm font-display tracking-widest opacity-50 select-none"
              style={{ color: "var(--cyan-accent)" }}
            >
              //
            </span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => { setInput(e.target.value); setError(""); }}
              placeholder="Name#1234"
              spellCheck={false}
              autoComplete="off"
              className="w-full bg-transparent pl-10 pr-4 py-4 text-lg tracking-wide outline-none placeholder:opacity-30"
              style={{
                fontFamily: "var(--font-display)",
                letterSpacing: "0.05em",
                color: "rgba(255,255,255,0.9)",
              }}
            />
            <button
              type="submit"
              className="mr-2 px-5 py-2 rounded text-xs font-display tracking-widest uppercase transition-all duration-200 shrink-0"
              style={{
                background: "var(--cyan-accent)",
                color: "var(--surface-0)",
                fontWeight: 700,
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.opacity = "0.85")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.opacity = "1")
              }
            >
              SCAN
            </button>
          </div>
        </div>

        {error && (
          <p
            className="text-sm font-display tracking-wide pl-1"
            style={{ color: "var(--orange-accent)" }}
          >
            {error}
          </p>
        )}

        {/* Platform toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-xs tracking-widest uppercase font-display mr-1 w-20 shrink-0"
            style={{ color: "var(--text-tertiary)" }}
          >
            Platform
          </span>
          {(["pc", "console", "mixed"] as Platform[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => handlePlatformChange(p)}
              className="px-4 py-1.5 rounded text-xs font-display tracking-widest uppercase transition-all duration-150"
              style={{
                background: platform === p ? "var(--cyan-accent)" : "var(--surface-2)",
                color: platform === p ? "var(--surface-0)" : "var(--text-secondary)",
                border:
                  platform === p
                    ? "1px solid var(--cyan-accent)"
                    : "1px solid var(--border-subtle)",
                fontWeight: platform === p ? 700 : 400,
              }}
            >
              {PLATFORM_LABELS[p]}
            </button>
          ))}
        </div>

        {/* Gamemode toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-xs tracking-widest uppercase font-display mr-1 w-20 shrink-0"
            style={{ color: "var(--text-tertiary)" }}
          >
            Game mode
          </span>
          {(["ranked", "unranked", "both"] as Gamemode[]).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => handleGamemodeChange(g)}
              className="px-4 py-1.5 rounded text-xs font-display tracking-widest uppercase transition-all duration-150"
              style={{
                background: gamemode === g ? "var(--cyan-accent)" : "var(--surface-2)",
                color: gamemode === g ? "var(--surface-0)" : "var(--text-secondary)",
                border:
                  gamemode === g
                    ? "1px solid var(--cyan-accent)"
                    : "1px solid var(--border-subtle)",
                fontWeight: gamemode === g ? 700 : 400,
              }}
            >
              {GAMEMODE_LABELS[g]}
            </button>
          ))}
        </div>
      </form>

      {/* Recent searches */}
      {recent.length > 0 && (
        <div className="mt-8">
          <p
            className="text-xs font-display tracking-widest uppercase mb-3"
            style={{ color: "var(--text-tertiary)" }}
          >
            Recent
          </p>
          <div className="flex flex-wrap gap-2">
            {recent.map((item) => (
              <button
                key={item.tag + item.platform}
                onClick={() => handleRecentClick(item)}
                className="px-3 py-1.5 rounded text-sm font-display tracking-wide transition-all duration-150 hover:opacity-80"
                style={{
                  background: "var(--surface-2)",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                {item.tag}
                <span
                  className="ml-2 text-xs"
                  style={{ color: "var(--cyan-accent)", opacity: 0.7 }}
                >
                  {item.platform.toUpperCase()}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
