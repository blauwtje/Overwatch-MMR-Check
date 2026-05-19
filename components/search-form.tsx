"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { useRouter } from "next/navigation";

const BATTLETAG_REGEX = /^[\p{L}\d]{2,12}[#-]\d{4,8}$/u;
const RECENT_KEY = "owmmr:recent";
const PLATFORM_KEY = "owmmr:platform";
const MAX_RECENT = 5;

type Platform = "pc" | "console";

interface RecentSearch {
  tag: string;
  platform: Platform;
  ts: number;
}

function loadRecent(): RecentSearch[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveRecent(tag: string, platform: Platform) {
  const items = loadRecent().filter((r) => r.tag !== tag);
  items.unshift({ tag, platform, ts: Date.now() });
  localStorage.setItem(RECENT_KEY, JSON.stringify(items.slice(0, MAX_RECENT)));
}

function tagToUrl(tag: string): string {
  return tag.replace("#", "-");
}

export function SearchForm() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [platform, setPlatform] = useState<Platform>("pc");
  const [error, setError] = useState("");
  const [recent, setRecent] = useState<RecentSearch[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(PLATFORM_KEY) as Platform | null;
    if (saved === "pc" || saved === "console") setPlatform(saved);
    setRecent(loadRecent());
    inputRef.current?.focus();
  }, []);

  function handlePlatformChange(p: Platform) {
    setPlatform(p);
    localStorage.setItem(PLATFORM_KEY, p);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!BATTLETAG_REGEX.test(trimmed)) {
      setError("Format: Name#1234 or Name-1234");
      return;
    }
    setError("");
    saveRecent(trimmed, platform);
    setRecent(loadRecent());
    router.push(`/player/${tagToUrl(trimmed)}?platform=${platform}`);
  }

  function handleRecentClick(item: RecentSearch) {
    router.push(`/player/${tagToUrl(item.tag)}?platform=${item.platform}`);
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
        <div className="flex items-center gap-2">
          <span className="text-xs tracking-widest uppercase opacity-40 font-display mr-1">Platform</span>
          {(["pc", "console"] as Platform[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => handlePlatformChange(p)}
              className="px-4 py-1.5 rounded text-xs font-display tracking-widest uppercase transition-all duration-150"
              style={{
                background:
                  platform === p ? "var(--cyan-accent)" : "var(--surface-2)",
                color: platform === p ? "var(--surface-0)" : "rgba(255,255,255,0.5)",
                border:
                  platform === p
                    ? "1px solid var(--cyan-accent)"
                    : "1px solid var(--border-subtle)",
                fontWeight: platform === p ? 700 : 400,
              }}
            >
              {p === "pc" ? "PC" : "CONSOLE"}
            </button>
          ))}
        </div>
      </form>

      {/* Recent searches */}
      {recent.length > 0 && (
        <div className="mt-8">
          <p
            className="text-xs font-display tracking-widest uppercase mb-3 opacity-40"
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
                  color: "rgba(255,255,255,0.7)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                {item.tag}
                <span
                  className="ml-2 text-xs opacity-40"
                  style={{ color: "var(--cyan-accent)" }}
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
