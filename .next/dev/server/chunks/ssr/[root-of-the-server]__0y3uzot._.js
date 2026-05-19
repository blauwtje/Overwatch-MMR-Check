module.exports = [
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/node:diagnostics_channel [external] (node:diagnostics_channel, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:diagnostics_channel", () => require("node:diagnostics_channel"));

module.exports = mod;
}),
"[project]/lib/overfast/client.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getPlayerCareer",
    ()=>getPlayerCareer,
    "getPlayerStats",
    ()=>getPlayerStats,
    "getPlayerSummary",
    ()=>getPlayerSummary
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lru$2d$cache$2f$dist$2f$esm$2f$node$2f$index$2e$min$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lru-cache/dist/esm/node/index.min.js [app-rsc] (ecmascript)");
;
// 1-hour TTL in milliseconds, max 500 entries
const summaryCache = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lru$2d$cache$2f$dist$2f$esm$2f$node$2f$index$2e$min$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["LRUCache"]({
    max: 500,
    ttl: 60 * 60 * 1000
});
const statsCache = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lru$2d$cache$2f$dist$2f$esm$2f$node$2f$index$2e$min$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["LRUCache"]({
    max: 500,
    ttl: 60 * 60 * 1000
});
const careerCache = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lru$2d$cache$2f$dist$2f$esm$2f$node$2f$index$2e$min$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["LRUCache"]({
    max: 200,
    ttl: 60 * 60 * 1000
});
function getBaseUrl() {
    return (process.env.OVERFAST_BASE_URL ?? "https://overfast-api.tekrop.fr").replace(/\/$/, "");
}
async function fetchOverFast(url) {
    try {
        const res = await fetch(url, {
            cache: "no-store",
            headers: {
                "User-Agent": "owMMR/1.0 (community tool)"
            }
        });
        if (res.status === 404) return {
            ok: false,
            error: {
                type: "not_found"
            }
        };
        if (res.status === 429) {
            const retryAfter = res.headers.get("Retry-After");
            return {
                ok: false,
                error: {
                    type: "rate_limited",
                    retryAfter: retryAfter ? parseInt(retryAfter) : undefined
                }
            };
        }
        if (res.status === 503 || res.status === 504) {
            return {
                ok: false,
                error: {
                    type: "upstream_error",
                    status: res.status
                }
            };
        }
        if (!res.ok) {
            return {
                ok: false,
                error: {
                    type: "upstream_error",
                    status: res.status
                }
            };
        }
        const data = await res.json();
        // OverFast sets privacy=private on the stats summary body (not as HTTP error)
        // but the summary endpoint will still return data — we check at the caller level
        return {
            ok: true,
            data
        };
    } catch (e) {
        return {
            ok: false,
            error: {
                type: "network_error",
                message: String(e)
            }
        };
    }
}
async function getPlayerSummary(playerId) {
    const cacheKey = `summary:${playerId}`;
    const cached = summaryCache.get(cacheKey);
    if (cached) return {
        ok: true,
        data: cached
    };
    const url = `${getBaseUrl()}/players/${encodeURIComponent(playerId)}/summary`;
    const result = await fetchOverFast(url);
    if (result.ok) summaryCache.set(cacheKey, result.data);
    return result;
}
async function getPlayerStats(playerId, params = {}) {
    const { platform = "pc", gamemode = "competitive" } = params;
    const cacheKey = `stats:${playerId}:${platform}:${gamemode}`;
    const cached = statsCache.get(cacheKey);
    if (cached) return {
        ok: true,
        data: cached
    };
    const qs = new URLSearchParams();
    qs.set("platform", platform);
    qs.set("gamemode", gamemode);
    const url = `${getBaseUrl()}/players/${encodeURIComponent(playerId)}/stats/summary?${qs}`;
    const result = await fetchOverFast(url);
    if (result.ok) statsCache.set(cacheKey, result.data);
    return result;
}
async function getPlayerCareer(playerId, params) {
    const { platform, gamemode } = params;
    const cacheKey = `career:${playerId}:${platform}:${gamemode}`;
    const cached = careerCache.get(cacheKey);
    if (cached) return {
        ok: true,
        data: cached
    };
    const qs = new URLSearchParams();
    qs.set("platform", platform);
    qs.set("gamemode", gamemode);
    const url = `${getBaseUrl()}/players/${encodeURIComponent(playerId)}/stats/career?${qs}`;
    // PlayerCareerStats type from schema is verbose; trimmed below before returning
    const result = await fetchOverFast(url);
    if (!result.ok) {
        return result;
    }
    // Trim the response: keep only game, combat, assists, average for each hero
    // Skip "all-heroes" key
    const trimmed = {};
    const rawData = result.data;
    for (const [heroKey, heroData] of Object.entries(rawData)){
        if (heroKey === "all-heroes") continue;
        // Guard against null hero entries (permitted by OpenAPI spec)
        if (heroData === null || typeof heroData !== "object") continue;
        const hero = heroData;
        const trimmedHero = {};
        if (hero.game && typeof hero.game === "object") {
            trimmedHero.game = hero.game;
        }
        if (hero.combat && typeof hero.combat === "object") {
            trimmedHero.combat = hero.combat;
        }
        if (hero.assists && typeof hero.assists === "object") {
            trimmedHero.assists = hero.assists;
        }
        if (hero.average && typeof hero.average === "object") {
            trimmedHero.average = hero.average;
        }
        trimmed[heroKey] = trimmedHero;
    }
    careerCache.set(cacheKey, trimmed);
    return {
        ok: true,
        data: trimmed
    };
}
}),
"[project]/lib/overfast/transform.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "attachHeroBreakdowns",
    ()=>attachHeroBreakdowns,
    "extractCompetitive",
    ()=>extractCompetitive,
    "extractRoleStats",
    ()=>extractRoleStats,
    "extractSeason",
    ()=>extractSeason,
    "isPrivateSummary",
    ()=>isPrivateSummary
]);
const ROLES = [
    "tank",
    "damage",
    "support"
];
function isPrivateSummary(summary) {
    return !summary.competitive;
}
function extractCompetitive(summary, platform) {
    const platformRanks = summary.competitive?.[platform];
    const result = {};
    for (const role of ROLES){
        const rank = platformRanks?.[role];
        if (rank) {
            result[role] = {
                division: rank.division,
                tier: rank.tier,
                rank_icon: rank.rank_icon
            };
        } else {
            result[role] = null;
        }
    }
    return result;
}
function extractRoleStats(stats) {
    const result = {};
    const statsRoles = stats?.roles;
    for (const role of ROLES){
        const rs = statsRoles?.[role];
        if (!rs) {
            result[role] = null;
            continue;
        }
        result[role] = {
            games_played: rs.games_played,
            games_won: rs.games_won,
            winrate: rs.winrate,
            kda: rs.kda,
            average: {
                deaths: rs.average.deaths,
                damage: rs.average.damage,
                healing: rs.average.healing
            },
            total: {
                eliminations: rs.total.eliminations,
                assists: rs.total.assists,
                deaths: rs.total.deaths,
                damage: rs.total.damage,
                healing: rs.total.healing
            }
        };
    }
    return result;
}
function extractSeason(summary, platform) {
    return summary.competitive?.[platform]?.season ?? null;
}
function attachHeroBreakdowns(roleStats, heroBreakdownsByRole) {
    for (const [roleKey, breakdowns] of Object.entries(heroBreakdownsByRole)){
        const rs = roleStats[roleKey];
        if (rs == null) continue;
        rs.heroBreakdown = breakdowns;
        const totalTime = breakdowns.reduce((sum, b)=>sum + b.timePlayedSec, 0);
        rs.specializationRatio = totalTime > 0 ? breakdowns[0].timePlayedSec / totalTime : 0;
        rs.heroCount = breakdowns.filter((b)=>b.timePlayedSec >= 3600).length;
    }
}
}),
"[project]/lib/overfast/hero-role.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "HERO_TO_ROLE",
    ()=>HERO_TO_ROLE
]);
const HERO_TO_ROLE = {
    // Tank heroes
    dva: "tank",
    doomfist: "tank",
    hazard: "tank",
    "junker-queen": "tank",
    mauga: "tank",
    orisa: "tank",
    ramattra: "tank",
    reinhardt: "tank",
    roadhog: "tank",
    sigma: "tank",
    winston: "tank",
    "wrecking-ball": "tank",
    zarya: "tank",
    // Support heroes
    ana: "support",
    baptiste: "support",
    brigitte: "support",
    illari: "support",
    juno: "support",
    kiriko: "support",
    lifeweaver: "support",
    lucio: "support",
    mercy: "support",
    moira: "support",
    zenyatta: "support",
    // Damage heroes
    ashe: "damage",
    bastion: "damage",
    cassidy: "damage",
    echo: "damage",
    freja: "damage",
    genji: "damage",
    hanzo: "damage",
    junkrat: "damage",
    mei: "damage",
    pharah: "damage",
    reaper: "damage",
    sojourn: "damage",
    "soldier-76": "damage",
    sombra: "damage",
    symmetra: "damage",
    torbjorn: "damage",
    tracer: "damage",
    venture: "damage",
    widowmaker: "damage"
};
}),
"[project]/lib/overfast/career-transform.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "extractHeroBreakdownByRole",
    ()=>extractHeroBreakdownByRole
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$overfast$2f$hero$2d$role$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/overfast/hero-role.ts [app-rsc] (ecmascript)");
;
let warned = false;
function extractHeroBreakdownByRole(career) {
    const result = {};
    for (const [heroKey, heroData] of Object.entries(career)){
        // Skip the all-heroes aggregate key
        if (heroKey === "all-heroes") continue;
        // Skip heroes not in HERO_TO_ROLE (unknown or experimental heroes)
        if (!(heroKey in __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$overfast$2f$hero$2d$role$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["HERO_TO_ROLE"])) continue;
        // Skip null or undefined hero entries
        if (heroData == null) continue;
        const role = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$overfast$2f$hero$2d$role$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["HERO_TO_ROLE"][heroKey];
        const timePlayedSec = heroData.game?.["time_played"] ?? 0;
        const gamesPlayed = heroData.game?.["games_played"] ?? 0;
        const rawWon = heroData.game?.["games_won"];
        const rawLost = heroData.game?.["games_lost"];
        const gamesWon = rawWon != null ? rawWon : rawLost != null ? Math.max(0, gamesPlayed - rawLost) : 0; // both absent: default to 0 rather than over-inflating
        const winrate = gamesPlayed > 0 ? gamesWon / gamesPlayed * 100 : 0;
        const kda = ((heroData.combat?.["eliminations"] ?? 0) + (heroData.assists?.["assists"] ?? 0)) / Math.max(heroData.combat?.["deaths"] ?? 0, 1);
        // Skip heroes with less than 1 minute of playtime (noise)
        if (timePlayedSec < 60) continue;
        const breakdown = {
            hero: heroKey,
            timePlayedSec,
            gamesPlayed,
            gamesWon,
            winrate,
            kda
        };
        if (!result[role]) {
            result[role] = [];
        }
        result[role].push(breakdown);
    }
    // Sort each role array descending by timePlayedSec and truncate to top 10
    for (const role of Object.keys(result)){
        result[role] = result[role].sort((a, b)=>b.timePlayedSec - a.timePlayedSec).slice(0, 10);
    }
    // One-time warning for suspiciously large time_played values
    if (!warned) {
        const hasSuspiciousValue = Object.values(result).some((breakdowns)=>breakdowns.some((b)=>b.timePlayedSec > 1_000_000));
        if (hasSuspiciousValue) {
            warned = true;
            console.warn("[owMMR] career-transform: suspiciously large time_played value detected — possible unit mismatch (expected seconds)");
        }
    }
    return result;
}
}),
"[project]/lib/algorithm/rank-mapping.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "mmrToLabel",
    ()=>mmrToLabel,
    "mmrToRank",
    ()=>mmrToRank,
    "rankToMMR",
    ()=>rankToMMR
]);
const DIVISION_BASE = {
    bronze: 1000,
    silver: 1500,
    gold: 2000,
    platinum: 2500,
    diamond: 3000,
    master: 3500,
    grandmaster: 4000,
    ultimate: 4500
};
function rankToMMR(division, tier) {
    const base = DIVISION_BASE[division];
    const tierBonus = (5 - tier) * 100; // tier 1 → 400, tier 5 → 0
    return base + tierBonus;
}
const DIVISION_RANGES = [
    {
        division: "ultimate",
        floor: 4500
    },
    {
        division: "grandmaster",
        floor: 4000
    },
    {
        division: "master",
        floor: 3500
    },
    {
        division: "diamond",
        floor: 3000
    },
    {
        division: "platinum",
        floor: 2500
    },
    {
        division: "gold",
        floor: 2000
    },
    {
        division: "silver",
        floor: 1500
    },
    {
        division: "bronze",
        floor: 0
    }
];
function divisionLabel(division) {
    return division.charAt(0).toUpperCase() + division.slice(1);
}
function mmrToRank(mmr) {
    if (mmr >= 4900) {
        return {
            division: "ultimate",
            tier: 1,
            label: "Top 500"
        };
    }
    if (mmr >= 4500) {
        return {
            division: "ultimate",
            tier: 1,
            label: "Champion"
        };
    }
    const range = DIVISION_RANGES.find((r)=>mmr >= r.floor) ?? DIVISION_RANGES[DIVISION_RANGES.length - 1];
    // tier 5 = lowest, tier 1 = highest within division
    const tier = Math.max(1, Math.min(5, 5 - Math.floor((mmr - range.floor) / 100)));
    return {
        division: range.division,
        tier,
        label: `${divisionLabel(range.division)} ${tier}`
    };
}
function mmrToLabel(mmr) {
    return mmrToRank(mmr).label;
}
}),
"[project]/lib/algorithm/peer-baselines.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PEER_BASELINES",
    ()=>PEER_BASELINES
]);
// Seeded from community data / leaderboard observation.
// Will be auto-recalculated from DB snapshots post-launch.
// winrate: percent (0-100), kda: ratio, avgDeaths/avgDamage/avgHealing: per 10 min
const BASELINE_TEMPLATE = {
    tank: {
        bronze: {
            winrate: {
                mean: 45,
                stddev: 9
            },
            kda: {
                mean: 1.8,
                stddev: 0.7
            },
            avgDeaths: {
                mean: 10,
                stddev: 3
            },
            avgDamage: {
                mean: 6000,
                stddev: 2500
            },
            avgHealing: {
                mean: 400,
                stddev: 300
            }
        },
        silver: {
            winrate: {
                mean: 47,
                stddev: 9
            },
            kda: {
                mean: 2.0,
                stddev: 0.7
            },
            avgDeaths: {
                mean: 9.5,
                stddev: 3
            },
            avgDamage: {
                mean: 7000,
                stddev: 2500
            },
            avgHealing: {
                mean: 450,
                stddev: 300
            }
        },
        gold: {
            winrate: {
                mean: 49,
                stddev: 9
            },
            kda: {
                mean: 2.3,
                stddev: 0.7
            },
            avgDeaths: {
                mean: 9.0,
                stddev: 2.5
            },
            avgDamage: {
                mean: 8000,
                stddev: 2500
            },
            avgHealing: {
                mean: 500,
                stddev: 300
            }
        },
        platinum: {
            winrate: {
                mean: 49,
                stddev: 9
            },
            kda: {
                mean: 2.6,
                stddev: 0.8
            },
            avgDeaths: {
                mean: 8.5,
                stddev: 2.5
            },
            avgDamage: {
                mean: 9000,
                stddev: 2500
            },
            avgHealing: {
                mean: 550,
                stddev: 300
            }
        },
        diamond: {
            winrate: {
                mean: 50,
                stddev: 8
            },
            kda: {
                mean: 2.9,
                stddev: 0.8
            },
            avgDeaths: {
                mean: 8.0,
                stddev: 2
            },
            avgDamage: {
                mean: 10000,
                stddev: 3000
            },
            avgHealing: {
                mean: 600,
                stddev: 350
            }
        },
        master: {
            winrate: {
                mean: 50,
                stddev: 8
            },
            kda: {
                mean: 3.3,
                stddev: 0.9
            },
            avgDeaths: {
                mean: 7.5,
                stddev: 2
            },
            avgDamage: {
                mean: 11000,
                stddev: 3000
            },
            avgHealing: {
                mean: 650,
                stddev: 350
            }
        },
        grandmaster: {
            winrate: {
                mean: 51,
                stddev: 8
            },
            kda: {
                mean: 3.8,
                stddev: 1.0
            },
            avgDeaths: {
                mean: 7.0,
                stddev: 2
            },
            avgDamage: {
                mean: 12500,
                stddev: 3500
            },
            avgHealing: {
                mean: 700,
                stddev: 400
            }
        },
        ultimate: {
            winrate: {
                mean: 52,
                stddev: 7
            },
            kda: {
                mean: 4.5,
                stddev: 1.2
            },
            avgDeaths: {
                mean: 6.0,
                stddev: 2
            },
            avgDamage: {
                mean: 14000,
                stddev: 4000
            },
            avgHealing: {
                mean: 800,
                stddev: 500
            }
        }
    },
    damage: {
        bronze: {
            winrate: {
                mean: 45,
                stddev: 9
            },
            kda: {
                mean: 1.5,
                stddev: 0.7
            },
            avgDeaths: {
                mean: 10,
                stddev: 3
            },
            avgDamage: {
                mean: 8000,
                stddev: 3000
            },
            avgHealing: {
                mean: 100,
                stddev: 100
            }
        },
        silver: {
            winrate: {
                mean: 47,
                stddev: 9
            },
            kda: {
                mean: 1.8,
                stddev: 0.7
            },
            avgDeaths: {
                mean: 9.5,
                stddev: 3
            },
            avgDamage: {
                mean: 9000,
                stddev: 3000
            },
            avgHealing: {
                mean: 100,
                stddev: 100
            }
        },
        gold: {
            winrate: {
                mean: 49,
                stddev: 9
            },
            kda: {
                mean: 2.1,
                stddev: 0.7
            },
            avgDeaths: {
                mean: 9.0,
                stddev: 2.5
            },
            avgDamage: {
                mean: 10500,
                stddev: 3000
            },
            avgHealing: {
                mean: 120,
                stddev: 100
            }
        },
        platinum: {
            winrate: {
                mean: 49,
                stddev: 9
            },
            kda: {
                mean: 2.4,
                stddev: 0.8
            },
            avgDeaths: {
                mean: 8.5,
                stddev: 2.5
            },
            avgDamage: {
                mean: 12000,
                stddev: 3000
            },
            avgHealing: {
                mean: 130,
                stddev: 100
            }
        },
        diamond: {
            winrate: {
                mean: 50,
                stddev: 8
            },
            kda: {
                mean: 2.8,
                stddev: 0.8
            },
            avgDeaths: {
                mean: 8.0,
                stddev: 2
            },
            avgDamage: {
                mean: 14000,
                stddev: 3500
            },
            avgHealing: {
                mean: 150,
                stddev: 120
            }
        },
        master: {
            winrate: {
                mean: 50,
                stddev: 8
            },
            kda: {
                mean: 3.3,
                stddev: 1.0
            },
            avgDeaths: {
                mean: 7.5,
                stddev: 2
            },
            avgDamage: {
                mean: 16000,
                stddev: 4000
            },
            avgHealing: {
                mean: 180,
                stddev: 150
            }
        },
        grandmaster: {
            winrate: {
                mean: 51,
                stddev: 8
            },
            kda: {
                mean: 3.9,
                stddev: 1.1
            },
            avgDeaths: {
                mean: 7.0,
                stddev: 2
            },
            avgDamage: {
                mean: 18000,
                stddev: 4000
            },
            avgHealing: {
                mean: 200,
                stddev: 150
            }
        },
        ultimate: {
            winrate: {
                mean: 52,
                stddev: 7
            },
            kda: {
                mean: 4.8,
                stddev: 1.3
            },
            avgDeaths: {
                mean: 6.0,
                stddev: 2
            },
            avgDamage: {
                mean: 21000,
                stddev: 5000
            },
            avgHealing: {
                mean: 250,
                stddev: 200
            }
        }
    },
    support: {
        bronze: {
            winrate: {
                mean: 45,
                stddev: 9
            },
            kda: {
                mean: 1.8,
                stddev: 0.7
            },
            avgDeaths: {
                mean: 9,
                stddev: 3
            },
            avgDamage: {
                mean: 3000,
                stddev: 1500
            },
            avgHealing: {
                mean: 6000,
                stddev: 2500
            }
        },
        silver: {
            winrate: {
                mean: 47,
                stddev: 9
            },
            kda: {
                mean: 2.1,
                stddev: 0.7
            },
            avgDeaths: {
                mean: 8.5,
                stddev: 2.5
            },
            avgDamage: {
                mean: 3500,
                stddev: 1500
            },
            avgHealing: {
                mean: 7000,
                stddev: 2500
            }
        },
        gold: {
            winrate: {
                mean: 49,
                stddev: 9
            },
            kda: {
                mean: 2.4,
                stddev: 0.7
            },
            avgDeaths: {
                mean: 8.0,
                stddev: 2.5
            },
            avgDamage: {
                mean: 4000,
                stddev: 1500
            },
            avgHealing: {
                mean: 8000,
                stddev: 3000
            }
        },
        platinum: {
            winrate: {
                mean: 49,
                stddev: 9
            },
            kda: {
                mean: 2.7,
                stddev: 0.8
            },
            avgDeaths: {
                mean: 7.5,
                stddev: 2
            },
            avgDamage: {
                mean: 4500,
                stddev: 1500
            },
            avgHealing: {
                mean: 8500,
                stddev: 3000
            }
        },
        diamond: {
            winrate: {
                mean: 50,
                stddev: 8
            },
            kda: {
                mean: 3.1,
                stddev: 0.8
            },
            avgDeaths: {
                mean: 7.0,
                stddev: 2
            },
            avgDamage: {
                mean: 5000,
                stddev: 2000
            },
            avgHealing: {
                mean: 9000,
                stddev: 3000
            }
        },
        master: {
            winrate: {
                mean: 50,
                stddev: 8
            },
            kda: {
                mean: 3.6,
                stddev: 0.9
            },
            avgDeaths: {
                mean: 6.5,
                stddev: 2
            },
            avgDamage: {
                mean: 5500,
                stddev: 2000
            },
            avgHealing: {
                mean: 9500,
                stddev: 3500
            }
        },
        grandmaster: {
            winrate: {
                mean: 51,
                stddev: 8
            },
            kda: {
                mean: 4.2,
                stddev: 1.0
            },
            avgDeaths: {
                mean: 6.0,
                stddev: 1.5
            },
            avgDamage: {
                mean: 6500,
                stddev: 2500
            },
            avgHealing: {
                mean: 10500,
                stddev: 4000
            }
        },
        ultimate: {
            winrate: {
                mean: 52,
                stddev: 7
            },
            kda: {
                mean: 5.1,
                stddev: 1.2
            },
            avgDeaths: {
                mean: 5.0,
                stddev: 1.5
            },
            avgDamage: {
                mean: 8000,
                stddev: 3000
            },
            avgHealing: {
                mean: 12000,
                stddev: 5000
            }
        }
    }
};
// Console meta is slightly different: generally lower damage numbers, more forgiving KDA
// We apply a conservative scaling (0.9× damage baselines, otherwise same)
function scaleForConsole(base) {
    return Object.fromEntries(Object.entries(base).map(([role, rankMap])=>[
            role,
            Object.fromEntries(Object.entries(rankMap).map(([rank, vals])=>[
                    rank,
                    {
                        ...vals,
                        avgDamage: {
                            mean: vals.avgDamage.mean * 0.9,
                            stddev: vals.avgDamage.stddev * 0.9
                        }
                    }
                ]))
        ]));
}
const PEER_BASELINES = {
    pc: BASELINE_TEMPLATE,
    console: scaleForConsole(BASELINE_TEMPLATE)
};
}),
"[project]/lib/algorithm/weights.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ROLE_WEIGHTS",
    ()=>ROLE_WEIGHTS
]);
const ROLE_WEIGHTS = {
    tank: {
        winrate: 0.40,
        kda: 0.15,
        avgDeaths: 0.20,
        avgDamage: 0.15,
        avgHealing: 0.10
    },
    damage: {
        winrate: 0.40,
        kda: 0.20,
        avgDeaths: 0.15,
        avgDamage: 0.20,
        avgHealing: 0.05
    },
    support: {
        winrate: 0.40,
        kda: 0.10,
        avgDeaths: 0.20,
        avgDamage: 0.10,
        avgHealing: 0.20
    }
};
}),
"[project]/lib/algorithm/index.ts [app-rsc] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ALGORITHM_VERSION",
    ()=>ALGORITHM_VERSION,
    "estimateMMR",
    ()=>estimateMMR
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$algorithm$2f$rank$2d$mapping$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/algorithm/rank-mapping.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$algorithm$2f$peer$2d$baselines$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/algorithm/peer-baselines.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$algorithm$2f$weights$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/algorithm/weights.ts [app-rsc] (ecmascript)");
;
;
;
const ALGORITHM_VERSION = "1.2.0";
const ROLES = [
    "tank",
    "damage",
    "support"
];
const UNRANKED_REFERENCE_DIVISION = "platinum";
const UNRANKED_MMR_SPAN = 1500; // 10× the ranked coefficient
// dampens the top-hero KDA bonus to counter the systematic gap between top-hero KDA and role-mean KDA
const TOP_HERO_KDA_DAMPENER = 0.8;
const HERO_BREAKDOWN_MIN_HEROES = 3;
const HERO_BREAKDOWN_TOP_PLAYTIME_SHARE = 0.8;
function zscore(value, mean, stddev) {
    if (stddev === 0) return 0;
    return (value - mean) / stddev;
}
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
// log10-based weight: full trust at 200 games, near zero below 5
function sampleSizeWeight(gamesPlayed) {
    return clamp(Math.log10(gamesPlayed + 1) / Math.log10(200), 0, 1);
}
function confidenceFor(sampleWeight) {
    return sampleWeight > 0.7 ? "high" : sampleWeight > 0.4 ? "medium" : "low";
}
/** Weighted blend of two stat samples by games_played. */ function blendStats(comp, qp) {
    if (!comp && !qp) return null;
    if (!qp) return comp ?? null;
    if (!comp) return qp;
    const total = comp.games_played + qp.games_played;
    if (total === 0) return comp;
    const cw = comp.games_played / total;
    const qw = qp.games_played / total;
    const merged = {
        games_played: total,
        games_won: comp.games_won + qp.games_won,
        winrate: comp.winrate * cw + qp.winrate * qw,
        kda: comp.kda * cw + qp.kda * qw,
        average: {
            deaths: comp.average.deaths * cw + qp.average.deaths * qw,
            damage: comp.average.damage * cw + qp.average.damage * qw,
            healing: comp.average.healing * cw + qp.average.healing * qw
        },
        total: {
            eliminations: comp.total.eliminations + qp.total.eliminations,
            assists: comp.total.assists + qp.total.assists,
            deaths: comp.total.deaths + qp.total.deaths,
            damage: comp.total.damage + qp.total.damage,
            healing: comp.total.healing + qp.total.healing
        }
    };
    const aBreakdown = comp.heroBreakdown;
    const bBreakdown = qp.heroBreakdown;
    if (aBreakdown || bBreakdown) {
        merged.heroBreakdown = blendHeroBreakdowns(aBreakdown ?? [], bBreakdown ?? []);
    }
    const breakdown = merged.heroBreakdown;
    if (breakdown && breakdown.length > 0) {
        const totalTime = breakdown.reduce((sum, b)=>sum + b.timePlayedSec, 0);
        merged.specializationRatio = totalTime > 0 ? breakdown[0].timePlayedSec / totalTime : 0;
        merged.heroCount = breakdown.filter((b)=>b.timePlayedSec >= 3600).length;
    }
    return merged;
}
function blendHeroBreakdowns(a, b) {
    const map = new Map();
    for (const breakdown of [
        ...a,
        ...b
    ]){
        const existing = map.get(breakdown.hero);
        if (!existing) {
            map.set(breakdown.hero, {
                ...breakdown
            });
        } else {
            // Weighted average KDA by time played
            const totalTime = existing.timePlayedSec + breakdown.timePlayedSec;
            const blendedKda = totalTime > 0 ? (existing.kda * existing.timePlayedSec + breakdown.kda * breakdown.timePlayedSec) / totalTime : 0;
            map.set(breakdown.hero, {
                hero: existing.hero,
                timePlayedSec: existing.timePlayedSec + breakdown.timePlayedSec,
                gamesPlayed: existing.gamesPlayed + breakdown.gamesPlayed,
                gamesWon: existing.gamesWon + breakdown.gamesWon,
                winrate: 0,
                kda: blendedKda
            });
        }
    }
    // Recompute winrate from blended gamesPlayed/gamesWon
    const merged = Array.from(map.values()).map((b)=>({
            ...b,
            winrate: b.gamesPlayed > 0 ? b.gamesWon / b.gamesPlayed * 100 : 0
        }));
    // Re-sort desc by timePlayedSec, truncate to 10
    return merged.sort((a, b)=>b.timePlayedSec - a.timePlayedSec).slice(0, 10);
}
function computeZScores(platform, role, division, stats) {
    const peers = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$algorithm$2f$peer$2d$baselines$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PEER_BASELINES"][platform][role][division];
    const winrateZ = zscore(stats.winrate, peers.winrate.mean, peers.winrate.stddev);
    const kdaZ = zscore(stats.kda, peers.kda.mean, peers.kda.stddev);
    const avgDeathsZ = -zscore(stats.average.deaths, peers.avgDeaths.mean, peers.avgDeaths.stddev);
    const avgDamageZ = zscore(stats.average.damage, peers.avgDamage.mean, peers.avgDamage.stddev);
    const avgHealingZ = zscore(stats.average.healing, peers.avgHealing.mean, peers.avgHealing.stddev);
    // Check if we have sufficient hero breakdown data to use the more accurate topHeroKda signal
    if (stats.heroBreakdown && stats.heroBreakdown.length >= HERO_BREAKDOWN_MIN_HEROES) {
        const top3 = stats.heroBreakdown.slice(0, 3);
        const totalTop3Time = top3.reduce((sum, b)=>sum + b.timePlayedSec, 0);
        const totalAllTime = stats.heroBreakdown.reduce((sum, b)=>sum + b.timePlayedSec, 0);
        if (totalAllTime > 0 && totalTop3Time / totalAllTime >= HERO_BREAKDOWN_TOP_PLAYTIME_SHARE) {
            // Compute weighted-average KDA of top 3 heroes by playtime
            const topHeroKda = totalTop3Time > 0 ? top3.reduce((sum, b)=>sum + b.kda * b.timePlayedSec, 0) / totalTop3Time : 0;
            const topHeroKdaZ = zscore(topHeroKda, peers.kda.mean, peers.kda.stddev) * TOP_HERO_KDA_DAMPENER;
            // Replace the 'kda' key with 'topHeroKda' so the breakdown UI labels it correctly
            return {
                winrate: winrateZ,
                topHeroKda: topHeroKdaZ,
                avgDeaths: avgDeathsZ,
                avgDamage: avgDamageZ,
                avgHealing: avgHealingZ
            };
        }
    }
    return {
        winrate: winrateZ,
        kda: kdaZ,
        avgDeaths: avgDeathsZ,
        avgDamage: avgDamageZ,
        avgHealing: avgHealingZ
    };
}
/** Ranked path: stats anchored against the player's actual rank. */ function computeRankedRoleMMR(role, platform, competitive, stats, source, sampleSizes) {
    const baseMMR = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$algorithm$2f$rank$2d$mapping$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["rankToMMR"])(competitive.division, competitive.tier);
    if (stats.games_played < 5) {
        return {
            status: "insufficient_games",
            mmr: baseMMR,
            baseMMR,
            modifier: 0,
            confidence: "low",
            division: competitive.division,
            tier: competitive.tier,
            rankIcon: competitive.rank_icon,
            source,
            systemRank: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$algorithm$2f$rank$2d$mapping$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["mmrToRank"])(baseMMR),
            ...sampleSizes,
            reason: "insufficient_games"
        };
    }
    const zScores = computeZScores(platform, role, competitive.division, stats);
    const weights = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$algorithm$2f$weights$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ROLE_WEIGHTS"][role];
    const rawScore = zScores.winrate * weights.winrate + (zScores.topHeroKda ?? zScores.kda) * weights.kda + zScores.avgDeaths * weights.avgDeaths + zScores.avgDamage * weights.avgDamage + zScores.avgHealing * weights.avgHealing;
    const sampleWeight = sampleSizeWeight(stats.games_played);
    const rawModifier = rawScore * 150 * sampleWeight;
    const modifier = clamp(rawModifier, -300, 300);
    const estimatedMMR = Math.round(baseMMR + modifier);
    const baseConfidence = confidenceFor(sampleWeight);
    const isPotentialSmurf = stats.games_played < 30 && stats.winrate > 65 && (competitive.division === "bronze" || competitive.division === "silver");
    return {
        status: "ranked",
        mmr: estimatedMMR,
        baseMMR,
        modifier: Math.round(modifier),
        confidence: isPotentialSmurf ? "low" : baseConfidence,
        division: competitive.division,
        tier: competitive.tier,
        rankIcon: competitive.rank_icon,
        systemRank: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$algorithm$2f$rank$2d$mapping$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["mmrToRank"])(estimatedMMR),
        source,
        ...sampleSizes,
        breakdown: {
            winRateMod: Math.round(zScores.winrate * weights.winrate * 150 * sampleWeight),
            kdaMod: Math.round((zScores.topHeroKda ?? zScores.kda) * weights.kda * 150 * sampleWeight),
            roleMod: Math.round((zScores.avgDeaths * weights.avgDeaths + zScores.avgDamage * weights.avgDamage + zScores.avgHealing * weights.avgHealing) * 150 * sampleWeight),
            sampleWeight,
            zScores: zScores
        },
        reason: isPotentialSmurf ? "potential_smurf" : undefined
    };
}
/**
 * Unranked path: no Blizzard rank to anchor against. Project the raw performance
 * score against a Platinum baseline across the full ladder. The visible modifier
 * is the residual against the inferred division's base.
 */ function computeUnrankedRoleMMR(role, platform, stats, source, sampleSizes) {
    if (stats.games_played < 5) {
        return {
            status: "insufficient_games",
            mmr: 0,
            baseMMR: 0,
            modifier: 0,
            confidence: "low",
            source,
            ...sampleSizes,
            reason: "insufficient_games"
        };
    }
    const zScores = computeZScores(platform, role, UNRANKED_REFERENCE_DIVISION, stats);
    const weights = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$algorithm$2f$weights$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ROLE_WEIGHTS"][role];
    const rawScore = zScores.winrate * weights.winrate + (zScores.topHeroKda ?? zScores.kda) * weights.kda + zScores.avgDeaths * weights.avgDeaths + zScores.avgDamage * weights.avgDamage + zScores.avgHealing * weights.avgHealing;
    const sampleWeight = sampleSizeWeight(stats.games_played);
    const platinumAnchor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$algorithm$2f$rank$2d$mapping$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["rankToMMR"])("platinum", 5); // 2500
    const estimatedMMR = Math.round(clamp(platinumAnchor + rawScore * UNRANKED_MMR_SPAN * sampleWeight, 1000, 4500));
    const systemRank = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$algorithm$2f$rank$2d$mapping$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["mmrToRank"])(estimatedMMR);
    const baseMMR = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$algorithm$2f$rank$2d$mapping$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["rankToMMR"])(systemRank.division, systemRank.tier);
    const modifier = estimatedMMR - baseMMR;
    return {
        status: "ranked",
        mmr: estimatedMMR,
        baseMMR,
        modifier,
        confidence: confidenceFor(sampleWeight),
        systemRank,
        source,
        ...sampleSizes,
        breakdown: {
            winRateMod: Math.round(zScores.winrate * weights.winrate * UNRANKED_MMR_SPAN * sampleWeight),
            kdaMod: Math.round((zScores.topHeroKda ?? zScores.kda) * weights.kda * UNRANKED_MMR_SPAN * sampleWeight),
            roleMod: Math.round((zScores.avgDeaths * weights.avgDeaths + zScores.avgDamage * weights.avgDamage + zScores.avgHealing * weights.avgHealing) * UNRANKED_MMR_SPAN * sampleWeight),
            sampleWeight,
            zScores: zScores
        }
    };
}
/** Sum of games_played relevant to the active gamemode for a role on one platform. */ function relevantGames(data, role, gamemode) {
    if (!data) return 0;
    const comp = data.rankedStats[role]?.games_played ?? 0;
    const qp = data.unrankedStats[role]?.games_played ?? 0;
    if (gamemode === "ranked") return comp;
    if (gamemode === "unranked") return qp;
    return comp + qp;
}
/**
 * For platform=mixed: per role, return the platform with more games of the relevant
 * gamemode. Tie-breaker: platform where the role has a current competitive rank; else PC.
 */ function resolveRoleSource(role, byPlatform, gamemode) {
    const pcGames = relevantGames(byPlatform.pc, role, gamemode);
    const consoleGames = relevantGames(byPlatform.console, role, gamemode);
    if (pcGames > consoleGames) return "pc";
    if (consoleGames > pcGames) return "console";
    // Tie-breaker: prefer the platform where this role has a current ranked entry.
    const pcRanked = byPlatform.pc?.competitive?.[role];
    const consoleRanked = byPlatform.console?.competitive?.[role];
    if (pcRanked && !consoleRanked) return "pc";
    if (consoleRanked && !pcRanked) return "console";
    return "pc";
}
function emptyUnrankedResult(source) {
    return {
        status: "unranked",
        mmr: 0,
        baseMMR: 0,
        modifier: 0,
        confidence: "low",
        source
    };
}
function computeRoleForResolvedPlatform(role, resolvedPlatform, data, gamemode) {
    if (!data) return emptyUnrankedResult(gamemode === "unranked" ? "unranked" : "ranked");
    const competitive = data.competitive[role] ?? null;
    const rankedStats = data.rankedStats[role] ?? null;
    const unrankedStats = data.unrankedStats[role] ?? null;
    if (gamemode === "ranked") {
        if (!competitive) return emptyUnrankedResult("ranked");
        if (!rankedStats) {
            const baseMMR = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$algorithm$2f$rank$2d$mapping$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["rankToMMR"])(competitive.division, competitive.tier);
            return {
                status: "insufficient_games",
                mmr: baseMMR,
                baseMMR,
                modifier: 0,
                confidence: "low",
                division: competitive.division,
                tier: competitive.tier,
                rankIcon: competitive.rank_icon,
                systemRank: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$algorithm$2f$rank$2d$mapping$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["mmrToRank"])(baseMMR),
                source: "ranked",
                reason: "no_stats"
            };
        }
        return computeRankedRoleMMR(role, resolvedPlatform, competitive, rankedStats, "ranked", {
            competitiveGames: rankedStats.games_played
        });
    }
    if (gamemode === "unranked") {
        if (!unrankedStats) return emptyUnrankedResult("unranked");
        return computeUnrankedRoleMMR(role, resolvedPlatform, unrankedStats, "unranked", {
            quickplayGames: unrankedStats.games_played
        });
    }
    // gamemode === "both"
    const blended = blendStats(rankedStats, unrankedStats);
    if (!blended) return emptyUnrankedResult("blended");
    const sampleSizes = {
        competitiveGames: rankedStats?.games_played ?? 0,
        quickplayGames: unrankedStats?.games_played ?? 0
    };
    if (competitive) {
        return computeRankedRoleMMR(role, resolvedPlatform, competitive, blended, "blended", sampleSizes);
    }
    // No competitive rank — infer from blended stats (effectively QP-only when comp is absent).
    return computeUnrankedRoleMMR(role, resolvedPlatform, blended, "blended", sampleSizes);
}
function estimateMMR(player) {
    const perRole = {};
    for (const role of ROLES){
        let resolvedPlatform;
        let data;
        if (player.platform === "mixed") {
            resolvedPlatform = resolveRoleSource(role, player.byPlatform, player.gamemode);
            data = player.byPlatform[resolvedPlatform];
        } else {
            resolvedPlatform = player.platform;
            data = player.byPlatform[resolvedPlatform];
        }
        const result = computeRoleForResolvedPlatform(role, resolvedPlatform, data, player.gamemode);
        if (player.platform === "mixed") {
            result.resolvedPlatform = resolvedPlatform;
        }
        perRole[role] = result;
    }
    // Primary MMR: weighted average by games_played, only roles with ≥20 games and "ranked" status
    const eligible = ROLES.filter((r)=>{
        const res = perRole[r];
        if (res.status !== "ranked") return false;
        const games = (res.competitiveGames ?? 0) + (res.quickplayGames ?? 0);
        return games >= 20;
    });
    let primary = null;
    if (eligible.length > 0) {
        const totalGames = eligible.reduce((sum, r)=>sum + ((perRole[r].competitiveGames ?? 0) + (perRole[r].quickplayGames ?? 0)), 0);
        const weightedMMR = eligible.reduce((sum, r)=>{
            const games = (perRole[r].competitiveGames ?? 0) + (perRole[r].quickplayGames ?? 0);
            return sum + perRole[r].mmr * games;
        }, 0);
        const avgMMR = Math.round(weightedMMR / totalGames);
        const allHigh = eligible.every((r)=>perRole[r].confidence === "high");
        const anyLow = eligible.some((r)=>perRole[r].confidence === "low");
        const primaryConfidence = allHigh ? "high" : anyLow ? "low" : "medium";
        primary = {
            mmr: avgMMR,
            confidence: primaryConfidence,
            contributingRoles: eligible
        };
    }
    return {
        perRole,
        primary,
        algorithmVersion: ALGORITHM_VERSION
    };
}
;
}),
"[project]/lib/fetch-player.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "fetchPlayerData",
    ()=>fetchPlayerData
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$overfast$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/overfast/client.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$overfast$2f$transform$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/overfast/transform.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$overfast$2f$career$2d$transform$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/overfast/career-transform.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$algorithm$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/lib/algorithm/index.ts [app-rsc] (ecmascript) <locals>");
;
;
;
;
const RESOLVED_PLATFORMS_FOR = (platform)=>platform === "mixed" ? [
        "pc",
        "console"
    ] : [
        platform
    ];
