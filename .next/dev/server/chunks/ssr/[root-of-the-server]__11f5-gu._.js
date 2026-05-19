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
}),
"[project]/lib/overfast/transform.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
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
const ALGORITHM_VERSION = "1.1.0";
const ROLES = [
    "tank",
    "damage",
    "support"
];
const UNRANKED_REFERENCE_DIVISION = "platinum";
const UNRANKED_MMR_SPAN = 1500; // 10× the ranked coefficient
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
    return {
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
}
function computeZScores(platform, role, division, stats) {
    const peers = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$algorithm$2f$peer$2d$baselines$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PEER_BASELINES"][platform][role][division];
    return {
        winrate: zscore(stats.winrate, peers.winrate.mean, peers.winrate.stddev),
        kda: zscore(stats.kda, peers.kda.mean, peers.kda.stddev),
        avgDeaths: -zscore(stats.average.deaths, peers.avgDeaths.mean, peers.avgDeaths.stddev),
        avgDamage: zscore(stats.average.damage, peers.avgDamage.mean, peers.avgDamage.stddev),
        avgHealing: zscore(stats.average.healing, peers.avgHealing.mean, peers.avgHealing.stddev)
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
    const rawScore = zScores.winrate * weights.winrate + zScores.kda * weights.kda + zScores.avgDeaths * weights.avgDeaths + zScores.avgDamage * weights.avgDamage + zScores.avgHealing * weights.avgHealing;
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
            kdaMod: Math.round(zScores.kda * weights.kda * 150 * sampleWeight),
            roleMod: Math.round((zScores.avgDeaths * weights.avgDeaths + zScores.avgDamage * weights.avgDamage + zScores.avgHealing * weights.avgHealing) * 150 * sampleWeight),
            sampleWeight,
            zScores
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
    const rawScore = zScores.winrate * weights.winrate + zScores.kda * weights.kda + zScores.avgDeaths * weights.avgDeaths + zScores.avgDamage * weights.avgDamage + zScores.avgHealing * weights.avgHealing;
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
            kdaMod: Math.round(zScores.kda * weights.kda * UNRANKED_MMR_SPAN * sampleWeight),
            roleMod: Math.round((zScores.avgDeaths * weights.avgDeaths + zScores.avgDamage * weights.avgDamage + zScores.avgHealing * weights.avgHealing) * UNRANKED_MMR_SPAN * sampleWeight),
            sampleWeight,
            zScores
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
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$algorithm$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/lib/algorithm/index.ts [app-rsc] (ecmascript) <locals>");
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
const ROLES = [
    "tank",
    "damage",
    "support"
];
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
    const statsKeys = [];
    for (const p of platformsToFetch){
        for (const g of gamemodesToFetch){
            statsKeys.push({
                platform: p,
                gamemode: g
            });
        }
    }
    const [summaryResult, ...statsResults] = await Promise.all([
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$overfast$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getPlayerSummary"])(tag),
        ...statsKeys.map((k)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$overfast$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getPlayerStats"])(tag, k))
    ]);
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
    let statsPartial = false;
    const byPlatform = {};
    for (const p of platformsToFetch){
        let rankedStats = emptyRoleMap();
        let unrankedStats = emptyRoleMap();
        for(let i = 0; i < statsKeys.length; i++){
            if (statsKeys[i].platform !== p) continue;
            const r = statsResults[i];
            if (!r.ok) {
                statsPartial = true;
                continue;
            }
            const extracted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$overfast$2f$transform$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["extractRoleStats"])(r.data);
            if (statsKeys[i].gamemode === "competitive") rankedStats = extracted;
            else unrankedStats = extracted;
        }
        byPlatform[p] = {
            competitive: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$overfast$2f$transform$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["extractCompetitive"])(summary, p),
            rankedStats,
            unrankedStats
        };
    }
    // For ranked mode in single-platform requests, mark statsPartial only if we actually
    // wanted comp stats for that platform and the call failed.
    // (already handled above — statsPartial reflects any failed fetch among the ones we asked for)
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
    void ROLES;
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
    "DIVISION_ORDER",
    ()=>DIVISION_ORDER,
    "aggregateTierDelta",
    ()=>aggregateTierDelta,
    "compareDivisionTier",
    ()=>compareDivisionTier,
    "confidenceLabel",
    ()=>confidenceLabel,
    "divisionLabel",
    ()=>divisionLabel,
    "rankColor",
    ()=>rankColor,
    "roleColor",
    ()=>roleColor,
    "roleLabel",
    ()=>roleLabel,
    "tierDelta",
    ()=>tierDelta,
    "tierIndex",
    ()=>tierIndex,
    "verdictFor",
    ()=>verdictFor
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
const DIVISION_ORDER = [
    "bronze",
    "silver",
    "gold",
    "platinum",
    "diamond",
    "master",
    "grandmaster",
    "ultimate"
];
function tierIndex(dt) {
    const idx = DIVISION_ORDER.indexOf(dt.division);
    const clamped = Math.max(1, Math.min(5, dt.tier));
    return idx * 5 + (5 - clamped);
}
function tierDelta(system, actual) {
    return tierIndex(system) - tierIndex(actual);
}
function compareDivisionTier(a, b) {
    return Math.sign(tierIndex(a) - tierIndex(b));
}
function aggregateTierDelta(inputs) {
    const valid = inputs.filter((i)=>i.system && i.actual);
    if (valid.length === 0) return null;
    const totalGames = valid.reduce((sum, i)=>sum + i.games, 0);
    const equalWeight = totalGames === 0;
    let weightedSum = 0;
    let totalWeight = 0;
    for (const input of valid){
        const delta = tierDelta(input.system, input.actual);
        const weight = equalWeight ? 1 : input.games;
        weightedSum += delta * weight;
        totalWeight += weight;
    }
    return Math.round(weightedSum / totalWeight);
}
function verdictFor(delta, smurfFlag) {
    if (smurfFlag) {
        return {
            text: "SMURFING DETECTED",
            color: "var(--orange-accent)",
            tone: "smurf"
        };
    }
    if (delta === null) {
        return {
            text: "MODEL-INFERRED RANK",
            color: "var(--text-tertiary)",
            tone: "unknown"
        };
    }
    const muted = "color-mix(in oklab, var(--role-damage) 70%, var(--text-secondary) 30%)";
    if (delta >= 3) return {
        text: "PLAYING WAY ABOVE RANK",
        color: "var(--cyan-accent)",
        tone: "above"
    };
    if (delta === 2) return {
        text: "PLAYING 2 TIERS ABOVE RANK",
        color: "var(--cyan-accent)",
        tone: "above"
    };
    if (delta === 1) return {
        text: "PLAYING 1 TIER ABOVE RANK",
        color: "var(--cyan-accent)",
        tone: "above"
    };
    if (delta === 0) return {
        text: "PLAYING AT RANK",
        color: "var(--text-secondary)",
        tone: "neutral"
    };
    if (delta === -1) return {
        text: "PLAYING 1 TIER BELOW RANK",
        color: muted,
        tone: "below"
    };
    if (delta === -2) return {
        text: "PLAYING 2 TIERS BELOW RANK",
        color: muted,
        tone: "below"
    };
    return {
        text: "PLAYING WAY BELOW RANK",
        color: muted,
        tone: "below"
    };
}
}),
"[project]/components/mmr/rank-tile.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RankTile",
    ()=>RankTile
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rank$2d$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/rank-utils.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cpu$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__Cpu$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/cpu.mjs [app-rsc] (ecmascript) <export default as Cpu>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$crown$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__Crown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/crown.mjs [app-rsc] (ecmascript) <export default as Crown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sparkles.mjs [app-rsc] (ecmascript) <export default as Sparkles>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-rsc] (ecmascript)");
;
;
;
;
function RankTile({ rank, size, showModelIcon = false, className }) {
    const color = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rank$2d$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["rankColor"])(rank.division);
    const fontSize = Math.round(size * 0.55);
    const iconSize = Math.round(fontSize * 0.7);
    const isChampion = rank.label === "Champion";
    const isTop500 = rank.label === "Top 500";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cn"])("relative flex items-center justify-center rounded-md shrink-0", className),
        style: {
            width: size,
            height: size,
            background: `color-mix(in srgb, ${color} 12%, transparent)`,
            border: `1px solid color-mix(in srgb, ${color} 50%, transparent)`,
            boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${color} 25%, transparent)`
        },
        children: [
            isChampion ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$crown$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__Crown$3e$__["Crown"], {
                style: {
                    width: iconSize,
                    height: iconSize,
                    color
                }
            }, void 0, false, {
                fileName: "[project]/components/mmr/rank-tile.tsx",
                lineNumber: 32,
                columnNumber: 9
            }, this) : isTop500 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                style: {
                    width: iconSize,
                    height: iconSize,
                    color
                }
            }, void 0, false, {
                fileName: "[project]/components/mmr/rank-tile.tsx",
                lineNumber: 34,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "font-display font-black leading-none select-none",
                style: {
                    fontSize,
                    color
                },
                children: rank.tier
            }, void 0, false, {
                fileName: "[project]/components/mmr/rank-tile.tsx",
                lineNumber: 36,
                columnNumber: 9
            }, this),
            showModelIcon && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute top-0.5 right-0.5 pointer-events-none",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$cpu$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__Cpu$3e$__["Cpu"], {
                    style: {
                        width: 12,
                        height: 12,
                        color: "var(--cyan-accent)",
                        opacity: 0.6
                    }
                }, void 0, false, {
                    fileName: "[project]/components/mmr/rank-tile.tsx",
                    lineNumber: 45,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/mmr/rank-tile.tsx",
                lineNumber: 44,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/mmr/rank-tile.tsx",
        lineNumber: 21,
        columnNumber: 5
    }, this);
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
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mmr$2f$rank$2d$tile$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/mmr/rank-tile.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$up$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowUp$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-up.mjs [app-rsc] (ecmascript) <export default as ArrowUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$down$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-down.mjs [app-rsc] (ecmascript) <export default as ArrowDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$minus$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__Minus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/minus.mjs [app-rsc] (ecmascript) <export default as Minus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sparkles.mjs [app-rsc] (ecmascript) <export default as Sparkles>");
;
;
;
;
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
                    lineNumber: 39,
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
                    lineNumber: 42,
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
                    lineNumber: 45,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/mmr/role-card.tsx",
            lineNumber: 32,
            columnNumber: 7
        }, this);
    }
    const hasActualRank = !!result.division && result.tier != null;
    const sysRank = result.systemRank;
    const dLabel = hasActualRank ? `${(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rank$2d$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["divisionLabel"])(result.division)} ${result.tier}` : "";
    const divColor = hasActualRank ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rank$2d$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["rankColor"])(result.division) : "var(--text-tertiary)";
    // Tier delta for arrow
    let diff = null;
    if (hasActualRank && sysRank && result.status !== "insufficient_games") {
        diff = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rank$2d$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["tierDelta"])({
            division: sysRank.division,
            tier: sysRank.tier
        }, {
            division: result.division,
            tier: result.tier
        });
    }
    const modifierPositive = (result.modifier ?? 0) > 0;
    const modifierZero = (result.modifier ?? 0) === 0;
    const conf = result.status === "ranked" ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rank$2d$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["confidenceLabel"])(result.confidence) : null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "rounded-lg p-5 flex flex-col gap-4 transition-all duration-200",
        style: {
            background: "var(--surface-2)",
            border: `1px solid color-mix(in srgb, ${rColor} 20%, transparent)`,
            boxShadow: `0 0 20px color-mix(in srgb, ${rColor} 5%, transparent)`
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                                lineNumber: 84,
                                columnNumber: 11
                            }, this),
                            showPlatformChip && result.resolvedPlatform && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[10px] font-display tracking-widest uppercase px-1.5 py-0.5 rounded",
                                style: {
                                    background: "rgba(0,212,255,0.08)",
                                    color: "var(--cyan-accent)",
                                    border: "1px solid rgba(0,212,255,0.2)"
                                },
                                children: result.resolvedPlatform.toUpperCase()
                            }, void 0, false, {
                                fileName: "[project]/components/mmr/role-card.tsx",
                                lineNumber: 88,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/mmr/role-card.tsx",
                        lineNumber: 83,
                        columnNumber: 9
                    }, this),
                    result.reason === "potential_smurf" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-1 shrink-0",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                style: {
                                    width: 10,
                                    height: 10,
                                    color: "var(--orange-accent)"
                                }
                            }, void 0, false, {
                                fileName: "[project]/components/mmr/role-card.tsx",
                                lineNumber: 102,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[10px] font-display tracking-widest uppercase",
                                style: {
                                    color: "var(--orange-accent)"
                                },
                                children: "SMURF?"
                            }, void 0, false, {
                                fileName: "[project]/components/mmr/role-card.tsx",
                                lineNumber: 103,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/mmr/role-card.tsx",
                        lineNumber: 101,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/mmr/role-card.tsx",
                lineNumber: 82,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-[1fr_auto_1fr] gap-3 items-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col items-center gap-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[10px] font-display tracking-widest uppercase",
                                style: {
                                    color: "var(--text-tertiary)"
                                },
                                children: "Your Rank"
                            }, void 0, false, {
                                fileName: "[project]/components/mmr/role-card.tsx",
                                lineNumber: 117,
                                columnNumber: 11
                            }, this),
                            hasActualRank && result.rankIcon ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                src: result.rankIcon,
                                alt: dLabel,
                                className: "w-14 h-14",
                                style: {
                                    opacity: result.status === "insufficient_games" ? 0.6 : 1
                                }
                            }, void 0, false, {
                                fileName: "[project]/components/mmr/role-card.tsx",
                                lineNumber: 124,
                                columnNumber: 13
                            }, this) : hasActualRank ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-14 h-14 rounded flex items-center justify-center",
                                style: {
                                    background: "var(--surface-3)",
                                    border: `1px solid color-mix(in srgb, ${divColor} 30%, transparent)`,
                                    opacity: result.status === "insufficient_games" ? 0.6 : 1
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "font-display font-black text-xl",
                                    style: {
                                        color: divColor
                                    },
                                    children: result.tier
                                }, void 0, false, {
                                    fileName: "[project]/components/mmr/role-card.tsx",
                                    lineNumber: 139,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/mmr/role-card.tsx",
                                lineNumber: 131,
                                columnNumber: 13
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-14 h-14 rounded flex items-center justify-center",
                                style: {
                                    background: "var(--surface-3)"
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "font-display font-black text-xl",
                                    style: {
                                        color: "var(--text-tertiary)"
                                    },
                                    children: "—"
                                }, void 0, false, {
                                    fileName: "[project]/components/mmr/role-card.tsx",
                                    lineNumber: 148,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/mmr/role-card.tsx",
                                lineNumber: 144,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[11px] font-display font-semibold text-center",
                                style: {
                                    color: hasActualRank ? divColor : "var(--text-tertiary)"
                                },
                                children: hasActualRank ? dLabel : "—"
                            }, void 0, false, {
                                fileName: "[project]/components/mmr/role-card.tsx",
                                lineNumber: 153,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/mmr/role-card.tsx",
                        lineNumber: 116,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col items-center gap-0.5",
                        children: diff === null || diff === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$minus$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__Minus$3e$__["Minus"], {
                            style: {
                                width: 28,
                                height: 28,
                                color: "var(--text-tertiary)"
                            },
                            strokeWidth: 2.5
                        }, void 0, false, {
                            fileName: "[project]/components/mmr/role-card.tsx",
                            lineNumber: 164,
                            columnNumber: 13
                        }, this) : diff > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Fragment"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$up$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowUp$3e$__["ArrowUp"], {
                                    style: {
                                        width: 28,
                                        height: 28,
                                        color: "var(--cyan-accent)"
                                    },
                                    strokeWidth: 2.5
                                }, void 0, false, {
                                    fileName: "[project]/components/mmr/role-card.tsx",
                                    lineNumber: 170,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "font-mono text-xs font-bold",
                                    style: {
                                        color: "var(--cyan-accent)"
                                    },
                                    children: [
                                        "+",
                                        diff
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/mmr/role-card.tsx",
                                    lineNumber: 174,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Fragment"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$down$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowDown$3e$__["ArrowDown"], {
                                    style: {
                                        width: 28,
                                        height: 28,
                                        color: "color-mix(in oklab, var(--role-damage) 70%, var(--text-secondary) 30%)"
                                    },
                                    strokeWidth: 2.5
                                }, void 0, false, {
                                    fileName: "[project]/components/mmr/role-card.tsx",
                                    lineNumber: 180,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "font-mono text-xs font-bold",
                                    style: {
                                        color: "color-mix(in oklab, var(--role-damage) 70%, var(--text-secondary) 30%)"
                                    },
                                    children: diff
                                }, void 0, false, {
                                    fileName: "[project]/components/mmr/role-card.tsx",
                                    lineNumber: 188,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true)
                    }, void 0, false, {
                        fileName: "[project]/components/mmr/role-card.tsx",
                        lineNumber: 162,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col items-center gap-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-[10px] font-display tracking-widest uppercase",
                                style: {
                                    color: "var(--cyan-accent)"
                                },
                                children: "System Rank"
                            }, void 0, false, {
                                fileName: "[project]/components/mmr/role-card.tsx",
                                lineNumber: 200,
                                columnNumber: 11
                            }, this),
                            sysRank ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mmr$2f$rank$2d$tile$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["RankTile"], {
                                        rank: sysRank,
                                        size: 56,
                                        showModelIcon: true
                                    }, void 0, false, {
                                        fileName: "[project]/components/mmr/role-card.tsx",
                                        lineNumber: 208,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[11px] font-display font-semibold text-center",
                                        style: {
                                            color: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rank$2d$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["rankColor"])(sysRank.division)
                                        },
                                        children: sysRank.label
                                    }, void 0, false, {
                                        fileName: "[project]/components/mmr/role-card.tsx",
                                        lineNumber: 209,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-14 h-14 rounded flex items-center justify-center",
                                        style: {
                                            background: "var(--surface-3)"
                                        },
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "font-display font-black text-xl",
                                            style: {
                                                color: "var(--text-tertiary)"
                                            },
                                            children: "?"
                                        }, void 0, false, {
                                            fileName: "[project]/components/mmr/role-card.tsx",
                                            lineNumber: 222,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/mmr/role-card.tsx",
                                        lineNumber: 218,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("em", {
                                        className: "text-[11px] font-display",
                                        style: {
                                            color: "var(--text-tertiary)"
                                        },
                                        children: "no inferred rank"
                                    }, void 0, false, {
                                        fileName: "[project]/components/mmr/role-card.tsx",
                                        lineNumber: 226,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/mmr/role-card.tsx",
                        lineNumber: 199,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/mmr/role-card.tsx",
                lineNumber: 114,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center justify-between gap-2 pt-3",
                style: {
                    borderTop: "1px solid var(--border-subtle)"
                },
                children: result.status === "insufficient_games" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "font-mono text-xs",
                    style: {
                        color: "var(--text-tertiary)"
                    },
                    children: "Not enough games — showing rank only"
                }, void 0, false, {
                    fileName: "[project]/components/mmr/role-card.tsx",
                    lineNumber: 240,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "font-mono text-xs shrink-0",
                            style: {
                                color: "var(--text-tertiary)"
                            },
                            children: [
                                "MMR ",
                                result.mmr.toLocaleString()
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/mmr/role-card.tsx",
                            lineNumber: 245,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "font-mono text-xs font-bold px-1.5 py-0.5 rounded shrink-0",
                            style: {
                                color: modifierZero ? "var(--text-tertiary)" : modifierPositive ? "var(--role-support)" : "color-mix(in oklab, var(--role-damage) 70%, var(--text-secondary) 30%)",
                                background: modifierZero ? "transparent" : modifierPositive ? "rgba(91,245,160,0.1)" : "rgba(245,91,91,0.08)"
                            },
                            children: modifierZero ? "±0" : modifierPositive ? `+${result.modifier}` : result.modifier
                        }, void 0, false, {
                            fileName: "[project]/components/mmr/role-card.tsx",
                            lineNumber: 248,
                            columnNumber: 13
                        }, this),
                        conf && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-xs font-display tracking-wide px-2 py-0.5 rounded",
                            style: {
                                background: `color-mix(in srgb, ${conf.color} 15%, transparent)`,
                                color: conf.color,
                                border: `1px solid color-mix(in srgb, ${conf.color} 35%, transparent)`
                            },
                            children: conf.label
                        }, void 0, false, {
                            fileName: "[project]/components/mmr/role-card.tsx",
                            lineNumber: 266,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true)
            }, void 0, false, {
                fileName: "[project]/components/mmr/role-card.tsx",
                lineNumber: 235,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/mmr/role-card.tsx",
        lineNumber: 73,
        columnNumber: 5
    }, this);
}
}),
"[project]/components/mmr/verdict.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Verdict",
    ()=>Verdict
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rank$2d$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/rank-utils.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-rsc] (ecmascript)");
;
;
;
const GLOW_COLORS = {
    above: "rgba(0,212,255,0.25)",
    smurf: "rgba(255,124,42,0.25)"
};
function Verdict({ delta, smurfFlag, size = "md", className }) {
    const binding = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rank$2d$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["verdictFor"])(delta, smurfFlag);
    const isLarge = size === "lg";
    const glowColor = isLarge ? GLOW_COLORS[binding.tone] : undefined;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cn"])("font-display font-black uppercase tracking-[0.05em]", isLarge ? "text-2xl sm:text-3xl" : "text-xl", className),
        style: {
            color: binding.color,
            textShadow: glowColor ? `0 0 24px ${glowColor}` : undefined
        },
        children: binding.text
    }, void 0, false, {
        fileName: "[project]/components/mmr/verdict.tsx",
        lineNumber: 22,
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
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mmr$2f$rank$2d$tile$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/mmr/rank-tile.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mmr$2f$verdict$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/mmr/verdict.tsx [app-rsc] (ecmascript)");
;
;
;
;
;
const ROLES = [
    "tank",
    "damage",
    "support"
];
function PrimaryMMRDisplay({ primary, mmr }) {
    const verdictInputs = ROLES.map((role)=>{
        const r = mmr.perRole[role];
        return {
            system: r.systemRank,
            actual: r.division && r.tier != null ? {
                division: r.division,
                tier: r.tier
            } : undefined,
            games: (r.competitiveGames ?? 0) + (r.quickplayGames ?? 0)
        };
    });
    const delta = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rank$2d$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["aggregateTierDelta"])(verdictInputs);
    const smurfFlag = Object.values(mmr.perRole).some((r)=>r.reason === "potential_smurf");
    const systemRank = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$algorithm$2f$rank$2d$mapping$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["mmrToRank"])(primary.mmr);
    const conf = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rank$2d$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["confidenceLabel"])(primary.confidence);
    const rColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rank$2d$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["rankColor"])(systemRank.division);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "text-center py-8 px-4 flex flex-col items-center gap-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs font-display tracking-[0.4em] uppercase",
                style: {
                    color: "var(--cyan-accent)"
                },
                children: "System Rank"
            }, void 0, false, {
                fileName: "[project]/components/mmr/primary-mmr.tsx",
                lineNumber: 35,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col items-center gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mmr$2f$rank$2d$tile$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["RankTile"], {
                        rank: systemRank,
                        size: 128,
                        showModelIcon: false
                    }, void 0, false, {
                        fileName: "[project]/components/mmr/primary-mmr.tsx",
                        lineNumber: 43,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "font-display font-black leading-none",
                        style: {
                            fontSize: "clamp(48px, 11vw, 88px)",
                            letterSpacing: "-0.03em",
                            color: rColor,
                            textShadow: `0 0 40px color-mix(in srgb, ${rColor} 25%, transparent)`
                        },
                        children: systemRank.label.toUpperCase()
                    }, void 0, false, {
                        fileName: "[project]/components/mmr/primary-mmr.tsx",
                        lineNumber: 44,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/mmr/primary-mmr.tsx",
                lineNumber: 42,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mmr$2f$verdict$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Verdict"], {
                delta: delta,
                smurfFlag: smurfFlag,
                size: "lg",
                className: "mb-4"
            }, void 0, false, {
                fileName: "[project]/components/mmr/primary-mmr.tsx",
                lineNumber: 57,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "font-mono text-sm",
                style: {
                    color: "var(--text-tertiary)"
                },
                children: [
                    "MMR ",
                    primary.mmr,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "mx-1",
                        children: "·"
                    }, void 0, false, {
                        fileName: "[project]/components/mmr/primary-mmr.tsx",
                        lineNumber: 61,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        style: {
                            color: conf.color
                        },
                        children: conf.label.toLowerCase()
                    }, void 0, false, {
                        fileName: "[project]/components/mmr/primary-mmr.tsx",
                        lineNumber: 62,
                        columnNumber: 9
                    }, this),
                    primary.contributingRoles.length < 3 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: [
                            " ",
                            "· based on ",
                            primary.contributingRoles.map(__TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rank$2d$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["roleLabel"]).join(" + ")
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/mmr/primary-mmr.tsx",
                        lineNumber: 64,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/mmr/primary-mmr.tsx",
                lineNumber: 59,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/mmr/primary-mmr.tsx",
        lineNumber: 34,
        columnNumber: 5
    }, this);
}
function NoPrimaryMMR({ roles }) {
    const hasRoles = roles.filter(Boolean).length > 0;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "text-center py-8 px-4 flex flex-col items-center gap-3",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs font-display tracking-[0.4em] uppercase",
                style: {
                    color: "var(--orange-accent)"
                },
                children: "Insufficient Sample"
            }, void 0, false, {
                fileName: "[project]/components/mmr/primary-mmr.tsx",
                lineNumber: 75,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "font-display font-black",
                style: {
                    fontSize: "clamp(48px, 11vw, 88px)",
                    letterSpacing: "-0.03em",
                    color: "var(--text-primary)"
                },
                children: "—"
            }, void 0, false, {
                fileName: "[project]/components/mmr/primary-mmr.tsx",
                lineNumber: 81,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm font-display",
                style: {
                    color: "var(--text-secondary)"
                },
                children: !hasRoles ? "No competitive rank found on this platform" : "Not enough games — showing rank only"
            }, void 0, false, {
                fileName: "[project]/components/mmr/primary-mmr.tsx",
                lineNumber: 87,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/mmr/primary-mmr.tsx",
        lineNumber: 74,
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
"[project]/components/mmr/role-icon.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RoleIcon",
    ()=>RoleIcon
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
;
function RoleIcon({ role, size = 24, className, style }) {
    const shared = {
        width: size,
        height: size,
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        className,
        style
    };
    if (role === "tank") {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            viewBox: "0 0 24 24",
            ...shared,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M4 3 L20 3 L20 13 Q20 18 12 21 Q4 18 4 13 Z"
            }, void 0, false, {
                fileName: "[project]/components/mmr/role-icon.tsx",
                lineNumber: 27,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/components/mmr/role-icon.tsx",
            lineNumber: 26,
            columnNumber: 7
        }, this);
    }
    if (role === "damage") {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            viewBox: "0 0 24 24",
            ...shared,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                    cx: "12",
                    cy: "12",
                    r: "7"
                }, void 0, false, {
                    fileName: "[project]/components/mmr/role-icon.tsx",
                    lineNumber: 34,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                    cx: "12",
                    cy: "12",
                    r: "2"
                }, void 0, false, {
                    fileName: "[project]/components/mmr/role-icon.tsx",
                    lineNumber: 35,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                    x1: "12",
                    y1: "2",
                    x2: "12",
                    y2: "5"
                }, void 0, false, {
                    fileName: "[project]/components/mmr/role-icon.tsx",
                    lineNumber: 36,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                    x1: "12",
                    y1: "19",
                    x2: "12",
                    y2: "22"
                }, void 0, false, {
                    fileName: "[project]/components/mmr/role-icon.tsx",
                    lineNumber: 37,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                    x1: "2",
                    y1: "12",
                    x2: "5",
                    y2: "12"
                }, void 0, false, {
                    fileName: "[project]/components/mmr/role-icon.tsx",
                    lineNumber: 38,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                    x1: "19",
                    y1: "12",
                    x2: "22",
                    y2: "12"
                }, void 0, false, {
                    fileName: "[project]/components/mmr/role-icon.tsx",
                    lineNumber: 39,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/mmr/role-icon.tsx",
            lineNumber: 33,
            columnNumber: 7
        }, this);
    }
    // support
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        viewBox: "0 0 24 24",
        ...shared,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                x: "10",
                y: "3",
                width: "4",
                height: "18",
                rx: "2"
            }, void 0, false, {
                fileName: "[project]/components/mmr/role-icon.tsx",
                lineNumber: 46,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                x: "3",
                y: "10",
                width: "18",
                height: "4",
                rx: "2"
            }, void 0, false, {
                fileName: "[project]/components/mmr/role-icon.tsx",
                lineNumber: 47,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/mmr/role-icon.tsx",
        lineNumber: 45,
        columnNumber: 5
    }, this);
}
}),
"[project]/components/mmr/share-button.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ShareButton",
    ()=>ShareButton
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const ShareButton = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call ShareButton() from the server but ShareButton is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/components/mmr/share-button.tsx <module evaluation>", "ShareButton");
}),
"[project]/components/mmr/share-button.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ShareButton",
    ()=>ShareButton
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const ShareButton = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call ShareButton() from the server but ShareButton is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/components/mmr/share-button.tsx", "ShareButton");
}),
"[project]/components/mmr/share-button.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mmr$2f$share$2d$button$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/components/mmr/share-button.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mmr$2f$share$2d$button$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/components/mmr/share-button.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mmr$2f$share$2d$button$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/components/mmr/share-card.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ShareCard",
    ()=>ShareCard
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rank$2d$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/rank-utils.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$algorithm$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/lib/algorithm/index.ts [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$algorithm$2f$rank$2d$mapping$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/algorithm/rank-mapping.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mmr$2f$verdict$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/mmr/verdict.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mmr$2f$role$2d$icon$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/mmr/role-icon.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mmr$2f$share$2d$button$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/mmr/share-button.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$up$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowUp$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-up.mjs [app-rsc] (ecmascript) <export default as ArrowUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$down$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-down.mjs [app-rsc] (ecmascript) <export default as ArrowDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$minus$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__Minus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/minus.mjs [app-rsc] (ecmascript) <export default as Minus>");
;
;
;
;
;
;
;
const ROLES = [
    "tank",
    "damage",
    "support"
];
const ROLE_SHORT = {
    tank: "TANK",
    damage: "DPS",
    support: "SUP"
};
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
function ShareCard({ username, displayTag, avatar, platform, gamemode, mmr, shareUrl }) {
    const verdictInputs = ROLES.map((role)=>{
        const r = mmr.perRole[role];
        return {
            system: r.systemRank,
            actual: r.division && r.tier != null ? {
                division: r.division,
                tier: r.tier
            } : undefined,
            games: (r.competitiveGames ?? 0) + (r.quickplayGames ?? 0)
        };
    });
    const delta = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rank$2d$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["aggregateTierDelta"])(verdictInputs);
    const smurfFlag = Object.values(mmr.perRole).some((r)=>r.reason === "potential_smurf");
    const binding = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rank$2d$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["verdictFor"])(delta, smurfFlag);
    const primaryMissing = mmr.primary == null && ROLES.every((r)=>mmr.perRole[r].status !== "ranked");
    const shareText = `${binding.text} — ${displayTag}`;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        id: "share-card-root",
        className: "rounded-xl relative overflow-hidden mb-6",
        style: {
            background: "var(--surface-1)",
            border: "1px solid var(--border-accent)",
            boxShadow: "0 0 60px rgba(0,212,255,0.08)"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "scanlines absolute inset-0 pointer-events-none opacity-40",
                style: {
                    zIndex: 0
                }
            }, void 0, false, {
                fileName: "[project]/components/mmr/share-card.tsx",
                lineNumber: 71,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 pointer-events-none",
                style: {
                    background: "radial-gradient(ellipse at 0% 0%, rgba(0,212,255,0.06) 0%, transparent 60%)",
                    zIndex: 0
                }
            }, void 0, false, {
                fileName: "[project]/components/mmr/share-card.tsx",
                lineNumber: 73,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative",
                style: {
                    zIndex: 1
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-start gap-4 p-5 sm:p-6",
                        children: [
                            avatar ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                src: avatar,
                                alt: username,
                                className: "w-16 h-16 rounded-lg shrink-0",
                                style: {
                                    border: "2px solid var(--cyan-accent)"
                                }
                            }, void 0, false, {
                                fileName: "[project]/components/mmr/share-card.tsx",
                                lineNumber: 85,
                                columnNumber: 13
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-16 h-16 rounded-lg shrink-0 flex items-center justify-center",
                                style: {
                                    background: "var(--surface-3)",
                                    border: "2px solid var(--border-accent)"
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "font-display font-black text-xl",
                                    style: {
                                        color: "var(--text-tertiary)"
                                    },
                                    children: username.charAt(0).toUpperCase()
                                }, void 0, false, {
                                    fileName: "[project]/components/mmr/share-card.tsx",
                                    lineNumber: 96,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/mmr/share-card.tsx",
                                lineNumber: 92,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex-1 min-w-0",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        className: "font-display font-black leading-none truncate",
                                        style: {
                                            fontSize: "clamp(24px, 5vw, 36px)",
                                            letterSpacing: "-0.02em",
                                            color: "var(--text-primary)"
                                        },
                                        children: displayTag
                                    }, void 0, false, {
                                        fileName: "[project]/components/mmr/share-card.tsx",
                                        lineNumber: 103,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2 mt-1.5 flex-wrap",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[10px] font-display tracking-widest uppercase px-1.5 py-0.5 rounded",
                                                style: {
                                                    background: "rgba(0,212,255,0.1)",
                                                    color: "var(--cyan-accent)",
                                                    border: "1px solid rgba(0,212,255,0.2)"
                                                },
                                                children: PLATFORM_LABEL[platform]
                                            }, void 0, false, {
                                                fileName: "[project]/components/mmr/share-card.tsx",
                                                lineNumber: 114,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[10px] font-display tracking-widest uppercase px-1.5 py-0.5 rounded",
                                                style: {
                                                    background: "rgba(0,212,255,0.06)",
                                                    color: "var(--cyan-accent)",
                                                    border: "1px solid rgba(0,212,255,0.15)"
                                                },
                                                children: GAMEMODE_LABEL[gamemode]
                                            }, void 0, false, {
                                                fileName: "[project]/components/mmr/share-card.tsx",
                                                lineNumber: 124,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/mmr/share-card.tsx",
                                        lineNumber: 113,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/mmr/share-card.tsx",
                                lineNumber: 102,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mmr$2f$share$2d$button$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ShareButton"], {
                                title: `owMMR — ${displayTag}`,
                                text: shareText,
                                url: shareUrl,
                                className: "shrink-0 mt-0.5"
                            }, void 0, false, {
                                fileName: "[project]/components/mmr/share-card.tsx",
                                lineNumber: 137,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/mmr/share-card.tsx",
                        lineNumber: 83,
                        columnNumber: 9
                    }, this),
                    !primaryMissing && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "px-5 sm:px-6 py-3 text-center",
                        style: {
                            borderTop: "1px solid var(--border-subtle)"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mmr$2f$verdict$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Verdict"], {
                                delta: delta,
                                smurfFlag: smurfFlag,
                                size: "md"
                            }, void 0, false, {
                                fileName: "[project]/components/mmr/share-card.tsx",
                                lineNumber: 151,
                                columnNumber: 13
                            }, this),
                            mmr.primary && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "font-mono text-xs mt-1",
                                style: {
                                    color: "var(--text-tertiary)"
                                },
                                children: [
                                    "MMR ",
                                    mmr.primary.mmr,
                                    " · ",
                                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$algorithm$2f$rank$2d$mapping$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["mmrToLabel"])(mmr.primary.mmr)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/mmr/share-card.tsx",
                                lineNumber: 153,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/mmr/share-card.tsx",
                        lineNumber: 147,
                        columnNumber: 11
                    }, this),
                    primaryMissing && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "px-5 sm:px-6 py-3 text-center",
                        style: {
                            borderTop: "1px solid var(--border-subtle)"
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "font-display text-sm",
                            style: {
                                color: "var(--text-secondary)"
                            },
                            children: "No MMR estimate available — try a different platform/gamemode"
                        }, void 0, false, {
                            fileName: "[project]/components/mmr/share-card.tsx",
                            lineNumber: 165,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/mmr/share-card.tsx",
                        lineNumber: 161,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-3 gap-px",
                        style: {
                            background: "var(--border-subtle)",
                            borderTop: "1px solid var(--border-subtle)"
                        },
                        children: ROLES.map((role)=>{
                            const r = mmr.perRole[role];
                            const rColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rank$2d$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["roleColor"])(role);
                            const hasActual = !!r.division && r.tier != null;
                            const actualLabel = hasActual ? `${(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rank$2d$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["divisionLabel"])(r.division)} ${r.tier}` : "—";
                            const actualColor = hasActual ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rank$2d$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["rankColor"])(r.division) : "var(--text-tertiary)";
                            let diff = null;
                            if (hasActual && r.systemRank) {
                                diff = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rank$2d$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["tierDelta"])({
                                    division: r.systemRank.division,
                                    tier: r.systemRank.tier
                                }, {
                                    division: r.division,
                                    tier: r.tier
                                });
                            }
                            const arrowColor = diff === null || diff === 0 ? "var(--text-tertiary)" : diff > 0 ? "var(--cyan-accent)" : "color-mix(in oklab, var(--role-damage) 70%, var(--text-secondary) 30%)";
                            const magnitude = diff === null || diff === 0 ? "" : diff > 0 ? `+${diff}` : `${diff}`;
                            const sysLabel = r.systemRank ? r.systemRank.label : "—";
                            const sysColor = r.systemRank ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rank$2d$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["rankColor"])(r.systemRank.division) : "var(--text-tertiary)";
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col items-center gap-1 px-2 py-3",
                                style: {
                                    background: "var(--surface-1)"
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mmr$2f$role$2d$icon$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["RoleIcon"], {
                                                role: role,
                                                size: 14,
                                                style: {
                                                    color: rColor
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/components/mmr/share-card.tsx",
                                                lineNumber: 219,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[10px] font-display tracking-widest uppercase",
                                                style: {
                                                    color: rColor
                                                },
                                                children: ROLE_SHORT[role]
                                            }, void 0, false, {
                                                fileName: "[project]/components/mmr/share-card.tsx",
                                                lineNumber: 220,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/mmr/share-card.tsx",
                                        lineNumber: 218,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[11px] font-display font-semibold",
                                        style: {
                                            color: actualColor
                                        },
                                        children: actualLabel
                                    }, void 0, false, {
                                        fileName: "[project]/components/mmr/share-card.tsx",
                                        lineNumber: 227,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-0.5 min-h-[14px]",
                                        children: [
                                            diff === null || diff === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$minus$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__Minus$3e$__["Minus"], {
                                                style: {
                                                    width: 10,
                                                    height: 10,
                                                    color: arrowColor
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/components/mmr/share-card.tsx",
                                                lineNumber: 235,
                                                columnNumber: 21
                                            }, this) : diff > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$up$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowUp$3e$__["ArrowUp"], {
                                                style: {
                                                    width: 10,
                                                    height: 10,
                                                    color: arrowColor
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/components/mmr/share-card.tsx",
                                                lineNumber: 237,
                                                columnNumber: 21
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$down$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowDown$3e$__["ArrowDown"], {
                                                style: {
                                                    width: 10,
                                                    height: 10,
                                                    color: arrowColor
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/components/mmr/share-card.tsx",
                                                lineNumber: 239,
                                                columnNumber: 21
                                            }, this),
                                            magnitude && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "font-mono text-[10px]",
                                                style: {
                                                    color: arrowColor
                                                },
                                                children: magnitude
                                            }, void 0, false, {
                                                fileName: "[project]/components/mmr/share-card.tsx",
                                                lineNumber: 242,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/mmr/share-card.tsx",
                                        lineNumber: 233,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[11px] font-display font-semibold",
                                        style: {
                                            color: sysColor
                                        },
                                        children: sysLabel
                                    }, void 0, false, {
                                        fileName: "[project]/components/mmr/share-card.tsx",
                                        lineNumber: 247,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, role, true, {
                                fileName: "[project]/components/mmr/share-card.tsx",
                                lineNumber: 213,
                                columnNumber: 15
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/components/mmr/share-card.tsx",
                        lineNumber: 172,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between px-5 py-2.5",
                        style: {
                            background: "rgba(0,0,0,0.3)",
                            borderTop: "1px solid var(--border-subtle)"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "font-display font-black text-sm",
                                style: {
                                    color: "var(--text-primary)"
                                },
                                children: [
                                    "ow",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("em", {
                                        style: {
                                            fontStyle: "italic",
                                            color: "var(--cyan-accent)"
                                        },
                                        children: "MMR"
                                    }, void 0, false, {
                                        fileName: "[project]/components/mmr/share-card.tsx",
                                        lineNumber: 267,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/mmr/share-card.tsx",
                                lineNumber: 266,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "font-mono text-[10px]",
                                style: {
                                    color: "var(--text-disabled)"
                                },
                                children: [
                                    "v",
                                    mmr.algorithmVersion
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/mmr/share-card.tsx",
                                lineNumber: 269,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/mmr/share-card.tsx",
                        lineNumber: 259,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/mmr/share-card.tsx",
                lineNumber: 81,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/mmr/share-card.tsx",
        lineNumber: 61,
        columnNumber: 5
    }, this);
}
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$fetch$2d$player$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/fetch-player.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mmr$2f$role$2d$card$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/mmr/role-card.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mmr$2f$primary$2d$mmr$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/mmr/primary-mmr.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mmr$2f$breakdown$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/mmr/breakdown.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mmr$2f$share$2d$card$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/mmr/share-card.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/triangle-alert.mjs [app-rsc] (ecmascript) <export default as AlertTriangle>");
;
;
;
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
            lineNumber: 66,
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
            lineNumber: 76,
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
            lineNumber: 86,
            columnNumber: 7
        }, this);
    }
    const displayTag = tag.replace(/-(?=\d{4,8}$)/, "#");
    const buildHref = (next)=>`/player/${tag}?platform=${next.platform ?? platform}&gamemode=${next.gamemode ?? gamemode}`;
    // Build canonical share URL from request headers
    const h = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["headers"])();
    const host = h.get("host") ?? "owmmr.app";
    const proto = h.get("x-forwarded-proto") ?? "https";
    const qs = new URLSearchParams();
    if (sp.platform) qs.set("platform", sp.platform);
    if (sp.gamemode) qs.set("gamemode", sp.gamemode);
    const qsStr = qs.toString();
    const shareUrl = `${proto}://${host}/player/${tag}${qsStr ? `?${qsStr}` : ""}`;
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
                lineNumber: 114,
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
                        lineNumber: 127,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mmr$2f$share$2d$card$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ShareCard"], {
                        username: data.username,
                        displayTag: displayTag,
                        avatar: data.avatar,
                        platform: data.platform,
                        gamemode: data.gamemode,
                        mmr: data.mmr,
                        shareUrl: shareUrl
                    }, void 0, false, {
                        fileName: "[project]/app/player/[tag]/page.tsx",
                        lineNumber: 136,
                        columnNumber: 9
                    }, this),
                    data.statsPartial && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-3 px-4 py-2.5 rounded-lg mb-6 text-sm font-display",
                        style: {
                            background: "rgba(255,124,42,0.08)",
                            border: "1px solid rgba(255,124,42,0.2)",
                            borderLeftWidth: "3px",
                            borderLeftColor: "var(--orange-accent)",
                            color: "var(--text-secondary)"
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$triangle$2d$alert$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertTriangle$3e$__["AlertTriangle"], {
                                style: {
                                    width: 14,
                                    height: 14,
                                    color: "var(--orange-accent)",
                                    flexShrink: 0
                                }
                            }, void 0, false, {
                                fileName: "[project]/app/player/[tag]/page.tsx",
                                lineNumber: 158,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "Some stats are unavailable — estimate may be less precise"
                            }, void 0, false, {
                                fileName: "[project]/app/player/[tag]/page.tsx",
                                lineNumber: 161,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/player/[tag]/page.tsx",
                        lineNumber: 148,
                        columnNumber: 11
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
                                lineNumber: 174,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "relative",
                                children: data.mmr.primary ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mmr$2f$primary$2d$mmr$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PrimaryMMRDisplay"], {
                                    primary: data.mmr.primary,
                                    mmr: data.mmr
                                }, void 0, false, {
                                    fileName: "[project]/app/player/[tag]/page.tsx",
                                    lineNumber: 183,
                                    columnNumber: 15
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mmr$2f$primary$2d$mmr$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["NoPrimaryMMR"], {
                                    roles: ROLES
                                }, void 0, false, {
                                    fileName: "[project]/app/player/[tag]/page.tsx",
                                    lineNumber: 185,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/player/[tag]/page.tsx",
                                lineNumber: 181,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/player/[tag]/page.tsx",
                        lineNumber: 166,
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
                                lineNumber: 198,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    borderTop: "1px solid var(--border-subtle)"
                                }
                            }, void 0, false, {
                                fileName: "[project]/app/player/[tag]/page.tsx",
                                lineNumber: 205,
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
                                lineNumber: 206,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/player/[tag]/page.tsx",
                        lineNumber: 191,
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
                                lineNumber: 218,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/app/player/[tag]/page.tsx",
                        lineNumber: 216,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mmr$2f$breakdown$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AlgorithmBreakdown"], {
                        mmr: data.mmr,
                        gamemode: data.gamemode
                    }, void 0, false, {
                        fileName: "[project]/app/player/[tag]/page.tsx",
                        lineNumber: 229,
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
                        lineNumber: 232,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/player/[tag]/page.tsx",
                lineNumber: 125,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/player/[tag]/page.tsx",
        lineNumber: 109,
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
                lineNumber: 255,
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
                    lineNumber: 264,
                    columnNumber: 11
                }, this);
            })
        ]
    }, void 0, true, {
        fileName: "[project]/app/player/[tag]/page.tsx",
        lineNumber: 254,
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
                    lineNumber: 298,
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
                    lineNumber: 304,
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
                    lineNumber: 311,
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
                    lineNumber: 318,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/player/[tag]/page.tsx",
            lineNumber: 297,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/player/[tag]/page.tsx",
        lineNumber: 293,
        columnNumber: 5
    }, this);
}
}),
"[project]/app/player/[tag]/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/player/[tag]/page.tsx [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__11f5-gu._.js.map