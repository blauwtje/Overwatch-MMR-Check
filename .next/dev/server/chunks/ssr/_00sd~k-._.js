module.exports = [
"[project]/lib/rank-utils.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/components/mmr/breakdown.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AlgorithmBreakdown",
    ()=>AlgorithmBreakdown
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rank$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/rank-utils.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
function AlgorithmBreakdown({ mmr }) {
    const [open, setOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const roles = [
        "tank",
        "damage",
        "support"
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "rounded-lg overflow-hidden",
        style: {
            border: "1px solid var(--border-subtle)"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>setOpen(!open),
                className: "w-full flex items-center justify-between px-5 py-4 text-left transition-all duration-150 hover:bg-white/[0.03]",
                style: {
                    background: "var(--surface-1)"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs font-display tracking-widest uppercase",
                                style: {
                                    color: "var(--cyan-accent)"
                                },
                                children: "Algorithm breakdown"
                            }, void 0, false, {
                                fileName: "[project]/components/mmr/breakdown.tsx",
                                lineNumber: 27,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs font-display px-2 py-0.5 rounded",
                                style: {
                                    background: "rgba(0,212,255,0.18)",
                                    color: "var(--cyan-accent)",
                                    border: "1px solid rgba(0,212,255,0.2)"
                                },
                                children: [
                                    "v",
                                    mmr.algorithmVersion
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/mmr/breakdown.tsx",
                                lineNumber: 33,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/mmr/breakdown.tsx",
                        lineNumber: 26,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-lg transition-transform duration-200 font-display",
                        style: {
                            color: "var(--cyan-accent)",
                            transform: open ? "rotate(180deg)" : "rotate(0deg)",
                            display: "inline-block"
                        },
                        children: "↓"
                    }, void 0, false, {
                        fileName: "[project]/components/mmr/breakdown.tsx",
                        lineNumber: 44,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/mmr/breakdown.tsx",
                lineNumber: 21,
                columnNumber: 7
            }, this),
            open && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "px-5 pb-5 space-y-6",
                style: {
                    background: "var(--surface-1)"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "pt-4 pb-2 text-xs font-display tracking-wide",
                        style: {
                            borderTop: "1px solid var(--border-subtle)",
                            color: "var(--text-secondary)"
                        },
                        children: "Z-scores measure how far your stats deviate from average peers at your rank. The modifier applies log-scaled dampening based on games played."
                    }, void 0, false, {
                        fileName: "[project]/components/mmr/breakdown.tsx",
                        lineNumber: 58,
                        columnNumber: 11
                    }, this),
                    roles.map((role)=>{
                        const result = mmr.perRole[role];
                        if (result.status !== "ranked" || !result.breakdown) return null;
                        const bd = result.breakdown;
                        const rColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rank$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["roleColor"])(role);
                        const hasQPCaveat = result.source !== "ranked";
                        const showSampleSizes = result.competitiveGames !== undefined || result.quickplayGames !== undefined;
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs font-display tracking-widest uppercase mb-3",
                                    style: {
                                        color: rColor
                                    },
                                    children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rank$2d$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["roleLabel"])(role)
                                }, void 0, false, {
                                    fileName: "[project]/components/mmr/breakdown.tsx",
                                    lineNumber: 78,
                                    columnNumber: 17
                                }, this),
                                showSampleSizes && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs font-display mb-2",
                                    style: {
                                        color: "var(--text-tertiary)"
                                    },
                                    children: [
                                        result.competitiveGames !== undefined && `Comp: ${result.competitiveGames}g`,
                                        result.competitiveGames !== undefined && result.quickplayGames !== undefined && " · ",
                                        result.quickplayGames !== undefined && `QP: ${result.quickplayGames}g`
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/mmr/breakdown.tsx",
                                    lineNumber: 87,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mb-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex justify-between text-xs font-display mb-1",
                                            style: {
                                                color: "var(--text-secondary)"
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: "Sample confidence"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/mmr/breakdown.tsx",
                                                    lineNumber: 103,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: [
                                                        Math.round(bd.sampleWeight * 100),
                                                        "%"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/mmr/breakdown.tsx",
                                                    lineNumber: 104,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/mmr/breakdown.tsx",
                                            lineNumber: 99,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "h-1.5 rounded-full overflow-hidden",
                                            style: {
                                                background: "var(--surface-3)"
                                            },
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "h-full rounded-full transition-all duration-500",
                                                style: {
                                                    width: `${bd.sampleWeight * 100}%`,
                                                    background: `linear-gradient(90deg, ${rColor} 0%, var(--cyan-accent) 100%)`
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/components/mmr/breakdown.tsx",
                                                lineNumber: 110,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/components/mmr/breakdown.tsx",
                                            lineNumber: 106,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/mmr/breakdown.tsx",
                                    lineNumber: 98,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-3 gap-2 mb-3",
                                    children: [
                                        {
                                            label: "Win Rate",
                                            value: bd.winRateMod
                                        },
                                        {
                                            label: "KDA",
                                            value: bd.kdaMod
                                        },
                                        {
                                            label: "Role Stats",
                                            value: bd.roleMod
                                        }
                                    ].map(({ label, value })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "rounded p-2 text-center",
                                            style: {
                                                background: "var(--surface-2)"
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs font-display mb-1",
                                                    style: {
                                                        color: "var(--text-secondary)"
                                                    },
                                                    children: label
                                                }, void 0, false, {
                                                    fileName: "[project]/components/mmr/breakdown.tsx",
                                                    lineNumber: 132,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-base font-display font-bold",
                                                    style: {
                                                        color: value === 0 ? "var(--text-tertiary)" : value > 0 ? "var(--role-support)" : "var(--role-damage)"
                                                    },
                                                    children: value > 0 ? `+${value}` : value
                                                }, void 0, false, {
                                                    fileName: "[project]/components/mmr/breakdown.tsx",
                                                    lineNumber: 138,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, label, true, {
                                            fileName: "[project]/components/mmr/breakdown.tsx",
                                            lineNumber: 127,
                                            columnNumber: 21
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/components/mmr/breakdown.tsx",
                                    lineNumber: 121,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-1",
                                    children: Object.entries(bd.zScores).map(([stat, z])=>{
                                        const pct = Math.min(100, Math.abs(z) * 30 + 50);
                                        const isPositive = z >= 0;
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-xs font-display w-28 shrink-0 capitalize",
                                                    style: {
                                                        color: "var(--text-secondary)"
                                                    },
                                                    children: stat.replace(/([A-Z])/g, " $1").toLowerCase()
                                                }, void 0, false, {
                                                    fileName: "[project]/components/mmr/breakdown.tsx",
                                                    lineNumber: 162,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex-1 h-1 rounded-full overflow-hidden",
                                                    style: {
                                                        background: "var(--surface-3)"
                                                    },
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "h-full rounded-full",
                                                        style: {
                                                            width: `${pct}%`,
                                                            background: isPositive ? "var(--role-support)" : "var(--role-damage)",
                                                            opacity: 0.6
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/mmr/breakdown.tsx",
                                                        lineNumber: 172,
                                                        columnNumber: 27
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/components/mmr/breakdown.tsx",
                                                    lineNumber: 168,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-xs font-display w-12 text-right",
                                                    style: {
                                                        color: isPositive ? "var(--role-support)" : "var(--role-damage)"
                                                    },
                                                    children: [
                                                        z > 0 ? "+" : "",
                                                        z.toFixed(2),
                                                        "σ"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/mmr/breakdown.tsx",
                                                    lineNumber: 181,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, stat, true, {
                                            fileName: "[project]/components/mmr/breakdown.tsx",
                                            lineNumber: 161,
                                            columnNumber: 23
                                        }, this);
                                    })
                                }, void 0, false, {
                                    fileName: "[project]/components/mmr/breakdown.tsx",
                                    lineNumber: 156,
                                    columnNumber: 17
                                }, this),
                                hasQPCaveat && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs font-display mt-2",
                                    style: {
                                        color: "var(--text-tertiary)"
                                    },
                                    children: "Quickplay performance compared against competitive peer baselines — interpret with caution."
                                }, void 0, false, {
                                    fileName: "[project]/components/mmr/breakdown.tsx",
                                    lineNumber: 197,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, role, true, {
                            fileName: "[project]/components/mmr/breakdown.tsx",
                            lineNumber: 77,
                            columnNumber: 15
                        }, this);
                    }),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs font-display pt-2",
                        style: {
                            borderTop: "1px solid var(--border-subtle)",
                            color: "var(--text-disabled)"
                        },
                        children: "Peer baselines are seeded from community data and updated monthly. Estimates are not official Blizzard data."
                    }, void 0, false, {
                        fileName: "[project]/components/mmr/breakdown.tsx",
                        lineNumber: 208,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/mmr/breakdown.tsx",
                lineNumber: 57,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/mmr/breakdown.tsx",
        lineNumber: 17,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=_00sd~k-._.js.map