const STATS_GAMEMODES_FOR = (gamemode)=>{
    if (gamemode === "ranked") return [
        "competitive"
    ];
    if (gamemode === "unranked") return [
        "quickplay"
    ];
    return [
        "competitive",
        "quickplay"
    ];
};
function emptyRoleMap() {
    return {
        tank: null,
        damage: null,
        support: null
    };
}
async function fetchPlayerData(tag, platform, gamemode = "ranked") {
    const platformsToFetch = RESOLVED_PLATFORMS_FOR(platform);
    const gamemodesToFetch = STATS_GAMEMODES_FOR(gamemode);
    // Build discriminated-union request list
    const requests = [
        {
            kind: "summary"
        }
    ];
    for (const p of platformsToFetch){
        for (const g of gamemodesToFetch){
            requests.push({
                kind: "stats",
                platform: p,
                gamemode: g
            });
            requests.push({
                kind: "career",
                platform: p,
                gamemode: g
            });
        }
    }
    const results = await Promise.all(requests.map(async (req)=>{
        switch(req.kind){
            case "summary":
                return {
                    kind: "summary",
                    result: await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$overfast$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getPlayerSummary"])(tag)
                };
            case "stats":
                return {
                    kind: "stats",
                    platform: req.platform,
                    gamemode: req.gamemode,
                    result: await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$overfast$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getPlayerStats"])(tag, req)
                };
            case "career":
                return {
                    kind: "career",
                    platform: req.platform,
                    gamemode: req.gamemode,
                    result: await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$overfast$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getPlayerCareer"])(tag, req)
                };
        }
    }));
    // Group results by kind
    let summaryResult;
    const statsResultsByKey = new Map();
    const careerResultsByKey = new Map();
    for (const res of results){
        switch(res.kind){
            case "summary":
                summaryResult = res.result;
                break;
            case "stats":
                statsResultsByKey.set(`${res.platform}:${res.gamemode}`, res.result);
                break;
            case "career":
                careerResultsByKey.set(`${res.platform}:${res.gamemode}`, res.result);
                break;
        }
    }
    if (!summaryResult) {
        return {
            status: "error",
            message: "Internal error: summary result missing"
        };
    }
    if (!summaryResult.ok) {
        const err = summaryResult.error;
        if (err.type === "not_found") return {
            status: "not_found"
        };
        if (err.type === "rate_limited") return {
            status: "rate_limited"
        };
        return {
            status: "error",
            message: `Upstream error: ${err.type}`
        };
    }
    const summary = summaryResult.data;
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$overfast$2f$transform$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["isPrivateSummary"])(summary)) {
        return {
            status: "private",
            username: summary.username
        };
    }
    // statsPartial indicates that one or more of the stats or career fetches failed; MMR is computed best-effort
    let statsPartial = false;
    const byPlatform = {};
    for (const p of platformsToFetch){
        let rankedStats = emptyRoleMap();
        let unrankedStats = emptyRoleMap();
        for (const g of gamemodesToFetch){
            const statsResult = statsResultsByKey.get(`${p}:${g}`);
            if (!statsResult) continue;
            if (!statsResult.ok) {
                statsPartial = true;
                continue;
            }
            const extracted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$overfast$2f$transform$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["extractRoleStats"])(statsResult.data);
            // Wire career enrichment: attach hero breakdowns when career data is available
            const careerResult = careerResultsByKey.get(`${p}:${g}`);
            if (careerResult && careerResult.ok) {
                const heroBreakdownsByRole = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$overfast$2f$career$2d$transform$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["extractHeroBreakdownByRole"])(careerResult.data);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$overfast$2f$transform$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["attachHeroBreakdowns"])(extracted, heroBreakdownsByRole);
            } else if (careerResult && !careerResult.ok) {
                statsPartial = true;
            }
            if (g === "competitive") rankedStats = extracted;
            else unrankedStats = extracted;
        }
        byPlatform[p] = {
            competitive: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$overfast$2f$transform$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["extractCompetitive"])(summary, p),
            rankedStats,
            unrankedStats
        };
    }
    const mmr = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$algorithm$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["estimateMMR"])({
        platform,
        gamemode,
        byPlatform
    });
    let season = null;
    if (platform === "mixed") {
        season = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$overfast$2f$transform$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["extractSeason"])(summary, "pc") ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$overfast$2f$transform$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["extractSeason"])(summary, "console");
    } else {
        season = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$overfast$2f$transform$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["extractSeason"])(summary, platform);
    }
    return {
        status: "ok",
        username: summary.username,
        avatar: summary.avatar ?? null,
        platform,
        gamemode,
        season,
        mmr,
        statsPartial
    };
}
}),
"[project]/lib/rank-utils.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "confidenceLabel",
    ()=>confidenceLabel,
    "divisionLabel",
    ()=>divisionLabel,
    "rankColor",
    ()=>rankColor,
    "roleColor",
    ()=>roleColor,
    "roleLabel",
    ()=>roleLabel
]);
function rankColor(division) {
    const map = {
        bronze: "var(--rank-bronze)",
        silver: "var(--rank-silver)",
        gold: "var(--rank-gold)",
        platinum: "var(--rank-platinum)",
        diamond: "var(--rank-diamond)",
        master: "var(--rank-master)",
        grandmaster: "var(--rank-grandmaster)",
        ultimate: "var(--rank-ultimate)"
    };
    return map[division] ?? "white";
}
function roleColor(role) {
    const map = {
        tank: "var(--role-tank)",
        damage: "var(--role-damage)",
        support: "var(--role-support)"
    };
    return map[role] ?? "white";
}
function roleLabel(role) {
    return role.charAt(0).toUpperCase() + role.slice(1);
}
function confidenceLabel(confidence) {
    const map = {
        high: {
            label: "High confidence",
            color: "var(--role-support)"
        },
        medium: {
            label: "Medium confidence",
            color: "var(--rank-gold)"
        },
        low: {
            label: "Low confidence",
            color: "var(--orange-accent)"
        }
    };
    return map[confidence] ?? {
        label: confidence,
        color: "white"
    };
}
function divisionLabel(division) {
    return division.charAt(0).toUpperCase() + division.slice(1);
}
}),
"[project]/components/mmr/role-card.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RoleCard",
    ()=>RoleCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rank$2d$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/rank-utils.ts [app-rsc] (ecmascript)");
