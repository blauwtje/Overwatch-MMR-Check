import { LRUCache } from "lru-cache";
import type { components, operations } from "@/src/types/overfast";

type PlayerSummary = components["schemas"]["PlayerSummary"];
type PlayerStatsSummary = components["schemas"]["PlayerStatsSummary"];

export type OverFastError =
  | { type: "not_found" }
  | { type: "private" }
  | { type: "rate_limited"; retryAfter?: number }
  | { type: "upstream_error"; status: number }
  | { type: "network_error"; message: string };

export type OverFastResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: OverFastError };

// 1-hour TTL in milliseconds, max 500 entries
const summaryCache = new LRUCache<string, PlayerSummary>({ max: 500, ttl: 60 * 60 * 1000 });
const statsCache = new LRUCache<string, PlayerStatsSummary>({ max: 500, ttl: 60 * 60 * 1000 });

function getBaseUrl(): string {
  return (process.env.OVERFAST_BASE_URL ?? "https://overfast-api.tekrop.fr").replace(/\/$/, "");
}

async function fetchOverFast<T>(url: string): Promise<OverFastResult<T>> {
  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: { "User-Agent": "owMMR/1.0 (community tool)" },
    });

    if (res.status === 404) return { ok: false, error: { type: "not_found" } };
    if (res.status === 429) {
      const retryAfter = res.headers.get("Retry-After");
      return { ok: false, error: { type: "rate_limited", retryAfter: retryAfter ? parseInt(retryAfter) : undefined } };
    }
    if (res.status === 503 || res.status === 504) {
      return { ok: false, error: { type: "upstream_error", status: res.status } };
    }
    if (!res.ok) {
      return { ok: false, error: { type: "upstream_error", status: res.status } };
    }

    const data = await res.json() as T;

    // OverFast sets privacy=private on the stats summary body (not as HTTP error)
    // but the summary endpoint will still return data — we check at the caller level
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: { type: "network_error", message: String(e) } };
  }
}

export async function getPlayerSummary(
  playerId: string
): Promise<OverFastResult<PlayerSummary>> {
  const cacheKey = `summary:${playerId}`;
  const cached = summaryCache.get(cacheKey);
  if (cached) return { ok: true, data: cached };

  const url = `${getBaseUrl()}/players/${encodeURIComponent(playerId)}/summary`;
  const result = await fetchOverFast<PlayerSummary>(url);

  if (result.ok) summaryCache.set(cacheKey, result.data);
  return result;
}

export type StatsSummaryParams = {
  platform?: "pc" | "console";
  gamemode?: "competitive" | "quickplay";
};

export async function getPlayerStats(
  playerId: string,
  params: StatsSummaryParams = {}
): Promise<OverFastResult<PlayerStatsSummary>> {
  const { platform = "pc", gamemode = "competitive" } = params;
  const cacheKey = `stats:${playerId}:${platform}:${gamemode}`;
  const cached = statsCache.get(cacheKey);
  if (cached) return { ok: true, data: cached };

  const qs = new URLSearchParams();
  qs.set("platform", platform);
  qs.set("gamemode", gamemode);

  const url = `${getBaseUrl()}/players/${encodeURIComponent(playerId)}/stats/summary?${qs}`;
  const result = await fetchOverFast<PlayerStatsSummary>(url);

  if (result.ok) statsCache.set(cacheKey, result.data);
  return result;
}

export type { PlayerSummary, PlayerStatsSummary };
