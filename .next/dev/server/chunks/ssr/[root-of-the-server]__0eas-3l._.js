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
    "transformPlayerData",
    ()=>transformPlayerData
]);
const ROLES = [
    "tank",
    "damage",
    "support"
];
function transformPlayerData(summary, stats, platform) {
    const platformRanks = summary.competitive?.[platform];
    const competitive = {};
    for (const role of ROLES){
        const rank = platformRanks?.[role];
        if (rank) {
            competitive[role] = {
                division: rank.division,
                tier: rank.tier,
                rank_icon: rank.rank_icon
            };
        } else {
            competitive[role] = null;
        }
    }
    const statsRoles = stats?.roles;
    const playerStats = {};
    for (const role of ROLES){
        const rs = statsRoles?.[role];
        if (!rs) {
            playerStats[role] = null;
            continue;
        }
        playerStats[role] = {
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
    return {
        username: summary.username,
        avatar: summary.avatar ?? null,
        platform,
        isPrivate: !summary.competitive,
        competitive,
        stats: playerStats,
        season: platformRanks?.season ?? null
    };
}
}),
"[project]/lib/algorithm/rank-mapping.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "mmrToLabel",
    ()=>mmrToLabel,
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
function mmrToLabel(mmr) {
    if (mmr >= 4900) return "Top 500";
    if (mmr >= 4500) return "Champion";
    if (mmr >= 4000) return `Grandmaster ${5 - Math.floor((mmr - 4000) / 100)}`;
    if (mmr >= 3500) return `Master ${5 - Math.floor((mmr - 3500) / 100)}`;
    if (mmr >= 3000) return `Diamond ${5 - Math.floor((mmr - 3000) / 100)}`;
    if (mmr >= 2500) return `Platinum ${5 - Math.floor((mmr - 2500) / 100)}`;
    if (mmr >= 2000) return `Gold ${5 - Math.floor((mmr - 2000) / 100)}`;
    if (mmr >= 1500) return `Silver ${5 - Math.floor((mmr - 1500) / 100)}`;
    return `Bronze ${5 - Math.floor((mmr - 1000) / 100)}`;
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
const ALGORITHM_VERSION = "1.0.0";
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
function computeRoleMMR(role, platform, division, tier, stats, rankIcon) {
    const baseMMR = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$algorithm$2f$rank$2d$mapping$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["rankToMMR"])(division, tier);
    if (stats.games_played < 5) {
        return {
            status: "insufficient_games",
            mmr: baseMMR,
            baseMMR,
            modifier: 0,
            confidence: "low",
            division,
            tier,
            rankIcon,
            reason: "insufficient_games"
        };
    }
    const peers = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$algorithm$2f$peer$2d$baselines$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PEER_BASELINES"][platform][role][division];
    const weights = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$algorithm$2f$weights$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ROLE_WEIGHTS"][role];
    // z-scores for each stat (avgDeaths is inverted: lower deaths → positive z)
    const zScores = {
        winrate: zscore(stats.winrate, peers.winrate.mean, peers.winrate.stddev),
        kda: zscore(stats.kda, peers.kda.mean, peers.kda.stddev),
        avgDeaths: -zscore(stats.average.deaths, peers.avgDeaths.mean, peers.avgDeaths.stddev),
        avgDamage: zscore(stats.average.damage, peers.avgDamage.mean, peers.avgDamage.stddev),
        avgHealing: zscore(stats.average.healing, peers.avgHealing.mean, peers.avgHealing.stddev)
    };
    // Weighted sum of z-scores → raw performance score (roughly N(0,1) for average peer)
    const rawScore = zScores.winrate * weights.winrate + zScores.kda * weights.kda + zScores.avgDeaths * weights.avgDeaths + zScores.avgDamage * weights.avgDamage + zScores.avgHealing * weights.avgHealing;
    // ±2σ peer performance → ±300 MMR swing (3 divisions)
    const sampleWeight = sampleSizeWeight(stats.games_played);
    const rawModifier = rawScore * 150 * sampleWeight;
    const modifier = clamp(rawModifier, -300, 300);
    const estimatedMMR = Math.round(baseMMR + modifier);
    const confidence = sampleWeight > 0.7 ? "high" : sampleWeight > 0.4 ? "medium" : "low";
    // Flag potential smurf signal (low games, high stats, low rank)
    const isPotentialSmurf = stats.games_played < 30 && stats.winrate > 65 && (division === "bronze" || division === "silver");
    return {
        status: "ranked",
        mmr: estimatedMMR,
        baseMMR,
        modifier: Math.round(modifier),
        confidence: isPotentialSmurf ? "low" : confidence,
        division,
        tier,
        rankIcon,
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
function estimateMMR(player) {
    const roles = [
        "tank",
        "damage",
        "support"
    ];
    const perRole = {};
    for (const role of roles){
        const competitive = player.competitive[role];
        if (!competitive) {
            perRole[role] = {
                status: "unranked",
                mmr: 0,
                baseMMR: 0,
                modifier: 0,
                confidence: "low"
            };
            continue;
        }
        const stats = player.stats[role];
        if (!stats) {
            // Has rank but no stats (rare — treat like 0 games)
            const baseMMR = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$algorithm$2f$rank$2d$mapping$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["rankToMMR"])(competitive.division, competitive.tier);
            perRole[role] = {
                status: "insufficient_games",
                mmr: baseMMR,
                baseMMR,
                modifier: 0,
                confidence: "low",
                division: competitive.division,
                tier: competitive.tier,
                rankIcon: competitive.rank_icon,
                reason: "no_stats"
            };
            continue;
        }
        perRole[role] = computeRoleMMR(role, player.platform, competitive.division, competitive.tier, stats, competitive.rank_icon);
    }
    // Primary MMR: weighted average by games_played, only roles with ≥20 games and "ranked" status
    const eligible = roles.filter((r)=>perRole[r].status === "ranked" && (player.stats[r]?.games_played ?? 0) >= 20);
    let primary = null;
    if (eligible.length > 0) {
        const totalGames = eligible.reduce((sum, r)=>sum + (player.stats[r]?.games_played ?? 0), 0);
        const weightedMMR = eligible.reduce((sum, r)=>sum + perRole[r].mmr * (player.stats[r]?.games_played ?? 0), 0);
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
async function fetchPlayerData(tag, platform) {
    const [summaryResult, statsResult] = await Promise.all([
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$overfast$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getPlayerSummary"])(tag),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$overfast$2f$client$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getPlayerStats"])(tag, {
            platform,
            gamemode: "competitive"
        })
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
    const statsData = statsResult.ok ? statsResult.data : null;
    const playerData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$overfast$2f$transform$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["transformPlayerData"])(summaryResult.data, statsData, platform);
    if (playerData.isPrivate) {
        return {
            status: "private",
            username: playerData.username
        };
    }
    const mmr = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$algorithm$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["estimateMMR"])({
        platform: playerData.platform,
        competitive: playerData.competitive,
        stats: playerData.stats
    });
    return {
        status: "ok",
        username: playerData.username,
        avatar: playerData.avatar,
        platform: playerData.platform,
        season: playerData.season,
        competitive: playerData.competitive,
        mmr,
        statsPartial: !statsResult.ok
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
function RoleCard({ role, result }) {
    const rColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rank$2d$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["roleColor"])(role);
    if (result.status === "unranked") {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rounded-lg p-5 flex flex-col gap-2 opacity-40",
            style: {
                background: "var(--surface-2)",
                border: `1px solid var(--border-subtle)`
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
                    lineNumber: 21,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-2xl font-display font-bold opacity-30",
                    children: "—"
                }, void 0, false, {
                    fileName: "[project]/components/mmr/role-card.tsx",
                    lineNumber: 24,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-xs opacity-50 font-display",
                    children: "Not ranked this season"
                }, void 0, false, {
                    fileName: "[project]/components/mmr/role-card.tsx",
                    lineNumber: 25,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/mmr/role-card.tsx",
            lineNumber: 14,
            columnNumber: 7
        }, this);
    }
    if (result.status === "insufficient_games") {
        const dLabel = result.division ? `${(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rank$2d$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["divisionLabel"])(result.division)} ${result.tier}` : "—";
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rounded-lg p-5 flex flex-col gap-2",
            style: {
                background: "var(--surface-2)",
                border: `1px solid ${rColor}22`
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
                    lineNumber: 40,
                    columnNumber: 9
                }, this),
                result.rankIcon && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                    src: result.rankIcon,
                    alt: dLabel,
                    className: "w-12 h-12 opacity-60"
                }, void 0, false, {
                    fileName: "[project]/components/mmr/role-card.tsx",
                    lineNumber: 44,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-xs font-display tracking-wide",
                    style: {
                        color: result.division ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rank$2d$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["rankColor"])(result.division) : "white"
                    },
                    children: dLabel
                }, void 0, false, {
                    fileName: "[project]/components/mmr/role-card.tsx",
                    lineNumber: 46,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-lg font-display font-bold opacity-40",
                    children: result.mmr.toLocaleString()
                }, void 0, false, {
                    fileName: "[project]/components/mmr/role-card.tsx",
                    lineNumber: 52,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-xs opacity-40 font-display",
                    style: {
                        color: "var(--orange-accent)"
                    },
                    children: "Rank-only estimate · Too few games"
                }, void 0, false, {
                    fileName: "[project]/components/mmr/role-card.tsx",
                    lineNumber: 53,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/mmr/role-card.tsx",
            lineNumber: 33,
            columnNumber: 7
        }, this);
    }
    // status === "ranked"
    const dLabel = result.division ? `${(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rank$2d$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["divisionLabel"])(result.division)} ${result.tier}` : "";
    const divColor = result.division ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rank$2d$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["rankColor"])(result.division) : "white";
    const conf = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rank$2d$utils$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["confidenceLabel"])(result.confidence);
    const modifierPositive = (result.modifier ?? 0) > 0;
    const modifierZero = (result.modifier ?? 0) === 0;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "rounded-lg p-5 flex flex-col gap-3 transition-all duration-200",
        style: {
            background: "var(--surface-2)",
            border: `1px solid ${rColor}33`,
            boxShadow: `0 0 20px ${rColor}0a`
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
                lineNumber: 77,
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
                        lineNumber: 84,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm font-display font-semibold tracking-wide",
                        style: {
                            color: divColor
                        },
                        children: dLabel
                    }, void 0, false, {
                        fileName: "[project]/components/mmr/role-card.tsx",
                        lineNumber: 86,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/mmr/role-card.tsx",
                lineNumber: 82,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-4xl font-display font-black leading-none",
                        style: {
                            letterSpacing: "-0.02em",
                            color: "white"
                        },
                        children: result.mmr.toLocaleString()
                    }, void 0, false, {
                        fileName: "[project]/components/mmr/role-card.tsx",
                        lineNumber: 93,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm font-display mt-1 font-semibold",
                        style: {
                            color: modifierZero ? "rgba(255,255,255,0.3)" : modifierPositive ? "var(--role-support)" : "var(--role-damage)"
                        },
                        children: [
                            modifierZero ? "±0" : modifierPositive ? `+${result.modifier}` : result.modifier,
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs font-normal ml-1 opacity-60",
                                children: "vs rank baseline"
                            }, void 0, false, {
                                fileName: "[project]/components/mmr/role-card.tsx",
                                lineNumber: 111,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/mmr/role-card.tsx",
                        lineNumber: 100,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/mmr/role-card.tsx",
                lineNumber: 92,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-2 flex-wrap",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-xs font-display tracking-wide px-2 py-0.5 rounded",
                        style: {
                            background: `${conf.color}18`,
                            color: conf.color,
                            border: `1px solid ${conf.color}30`
                        },
                        children: conf.label
                    }, void 0, false, {
                        fileName: "[project]/components/mmr/role-card.tsx",
                        lineNumber: 117,
                        columnNumber: 9
                    }, this),
                    result.reason === "potential_smurf" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-xs font-display tracking-wide px-2 py-0.5 rounded",
                        style: {
                            background: "rgba(255,124,42,0.1)",
                            color: "var(--orange-accent)",
                            border: "1px solid rgba(255,124,42,0.3)"
                        },
                        children: "⚠ New / smurf?"
                    }, void 0, false, {
                        fileName: "[project]/components/mmr/role-card.tsx",
                        lineNumber: 128,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/mmr/role-card.tsx",
                lineNumber: 116,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/mmr/role-card.tsx",
        lineNumber: 68,
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
                    color: "var(--cyan-accent)",
                    opacity: 0.7
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
                        color: "white",
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
                    color: conf.color,
                    opacity: 0.8
                },
                children: [
                    conf.label,
                    primary.contributingRoles.length < 3 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "opacity-60 ml-2 text-xs",
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
        className: "text-center py-8 opacity-60",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs font-display tracking-[0.4em] uppercase mb-3",
                style: {
                    color: "var(--orange-accent)"
                },
                children: "Primary MMR"
            }, void 0, false, {
                fileName: "[project]/components/mmr/primary-mmr.tsx",
                lineNumber: 65,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-2xl font-display font-bold text-white",
                children: "—"
            }, void 0, false, {
                fileName: "[project]/components/mmr/primary-mmr.tsx",
                lineNumber: 71,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm font-display mt-2 opacity-60",
                children: rankedRoles.length === 0 ? "No competitive rank found on this platform" : "Need ≥20 competitive games per role for primary estimate"
            }, void 0, false, {
                fileName: "[project]/components/mmr/primary-mmr.tsx",
                lineNumber: 72,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/mmr/primary-mmr.tsx",
        lineNumber: 64,
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
async function PlayerPage({ params, searchParams }) {
    const { tag } = await params;
    const { platform: platformParam } = await searchParams;
    const platform = platformParam === "console" ? "console" : "pc";
    const data = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$fetch$2d$player$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["fetchPlayerData"])(tag, platform);
    if (data.status === "not_found") (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["notFound"])();
    if (data.status === "private") {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(ErrorPage, {
            title: "Private Profile",
            message: `${data.username}'s career is set to private.`,
            detail: "They can enable it at battle.net/account/management/profile-privacy.",
            tag: tag
        }, void 0, false, {
            fileName: "[project]/app/player/[tag]/page.tsx",
            lineNumber: 38,
            columnNumber: 7
        }, this);
    }
    if (data.status === "rate_limited") {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(ErrorPage, {
            title: "Rate Limited",
            message: "We've hit the API rate limit.",
            detail: "Please wait a moment and try again.",
            tag: tag
        }, void 0, false, {
            fileName: "[project]/app/player/[tag]/page.tsx",
            lineNumber: 49,
            columnNumber: 7
        }, this);
    }
    if (data.status === "error") {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(ErrorPage, {
            title: "Upstream Error",
            message: "The OverFast API is temporarily unavailable.",
            detail: data.message,
            tag: tag
        }, void 0, false, {
            fileName: "[project]/app/player/[tag]/page.tsx",
            lineNumber: 60,
            columnNumber: 7
        }, this);
    }
    const displayTag = tag.replace(/-(?=\d{4,8}$)/, "#");
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen",
        style: {
            background: "var(--surface-0)"
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
                lineNumber: 77,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative z-10 max-w-2xl mx-auto px-4 py-8 pb-16",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                        href: "/",
                        className: "inline-flex items-center gap-2 text-xs font-display tracking-widest uppercase mb-8 transition-opacity hover:opacity-70",
                        style: {
                            color: "var(--cyan-accent)",
                            opacity: 0.6
                        },
                        children: "← Back"
                    }, void 0, false, {
                        fileName: "[project]/app/player/[tag]/page.tsx",
                        lineNumber: 90,
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
                                lineNumber: 101,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        className: "font-display font-black leading-none",
                                        style: {
                                            fontSize: "clamp(28px, 6vw, 42px)",
                                            letterSpacing: "-0.02em"
                                        },
                                        children: displayTag
                                    }, void 0, false, {
                                        fileName: "[project]/app/player/[tag]/page.tsx",
                                        lineNumber: 109,
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
                                                children: data.platform.toUpperCase()
                                            }, void 0, false, {
                                                fileName: "[project]/app/player/[tag]/page.tsx",
                                                lineNumber: 116,
                                                columnNumber: 15
                                            }, this),
                                            data.season && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs font-display opacity-40 tracking-wide",
                                                children: [
                                                    "Season ",
                                                    data.season
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/player/[tag]/page.tsx",
                                                lineNumber: 127,
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
                                                lineNumber: 132,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/player/[tag]/page.tsx",
                                        lineNumber: 115,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/player/[tag]/page.tsx",
                                lineNumber: 108,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/player/[tag]/page.tsx",
                        lineNumber: 99,
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
                                lineNumber: 156,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "relative",
                                children: data.mmr.primary ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mmr$2f$primary$2d$mmr$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PrimaryMMRDisplay"], {
                                    primary: data.mmr.primary
                                }, void 0, false, {
                                    fileName: "[project]/app/player/[tag]/page.tsx",
                                    lineNumber: 165,
                                    columnNumber: 15
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mmr$2f$primary$2d$mmr$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["NoPrimaryMMR"], {
                                    roles: ROLES
                                }, void 0, false, {
                                    fileName: "[project]/app/player/[tag]/page.tsx",
                                    lineNumber: 167,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/player/[tag]/page.tsx",
                                lineNumber: 163,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/player/[tag]/page.tsx",
                        lineNumber: 148,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6",
                        children: ROLES.map((role)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mmr$2f$role$2d$card$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["RoleCard"], {
                                role: role,
                                result: data.mmr.perRole[role]
                            }, role, false, {
                                fileName: "[project]/app/player/[tag]/page.tsx",
                                lineNumber: 175,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/app/player/[tag]/page.tsx",
                        lineNumber: 173,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2 mb-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs tracking-widest uppercase opacity-30 font-display mr-1",
                                children: "Platform"
                            }, void 0, false, {
                                fileName: "[project]/app/player/[tag]/page.tsx",
                                lineNumber: 181,
                                columnNumber: 11
                            }, this),
                            [
                                "pc",
                                "console"
                            ].map((p)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                                    href: `/player/${tag}?platform=${p}`,
                                    className: "px-4 py-1.5 rounded text-xs font-display tracking-widest uppercase transition-all duration-150",
                                    style: {
                                        background: platform === p ? "var(--cyan-accent)" : "var(--surface-2)",
                                        color: platform === p ? "var(--surface-0)" : "rgba(255,255,255,0.4)",
                                        border: platform === p ? "1px solid var(--cyan-accent)" : "1px solid var(--border-subtle)",
                                        fontWeight: platform === p ? 700 : 400
                                    },
                                    children: p === "pc" ? "PC" : "CONSOLE"
                                }, p, false, {
                                    fileName: "[project]/app/player/[tag]/page.tsx",
                                    lineNumber: 183,
                                    columnNumber: 13
                                }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/player/[tag]/page.tsx",
                        lineNumber: 180,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$mmr$2f$breakdown$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["AlgorithmBreakdown"], {
                        mmr: data.mmr
                    }, void 0, false, {
                        fileName: "[project]/app/player/[tag]/page.tsx",
                        lineNumber: 203,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs opacity-20 font-display text-center mt-8 tracking-wide",
                        children: "Unofficial estimate · Our model's estimate, not Blizzard's official MMR · Not affiliated with Blizzard Entertainment"
                    }, void 0, false, {
                        fileName: "[project]/app/player/[tag]/page.tsx",
                        lineNumber: 206,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/player/[tag]/page.tsx",
                lineNumber: 88,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/player/[tag]/page.tsx",
        lineNumber: 72,
        columnNumber: 5
    }, this);
}
function ErrorPage({ title, message, detail, tag }) {
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
                    lineNumber: 232,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-xl font-display font-bold mb-2",
                    children: message
                }, void 0, false, {
                    fileName: "[project]/app/player/[tag]/page.tsx",
                    lineNumber: 238,
                    columnNumber: 9
                }, this),
                detail && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-sm opacity-50 font-display mb-8",
                    children: detail
                }, void 0, false, {
                    fileName: "[project]/app/player/[tag]/page.tsx",
                    lineNumber: 239,
                    columnNumber: 20
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
                    lineNumber: 240,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/player/[tag]/page.tsx",
            lineNumber: 231,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/player/[tag]/page.tsx",
        lineNumber: 227,
        columnNumber: 5
    }, this);
}
}),
"[project]/app/player/[tag]/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/app/player/[tag]/page.tsx [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0eas-3l._.js.map