;
;
function compareDivisionTier(a, b) {
    const order = [
        "bronze",
        "silver",
        "gold",
        "platinum",
        "diamond",
        "master",
        "grandmaster",
        "ultimate"
    ];
    const ai = order.indexOf(a.division);
    const bi = order.indexOf(b.division);
    if (ai !== bi) return ai - bi;
    // tier 1 is highest, tier 5 is lowest
    return b.tier - a.tier;
}
function RoleCard({ role, result, gamemode, showPlatformChip }) {
    const rColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rank$2d$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["roleColor"])(role);
    if (result.status === "unranked") {
        const reason = gamemode === "unranked" ? "No quickplay data this season" : gamemode === "both" ? "No data this season" : "Not ranked this season";
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rounded-lg p-5 flex flex-col gap-2",
            style: {
                background: "var(--surface-1)",
                border: "1px dashed var(--border-subtle)"
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-xs font-display tracking-widest uppercase",
                    style: {
                        color: rColor
                    },
                    children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rank$2d$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["roleLabel"])(role)
                }, void 0, false, {
                    fileName: "[project]/components/mmr/role-card.tsx",
                    lineNumber: 55,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-2xl font-display font-bold",
                    style: {
                        color: "var(--text-tertiary)"
                    },
                    children: "—"
                }, void 0, false, {
                    fileName: "[project]/components/mmr/role-card.tsx",
                    lineNumber: 58,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-xs font-display",
                    style: {
                        color: "var(--text-secondary)"
                    },
                    children: reason
                }, void 0, false, {
                    fileName: "[project]/components/mmr/role-card.tsx",
                    lineNumber: 64,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/mmr/role-card.tsx",
            lineNumber: 48,
            columnNumber: 7
        }, this);
    }
    // For ranked + insufficient_games and ranked statuses we share most structure
    const dLabel = result.division ? `${(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rank$2d$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["divisionLabel"])(result.division)} ${result.tier}` : "";
    const divColor = result.division ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rank$2d$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["rankColor"])(result.division) : "var(--text-primary)";
    const hasActualRank = !!result.division && result.tier != null;
    const sysRank = result.systemRank;
    // System vs Actual comparison
    let comparison = null;
    if (hasActualRank && sysRank) {
        const cmp = compareDivisionTier({
            division: sysRank.division,
            tier: sysRank.tier
        }, {
            division: result.division,
            tier: result.tier
        });
        if (cmp > 0) comparison = {
            arrow: "↑",
            color: rColor
        };
        else if (cmp < 0) comparison = {
            arrow: "↓",
            color: "var(--orange-accent)"
        };
        else comparison = {
            arrow: "=",
            color: "var(--text-tertiary)"
        };
    }
    if (result.status === "insufficient_games") {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rounded-lg p-5 flex flex-col gap-2",
            style: {
                background: "var(--surface-2)",
                border: `1px solid ${rColor}22`
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(RoleHeader, {
                    role: role,
                    rColor: rColor,
                    resolvedPlatform: result.resolvedPlatform,
                    showPlatformChip: showPlatformChip
                }, void 0, false, {
                    fileName: "[project]/components/mmr/role-card.tsx",
                    lineNumber: 101,
                    columnNumber: 9
                }, this),
                result.rankIcon && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                    src: result.rankIcon,
                    alt: dLabel,
                    className: "w-12 h-12 opacity-80"
                }, void 0, false, {
                    fileName: "[project]/components/mmr/role-card.tsx",
                    lineNumber: 108,
                    columnNumber: 11
                }, this),
                hasActualRank ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-xs font-display tracking-wide",
                    style: {
                        color: divColor
                    },
                    children: dLabel
                }, void 0, false, {
                    fileName: "[project]/components/mmr/role-card.tsx",
                    lineNumber: 111,
                    columnNumber: 11
                }, this) : sysRank ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-xs font-display tracking-wide",
                    style: {
                        color: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rank$2d$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["rankColor"])(sysRank.division)
                    },
                    children: [
                        "System: ",
                        sysRank.label
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/mmr/role-card.tsx",
                    lineNumber: 118,
                    columnNumber: 11
                }, this) : null,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-lg font-display font-bold",
                    style: {
                        color: "var(--text-secondary)"
                    },
                    children: result.mmr.toLocaleString()
                }, void 0, false, {
                    fileName: "[project]/components/mmr/role-card.tsx",
                    lineNumber: 125,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-xs font-display",
                    style: {
                        color: "var(--orange-accent)"
                    },
                    children: "Rank-only estimate · Too few games"
                }, void 0, false, {
                    fileName: "[project]/components/mmr/role-card.tsx",
                    lineNumber: 131,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/mmr/role-card.tsx",
            lineNumber: 94,
            columnNumber: 7
        }, this);
    }
    // status === "ranked"
    const conf = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rank$2d$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["confidenceLabel"])(result.confidence);
    const modifierPositive = (result.modifier ?? 0) > 0;
    const modifierZero = (result.modifier ?? 0) === 0;
    const baselineCopy = result.source === "unranked" ? "Inferred from quickplay — no Blizzard rank" : result.source === "blended" ? "vs rank baseline · blended QP+Comp" : "vs rank baseline";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "rounded-lg p-5 flex flex-col gap-3 transition-all duration-200",
        style: {
            background: "var(--surface-2)",
            border: `1px solid ${rColor}33`,
            boxShadow: `0 0 20px ${rColor}0a`
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(RoleHeader, {
                role: role,
                rColor: rColor,
                resolvedPlatform: result.resolvedPlatform,
                showPlatformChip: showPlatformChip
            }, void 0, false, {
                fileName: "[project]/components/mmr/role-card.tsx",
                lineNumber: 162,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-3",
                children: [
                    result.rankIcon && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                        src: result.rankIcon,
                        alt: dLabel,
                        className: "w-10 h-10 shrink-0"
                    }, void 0, false, {
                        fileName: "[project]/components/mmr/role-card.tsx",
                        lineNumber: 172,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col",
                        children: [
                            hasActualRank && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm font-display font-semibold tracking-wide",
                                style: {
                                    color: divColor
                                },
                                children: dLabel
                            }, void 0, false, {
                                fileName: "[project]/components/mmr/role-card.tsx",
                                lineNumber: 176,
                                columnNumber: 13
                            }, this),
                            sysRank && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs font-display tracking-wide flex items-center gap-1",
                                style: {
                                    color: hasActualRank ? "var(--text-secondary)" : (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rank$2d$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["rankColor"])(sysRank.division)
                                },
                                children: [
                                    hasActualRank ? "System: " : "",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            color: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rank$2d$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["rankColor"])(sysRank.division),
                                            fontWeight: 600
                                        },
                                        children: sysRank.label
                                    }, void 0, false, {
                                        fileName: "[project]/components/mmr/role-card.tsx",
                                        lineNumber: 189,
                                        columnNumber: 15
                                    }, this),
                                    comparison && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "ml-0.5 font-bold",
                                        style: {
                                            color: comparison.color
                                        },
                                        "aria-label": comparison.arrow === "↑" ? "Overperforming" : comparison.arrow === "↓" ? "Underperforming" : "Matches rank",
                                        children: comparison.arrow
                                    }, void 0, false, {
                                        fileName: "[project]/components/mmr/role-card.tsx",
                                        lineNumber: 193,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/mmr/role-card.tsx",
                                lineNumber: 184,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/mmr/role-card.tsx",
                        lineNumber: 174,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/mmr/role-card.tsx",
                lineNumber: 170,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-4xl font-display font-black leading-none",
                        style: {
                            letterSpacing: "-0.02em",
                            color: "var(--text-primary)"
                        },
                        children: result.mmr.toLocaleString()
                    }, void 0, false, {
                        fileName: "[project]/components/mmr/role-card.tsx",
                        lineNumber: 214,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm font-display mt-1 font-semibold",
                        style: {
                            color: modifierZero ? "var(--text-tertiary)" : modifierPositive ? "var(--role-support)" : "var(--role-damage)"
                        },
                        children: [
                            modifierZero ? "±0" : modifierPositive ? `+${result.modifier}` : result.modifier,
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs font-normal ml-1",
                                style: {
                                    color: "var(--text-tertiary)"
                                },
                                children: baselineCopy
                            }, void 0, false, {
                                fileName: "[project]/components/mmr/role-card.tsx",
                                lineNumber: 232,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/mmr/role-card.tsx",
                        lineNumber: 221,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/mmr/role-card.tsx",
                lineNumber: 213,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-2 flex-wrap",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-xs font-display tracking-wide px-2 py-0.5 rounded",
                        style: {
                            background: `${conf.color}40`,
                            color: conf.color,
                            border: `1px solid ${conf.color}55`
                        },
                        children: conf.label
                    }, void 0, false, {
                        fileName: "[project]/components/mmr/role-card.tsx",
                        lineNumber: 243,
                        columnNumber: 9
                    }, this),
                    result.reason === "potential_smurf" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-xs font-display tracking-wide px-2 py-0.5 rounded",
                        style: {
                            background: "rgba(255,124,42,0.15)",
                            color: "var(--orange-accent)",
                            border: "1px solid rgba(255,124,42,0.35)"
                        },
                        children: "⚠ New / smurf?"
                    }, void 0, false, {
                        fileName: "[project]/components/mmr/role-card.tsx",
                        lineNumber: 254,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/mmr/role-card.tsx",
                lineNumber: 242,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/mmr/role-card.tsx",
        lineNumber: 154,
        columnNumber: 5
    }, this);
}
function RoleHeader({ role, rColor, resolvedPlatform, showPlatformChip }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex items-center gap-2 flex-wrap",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs font-display tracking-widest uppercase",
                style: {
                    color: rColor
                },
                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rank$2d$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["roleLabel"])(role)
            }, void 0, false, {
                fileName: "[project]/components/mmr/role-card.tsx",
                lineNumber: 283,
                columnNumber: 7
            }, this),
            showPlatformChip && resolvedPlatform && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-[10px] font-display tracking-widest uppercase px-1.5 py-0.5 rounded",
                style: {
                    background: "rgba(0,212,255,0.08)",
                    color: "var(--cyan-accent)",
                    border: "1px solid rgba(0,212,255,0.2)"
                },
                children: [
                    "· ",
                    resolvedPlatform.toUpperCase()
                ]
            }, void 0, true, {
                fileName: "[project]/components/mmr/role-card.tsx",
                lineNumber: 290,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/mmr/role-card.tsx",
        lineNumber: 282,
        columnNumber: 5
    }, this);
}
}),
"[project]/components/mmr/primary-mmr.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "NoPrimaryMMR",
    ()=>NoPrimaryMMR,
    "PrimaryMMRDisplay",
    ()=>PrimaryMMRDisplay
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rank$2d$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/rank-utils.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$algorithm$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/lib/algorithm/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$algorithm$2f$rank$2d$mapping$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/algorithm/rank-mapping.ts [app-rsc] (ecmascript)");
;
;
;
function PrimaryMMRDisplay({ primary }) {
    const conf = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rank$2d$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["confidenceLabel"])(primary.confidence);
    const label = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$algorithm$2f$rank$2d$mapping$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["mmrToLabel"])(primary.mmr);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "text-center py-8",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs font-display tracking-[0.4em] uppercase mb-3",
                style: {
                    color: "var(--cyan-accent)"
                },
                children: "Estimated MMR"
            }, void 0, false, {
                fileName: "[project]/components/mmr/primary-mmr.tsx",
                lineNumber: 15,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative inline-block",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "font-display font-black leading-none",
                    style: {
                        fontSize: "clamp(72px, 16vw, 128px)",
                        letterSpacing: "-0.04em",
                        color: "var(--text-primary)",
                        textShadow: "0 0 40px rgba(0,212,255,0.2)"
                    },
                    children: primary.mmr.toLocaleString()
                }, void 0, false, {
                    fileName: "[project]/components/mmr/primary-mmr.tsx",
                    lineNumber: 24,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/mmr/primary-mmr.tsx",
                lineNumber: 23,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xl font-display font-semibold mt-1 tracking-wide",
                style: {
                    color: "var(--cyan-accent)"
                },
                children: label
            }, void 0, false, {
                fileName: "[project]/components/mmr/primary-mmr.tsx",
                lineNumber: 38,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm font-display mt-2 tracking-wide",
                style: {
                    color: conf.color
                },
                children: [
                    conf.label,
                    primary.contributingRoles.length < 3 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "ml-2 text-xs",
                        style: {
                            color: "var(--text-secondary)"
                        },
                        children: [
                            "(based on ",
                            primary.contributingRoles.map(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rank$2d$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["roleLabel"]).join(" + "),
                            ")"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/mmr/primary-mmr.tsx",
                        lineNumber: 52,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/mmr/primary-mmr.tsx",
                lineNumber: 46,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/mmr/primary-mmr.tsx",
        lineNumber: 14,
        columnNumber: 5
    }, this);
}
function NoPrimaryMMR({ roles }) {
    const rankedRoles = roles.filter(Boolean);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "text-center py-8",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs font-display tracking-[0.4em] uppercase mb-3",
                style: {
                    color: "var(--orange-accent)"
                },
                children: "Primary MMR"
            }, void 0, false, {
                fileName: "[project]/components/mmr/primary-mmr.tsx",
                lineNumber: 68,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-2xl font-display font-bold",
                style: {
                    color: "var(--text-primary)"
                },
                children: "—"
            }, void 0, false, {
                fileName: "[project]/components/mmr/primary-mmr.tsx",
                lineNumber: 74,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm font-display mt-2",
                style: {
                    color: "var(--text-secondary)"
                },
                children: rankedRoles.length === 0 ? "No competitive rank found on this platform" : "Need ≥20 competitive games per role for primary estimate"
            }, void 0, false, {
                fileName: "[project]/components/mmr/primary-mmr.tsx",
                lineNumber: 80,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/mmr/primary-mmr.tsx",
        lineNumber: 67,
        columnNumber: 5
    }, this);
}
}),
"[project]/components/mmr/breakdown.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AlgorithmBreakdown",
    ()=>AlgorithmBreakdown
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const AlgorithmBreakdown = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call AlgorithmBreakdown() from the server but AlgorithmBreakdown is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/components/mmr/breakdown.tsx <module evaluation>", "AlgorithmBreakdown");
}),
"[project]/components/mmr/breakdown.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AlgorithmBreakdown",
    ()=>AlgorithmBreakdown
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const AlgorithmBreakdown = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call AlgorithmBreakdown() from the server but AlgorithmBreakdown is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/components/mmr/breakdown.tsx", "AlgorithmBreakdown");
}),
"[project]/components/mmr/breakdown.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mmr$2f$breakdown$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/components/mmr/breakdown.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mmr$2f$breakdown$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/components/mmr/breakdown.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mmr$2f$breakdown$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/app/player/[tag]/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PlayerPage,
    "generateMetadata",
    ()=>generateMetadata
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/components/navigation.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$fetch$2d$player$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/fetch-player.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mmr$2f$role$2d$card$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/mmr/role-card.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mmr$2f$primary$2d$mmr$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/mmr/primary-mmr.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mmr$2f$breakdown$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/mmr/breakdown.tsx [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
function parsePlatform(raw) {
    if (raw === "console" || raw === "mixed" || raw === "pc") return raw;
    return "pc";
}
function parseGamemode(raw) {
    if (raw === "unranked" || raw === "both" || raw === "ranked") return raw;
    return "ranked";
}
async function generateMetadata({ params, searchParams }) {
    const { tag } = await params;
    const { platform } = await searchParams;
    const displayTag = tag.replace("-", "#");
    return {
        title: `${displayTag} — owMMR`,
        description: `Estimated MMR for Overwatch 2 player ${displayTag} on ${platform ?? "PC"}.`
    };
}
const ROLES = [
    "tank",
    "damage",
    "support"
];
const PLATFORMS = [
    "pc",
    "console",
    "mixed"
];
const GAMEMODES = [
    "ranked",
    "unranked",
    "both"
];
const PLATFORM_LABEL = {
    pc: "PC",
    console: "CONSOLE",
    mixed: "MIXED"
};
const GAMEMODE_LABEL = {
    ranked: "RANKED",
    unranked: "UNRANKED",
    both: "BOTH"
};
async function PlayerPage({ params, searchParams }) {
    const { tag } = await params;
    const sp = await searchParams;
    const platform = parsePlatform(sp.platform);
    const gamemode = parseGamemode(sp.gamemode);
    const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$fetch$2d$player$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["fetchPlayerData"])(tag, platform, gamemode);
    if (data.status === "not_found") (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["notFound"])();
    if (data.status === "private") {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(ErrorPage, {
            title: "Private Profile",
            message: `${data.username}'s career is set to private.`,
            detail: "They can enable it at battle.net/account/management/profile-privacy."
        }, void 0, false, {
            fileName: "[project]/app/player/[tag]/page.tsx",
            lineNumber: 63,
            columnNumber: 7
        }, this);
    }
    if (data.status === "rate_limited") {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(ErrorPage, {
            title: "Rate Limited",
            message: "We've hit the API rate limit.",
            detail: "Please wait a moment and try again."
        }, void 0, false, {
            fileName: "[project]/app/player/[tag]/page.tsx",
            lineNumber: 73,
            columnNumber: 7
        }, this);
    }
    if (data.status === "error") {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(ErrorPage, {
            title: "Upstream Error",
            message: "The OverFast API is temporarily unavailable.",
            detail: data.message
        }, void 0, false, {
            fileName: "[project]/app/player/[tag]/page.tsx",
            lineNumber: 83,
            columnNumber: 7
        }, this);
    }
    const displayTag = tag.replace(/-(?=\d{4,8}$)/, "#");
    const buildHref = (next)=>`/player/${tag}?platform=${next.platform ?? platform}&gamemode=${next.gamemode ?? gamemode}`;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen",
        style: {
            background: "var(--surface-0)",
            color: "var(--text-primary)"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 pointer-events-none opacity-30",
                style: {
                    backgroundImage: `
            linear-gradient(rgba(0,212,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,212,255,0.04) 1px, transparent 1px)
          `,
                    backgroundSize: "60px 60px"
                }
            }, void 0, false, {
                fileName: "[project]/app/player/[tag]/page.tsx",
                lineNumber: 101,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative z-10 max-w-2xl mx-auto px-4 py-8 pb-16",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                        href: "/",
                        className: "inline-flex items-center gap-2 text-xs font-display tracking-widest uppercase mb-8 transition-opacity hover:opacity-70",
                        style: {
                            color: "var(--cyan-accent)"
                        },
                        children: "← Back"
                    }, void 0, false, {
                        fileName: "[project]/app/player/[tag]/page.tsx",
                        lineNumber: 114,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-4 mb-6",
                        children: [
                            data.avatar && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                src: data.avatar,
                                alt: data.username,
                                className: "w-14 h-14 rounded-lg shrink-0",
                                style: {
                                    border: "2px solid var(--border-accent)"
                                }
                            }, void 0, false, {
                                fileName: "[project]/app/player/[tag]/page.tsx",
                                lineNumber: 125,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        className: "font-display font-black leading-none",
                                        style: {
                                            fontSize: "clamp(28px, 6vw, 42px)",
                                            letterSpacing: "-0.02em",
                                            color: "var(--text-primary)"
                                        },
                                        children: displayTag
                                    }, void 0, false, {
                                        fileName: "[project]/app/player/[tag]/page.tsx",
                                        lineNumber: 133,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-3 mt-1 flex-wrap",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs font-display tracking-widest uppercase px-2 py-0.5 rounded",
                                                style: {
                                                    background: "rgba(0,212,255,0.1)",
                                                    color: "var(--cyan-accent)",
                                                    border: "1px solid rgba(0,212,255,0.2)"
                                                },
                                                children: PLATFORM_LABEL[data.platform]
                                            }, void 0, false, {
                                                fileName: "[project]/app/player/[tag]/page.tsx",
                                                lineNumber: 144,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs font-display tracking-widest uppercase px-2 py-0.5 rounded",
                                                style: {
                                                    background: "rgba(0,212,255,0.06)",
                                                    color: "var(--cyan-accent)",
                                                    border: "1px solid rgba(0,212,255,0.15)"
                                                },
                                                children: GAMEMODE_LABEL[data.gamemode]
                                            }, void 0, false, {
                                                fileName: "[project]/app/player/[tag]/page.tsx",
                                                lineNumber: 154,
                                                columnNumber: 15
                                            }, this),
                                            data.season && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs font-display tracking-wide",
                                                style: {
                                                    color: "var(--text-tertiary)"
                                                },
                                                children: [
                                                    "Season ",
                                                    data.season
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/player/[tag]/page.tsx",
                                                lineNumber: 165,
                                                columnNumber: 17
                                            }, this),
                                            data.statsPartial && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs font-display px-2 py-0.5 rounded",
                                                style: {
                                                    background: "rgba(255,124,42,0.1)",
                                                    color: "var(--orange-accent)",
                                                    border: "1px solid rgba(255,124,42,0.2)"
                                                },
                                                children: "Stats unavailable · Rank-only estimate"
                                            }, void 0, false, {
                                                fileName: "[project]/app/player/[tag]/page.tsx",
                                                lineNumber: 173,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/player/[tag]/page.tsx",
                                        lineNumber: 143,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/player/[tag]/page.tsx",
                                lineNumber: 132,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/player/[tag]/page.tsx",
                        lineNumber: 123,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "rounded-xl mb-6 relative overflow-hidden",
                        style: {
                            background: "var(--surface-1)",
                            border: "1px solid var(--border-accent)",
                            boxShadow: "0 0 40px rgba(0,212,255,0.05)"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute inset-0 pointer-events-none",
                                style: {
                                    background: "radial-gradient(ellipse at 50% 0%, rgba(0,212,255,0.08) 0%, transparent 70%)"
                                }
                            }, void 0, false, {
                                fileName: "[project]/app/player/[tag]/page.tsx",
                                lineNumber: 197,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "relative",
                                children: data.mmr.primary ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mmr$2f$primary$2d$mmr$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PrimaryMMRDisplay"], {
                                    primary: data.mmr.primary
                                }, void 0, false, {
                                    fileName: "[project]/app/player/[tag]/page.tsx",
                                    lineNumber: 206,
                                    columnNumber: 15
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mmr$2f$primary$2d$mmr$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["NoPrimaryMMR"], {
                                    roles: ROLES
                                }, void 0, false, {
                                    fileName: "[project]/app/player/[tag]/page.tsx",
                                    lineNumber: 208,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/player/[tag]/page.tsx",
                                lineNumber: 204,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/player/[tag]/page.tsx",
                        lineNumber: 189,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6",
                        children: ROLES.map((role)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mmr$2f$role$2d$card$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["RoleCard"], {
                                role: role,
                                result: data.mmr.perRole[role],
                                gamemode: data.gamemode,
                                showPlatformChip: data.platform === "mixed"
                            }, role, false, {
                                fileName: "[project]/app/player/[tag]/page.tsx",
                                lineNumber: 216,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/app/player/[tag]/page.tsx",
                        lineNumber: 214,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "rounded-lg mb-6 overflow-hidden",
                        style: {
                            background: "var(--surface-1)",
                            border: "1px solid var(--border-subtle)"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(ToggleRow, {
                                label: "Platform",
                                options: PLATFORMS,
                                value: platform,
                                labelFor: (p)=>PLATFORM_LABEL[p],
                                hrefFor: (p)=>buildHref({
                                        platform: p
                                    })
                            }, void 0, false, {
                                fileName: "[project]/app/player/[tag]/page.tsx",
                                lineNumber: 234,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    borderTop: "1px solid var(--border-subtle)"
                                }
                            }, void 0, false, {
                                fileName: "[project]/app/player/[tag]/page.tsx",
                                lineNumber: 241,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(ToggleRow, {
                                label: "Game mode",
                                options: GAMEMODES,
                                value: gamemode,
                                labelFor: (g)=>GAMEMODE_LABEL[g],
                                hrefFor: (g)=>buildHref({
                                        gamemode: g
                                    })
                            }, void 0, false, {
                                fileName: "[project]/app/player/[tag]/page.tsx",
                                lineNumber: 242,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/player/[tag]/page.tsx",
                        lineNumber: 227,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mmr$2f$breakdown$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AlgorithmBreakdown"], {
                        mmr: data.mmr,
                        gamemode: data.gamemode
                    }, void 0, false, {
                        fileName: "[project]/app/player/[tag]/page.tsx",
                        lineNumber: 252,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs font-display text-center mt-8 tracking-wide",
                        style: {
                            color: "var(--text-disabled)"
                        },
                        children: "Unofficial estimate · Our model's estimate, not Blizzard's official MMR · Not affiliated with Blizzard Entertainment"
                    }, void 0, false, {
                        fileName: "[project]/app/player/[tag]/page.tsx",
                        lineNumber: 255,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/player/[tag]/page.tsx",
                lineNumber: 112,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/player/[tag]/page.tsx",
        lineNumber: 96,
        columnNumber: 5
    }, this);
}
function ToggleRow({ label, options, value, labelFor, hrefFor }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-wrap items-center gap-2 px-4 py-3",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-xs tracking-widest uppercase font-display mr-2 w-20 shrink-0",
                style: {
                    color: "var(--text-tertiary)"
                },
                children: label
            }, void 0, false, {
                fileName: "[project]/app/player/[tag]/page.tsx",
                lineNumber: 278,
                columnNumber: 7
            }, this),
            options.map((opt)=>{
                const active = opt === value;
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                    href: hrefFor(opt),
                    className: "px-4 py-1.5 rounded text-xs font-display tracking-widest uppercase transition-all duration-150",
                    style: {
                        background: active ? "var(--cyan-accent)" : "var(--surface-2)",
                        color: active ? "var(--surface-0)" : "var(--text-secondary)",
                        border: active ? "1px solid var(--cyan-accent)" : "1px solid var(--border-subtle)",
                        fontWeight: active ? 700 : 500
                    },
                    children: labelFor(opt)
                }, opt, false, {
                    fileName: "[project]/app/player/[tag]/page.tsx",
                    lineNumber: 287,
                    columnNumber: 11
                }, this);
            })
        ]
    }, void 0, true, {
        fileName: "[project]/app/player/[tag]/page.tsx",
        lineNumber: 277,
        columnNumber: 5
    }, this);
}
function ErrorPage({ title, message, detail }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen flex items-center justify-center px-4",
        style: {
            background: "var(--surface-0)"
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-center max-w-md",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-xs font-display tracking-[0.4em] uppercase mb-4",
                    style: {
                        color: "var(--orange-accent)"
                    },
                    children: title
                }, void 0, false, {
                    fileName: "[project]/app/player/[tag]/page.tsx",
                    lineNumber: 321,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-xl font-display font-bold mb-2",
                    style: {
                        color: "var(--text-primary)"
                    },
                    children: message
                }, void 0, false, {
                    fileName: "[project]/app/player/[tag]/page.tsx",
                    lineNumber: 327,
                    columnNumber: 9
                }, this),
                detail && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-sm font-display mb-8",
                    style: {
                        color: "var(--text-secondary)"
                    },
                    children: detail
                }, void 0, false, {
                    fileName: "[project]/app/player/[tag]/page.tsx",
                    lineNumber: 334,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                    href: "/",
                    className: "inline-block px-6 py-2.5 rounded font-display text-sm tracking-widest uppercase transition-opacity hover:opacity-80",
                    style: {
                        background: "var(--cyan-accent)",
                        color: "var(--surface-0)",
                        fontWeight: 700
                    },
                    children: "Search Again"
                }, void 0, false, {
                    fileName: "[project]/app/player/[tag]/page.tsx",
                    lineNumber: 341,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/player/[tag]/page.tsx",
            lineNumber: 320,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/player/[tag]/page.tsx",
        lineNumber: 316,
        columnNumber: 5
    }, this);
}
}),
"[project]/app/player/[tag]/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/player/[tag]/page.tsx [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0y3uzot._.js.map