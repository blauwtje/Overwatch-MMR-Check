(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/mmr/hero-portrait.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "HeroPortrait",
    ()=>HeroPortrait
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
const SIZE_PX = {
    sm: 40,
    md: 56,
    lg: 80
};
const ROLE_COLORS = {
    tank: "#5b9ef5",
    damage: "#f55b5b",
    support: "#5bf5a0"
};
function HeroPortrait({ heroKey, role, size = "md", className }) {
    _s();
    const [imgError, setImgError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const px = SIZE_PX[size];
    const color = ROLE_COLORS[role];
    if (!imgError) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
            src: `/heroes/${heroKey}.webp`,
            alt: heroKey,
            width: px,
            height: px,
            onError: ()=>setImgError(true),
            className: className,
            style: {
                width: px,
                height: px,
                objectFit: "cover",
                borderRadius: 4
            }
        }, void 0, false, {
            fileName: "[project]/components/mmr/hero-portrait.tsx",
            lineNumber: 29,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: className,
        style: {
            width: px,
            height: px,
            borderRadius: 4,
            background: `linear-gradient(160deg, color-mix(in srgb, ${color} 10%, transparent), color-mix(in srgb, ${color} 22%, transparent))`,
            border: `1px solid color-mix(in srgb, ${color} 28%, transparent)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        },
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            viewBox: "0 0 24 24",
            fill: "currentColor",
            style: {
                width: px * 0.55,
                height: px * 0.55,
                color,
                opacity: 0.35
            },
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"
            }, void 0, false, {
                fileName: "[project]/components/mmr/hero-portrait.tsx",
                lineNumber: 60,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/components/mmr/hero-portrait.tsx",
            lineNumber: 55,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/mmr/hero-portrait.tsx",
        lineNumber: 42,
        columnNumber: 5
    }, this);
}
_s(HeroPortrait, "0doYx/lFKmVVbvtO/eWR8SJrtgo=");
_c = HeroPortrait;
var _c;
__turbopack_context__.k.register(_c, "HeroPortrait");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/rank-utils.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/mmr/breakdown.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AlgorithmBreakdown",
    ()=>AlgorithmBreakdown
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rank$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/rank-utils.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
const ZSCORE_LABELS = {
    winrate: "Win rate",
    kda: "KDA",
    avgDeaths: "Avg deaths",
    avgDamage: "Avg damage",
    avgHealing: "Avg healing",
    topHeroKda: "Top hero KDA"
};
function AlgorithmBreakdown({ mmr }) {
    _s();
    const [open, setOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const roles = [
        "tank",
        "damage",
        "support"
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "rounded-lg overflow-hidden",
        style: {
            border: "1px solid var(--border-subtle)"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>setOpen(!open),
                className: "lg:hidden w-full flex items-center justify-between px-5 py-4 text-left transition-all duration-150 hover:bg-white/[0.03]",
                style: {
                    background: "var(--surface-1)"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs font-display tracking-widest uppercase",
                                style: {
                                    color: "var(--cyan-accent)"
                                },
                                children: "Algorithm breakdown"
                            }, void 0, false, {
                                fileName: "[project]/components/mmr/breakdown.tsx",
                                lineNumber: 37,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                                lineNumber: 43,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/mmr/breakdown.tsx",
                        lineNumber: 36,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-lg transition-transform duration-200 font-display",
                        style: {
                            color: "var(--cyan-accent)",
                            transform: open ? "rotate(180deg)" : "rotate(0deg)",
                            display: "inline-block"
                        },
                        children: "↓"
                    }, void 0, false, {
                        fileName: "[project]/components/mmr/breakdown.tsx",
                        lineNumber: 54,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/mmr/breakdown.tsx",
                lineNumber: 31,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "hidden lg:flex items-center gap-3 px-5 py-4",
                style: {
                    background: "var(--surface-1)",
                    borderBottom: "1px solid var(--border-subtle)"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-xs font-display tracking-widest uppercase",
                        style: {
                            color: "var(--cyan-accent)"
                        },
                        children: "Algorithm breakdown"
                    }, void 0, false, {
                        fileName: "[project]/components/mmr/breakdown.tsx",
                        lineNumber: 71,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                        lineNumber: 77,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/mmr/breakdown.tsx",
                lineNumber: 67,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `${open ? "" : "hidden"} lg:block`,
                style: {
                    background: "var(--surface-1)"
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "px-5 pt-4 pb-2 text-xs font-display tracking-wide",
                        style: {
                            borderTop: "1px solid var(--border-subtle)",
                            color: "var(--text-secondary)"
                        },
                        children: "Z-scores measure how far your stats deviate from average peers at your rank. The modifier applies log-scaled dampening based on games played."
                    }, void 0, false, {
                        fileName: "[project]/components/mmr/breakdown.tsx",
                        lineNumber: 95,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "px-5 pb-5 grid grid-cols-1 lg:grid-cols-3 lg:gap-8 space-y-6 lg:space-y-0",
                        children: roles.map((role)=>{
                            const result = mmr.perRole[role];
                            if (result.status !== "ranked" || !result.breakdown) return null;
                            const bd = result.breakdown;
                            const rColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rank$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["roleColor"])(role);
                            const hasQPCaveat = result.source !== "ranked";
                            const showSampleSizes = result.competitiveGames !== undefined || result.quickplayGames !== undefined;
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "pt-4 lg:pt-0",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs font-display tracking-widest uppercase mb-3",
                                        style: {
                                            color: rColor
                                        },
                                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$rank$2d$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["roleLabel"])(role)
                                    }, void 0, false, {
                                        fileName: "[project]/components/mmr/breakdown.tsx",
                                        lineNumber: 117,
                                        columnNumber: 17
                                    }, this),
                                    showSampleSizes && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
                                        lineNumber: 126,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mb-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex justify-between text-xs font-display mb-1",
                                                style: {
                                                    color: "var(--text-secondary)"
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: "Sample confidence"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/mmr/breakdown.tsx",
                                                        lineNumber: 142,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: [
                                                            Math.round(bd.sampleWeight * 100),
                                                            "%"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/components/mmr/breakdown.tsx",
                                                        lineNumber: 143,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/mmr/breakdown.tsx",
                                                lineNumber: 138,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "h-1.5 rounded-full overflow-hidden",
                                                style: {
                                                    background: "var(--surface-3)"
                                                },
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "h-full rounded-full transition-all duration-500",
                                                    style: {
                                                        width: `${bd.sampleWeight * 100}%`,
                                                        background: `linear-gradient(90deg, ${rColor} 0%, var(--cyan-accent) 100%)`
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/components/mmr/breakdown.tsx",
                                                    lineNumber: 149,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/components/mmr/breakdown.tsx",
                                                lineNumber: 145,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/mmr/breakdown.tsx",
                                        lineNumber: 137,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                                        ].map(({ label, value })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "rounded p-2 text-center",
                                                style: {
                                                    background: "var(--surface-2)"
                                                },
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs font-display mb-1",
                                                        style: {
                                                            color: "var(--text-secondary)"
                                                        },
                                                        children: label
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/mmr/breakdown.tsx",
                                                        lineNumber: 171,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-base font-display font-bold",
                                                        style: {
                                                            color: value === 0 ? "var(--text-tertiary)" : value > 0 ? "var(--role-support)" : "var(--role-damage)"
                                                        },
                                                        children: value > 0 ? `+${value}` : value
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/mmr/breakdown.tsx",
                                                        lineNumber: 177,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, label, true, {
                                                fileName: "[project]/components/mmr/breakdown.tsx",
                                                lineNumber: 166,
                                                columnNumber: 21
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/components/mmr/breakdown.tsx",
                                        lineNumber: 160,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-1",
                                        children: Object.entries(bd.zScores).map(([stat, z])=>{
                                            const pct = Math.min(100, Math.abs(z) * 30 + 50);
                                            const isPositive = z >= 0;
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-xs font-display w-28 shrink-0 capitalize",
                                                        style: {
                                                            color: "var(--text-secondary)"
                                                        },
                                                        children: ZSCORE_LABELS[stat] ?? stat.replace(/([A-Z])/g, " $1").toLowerCase()
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/mmr/breakdown.tsx",
                                                        lineNumber: 201,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex-1 h-1 rounded-full overflow-hidden",
                                                        style: {
                                                            background: "var(--surface-3)"
                                                        },
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "h-full rounded-full",
                                                            style: {
                                                                width: `${pct}%`,
                                                                background: isPositive ? "var(--role-support)" : "var(--role-damage)",
                                                                opacity: 0.6
                                                            }
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/mmr/breakdown.tsx",
                                                            lineNumber: 211,
                                                            columnNumber: 27
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/mmr/breakdown.tsx",
                                                        lineNumber: 207,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                                                        lineNumber: 220,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, stat, true, {
                                                fileName: "[project]/components/mmr/breakdown.tsx",
                                                lineNumber: 200,
                                                columnNumber: 23
                                            }, this);
                                        })
                                    }, void 0, false, {
                                        fileName: "[project]/components/mmr/breakdown.tsx",
                                        lineNumber: 195,
                                        columnNumber: 17
                                    }, this),
                                    hasQPCaveat && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs font-display mt-2",
                                        style: {
                                            color: "var(--text-tertiary)"
                                        },
                                        children: "Quickplay performance compared against competitive peer baselines — interpret with caution."
                                    }, void 0, false, {
                                        fileName: "[project]/components/mmr/breakdown.tsx",
                                        lineNumber: 236,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, role, true, {
                                fileName: "[project]/components/mmr/breakdown.tsx",
                                lineNumber: 116,
                                columnNumber: 15
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/components/mmr/breakdown.tsx",
                        lineNumber: 104,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "px-5 pb-5 text-xs font-display",
                        style: {
                            borderTop: "1px solid var(--border-subtle)",
                            paddingTop: "0.75rem",
                            color: "var(--text-disabled)"
                        },
                        children: "Peer baselines are seeded from community data and updated monthly. Estimates are not official Blizzard data."
                    }, void 0, false, {
                        fileName: "[project]/components/mmr/breakdown.tsx",
                        lineNumber: 248,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/mmr/breakdown.tsx",
                lineNumber: 90,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/mmr/breakdown.tsx",
        lineNumber: 26,
        columnNumber: 5
    }, this);
}
_s(AlgorithmBreakdown, "xG1TONbKtDWtdOTrXaTAsNhPg/Q=");
_c = AlgorithmBreakdown;
var _c;
__turbopack_context__.k.register(_c, "AlgorithmBreakdown");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/utils.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "cn",
    ()=>cn
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/clsx/dist/clsx.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-client] (ecmascript)");
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/ui/button.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Button",
    ()=>Button,
    "buttonVariants",
    ()=>buttonVariants
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$base$2d$ui$2f$react$2f$esm$2f$button$2f$Button$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@base-ui/react/esm/button/Button.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/class-variance-authority/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
;
;
;
;
const buttonVariants = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$class$2d$variance$2d$authority$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cva"])("group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", {
    variants: {
        variant: {
            default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
            outline: "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
            secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
            ghost: "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
            destructive: "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
            link: "text-primary underline-offset-4 hover:underline"
        },
        size: {
            default: "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
            xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
            sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
            lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
            icon: "size-8",
            "icon-xs": "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
            "icon-sm": "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
            "icon-lg": "size-9"
        }
    },
    defaultVariants: {
        variant: "default",
        size: "default"
    }
});
function Button({ className, variant = "default", size = "default", ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$base$2d$ui$2f$react$2f$esm$2f$button$2f$Button$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
        "data-slot": "button",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])(buttonVariants({
            variant,
            size,
            className
        })),
        ...props
    }, void 0, false, {
        fileName: "[project]/components/ui/button.tsx",
        lineNumber: 50,
        columnNumber: 5
    }, this);
}
_c = Button;
;
var _c;
__turbopack_context__.k.register(_c, "Button");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/mmr/share-button.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ShareButton",
    ()=>ShareButton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$share$2d$2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Share2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/share-2.mjs [app-client] (ecmascript) <export default as Share2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/check.mjs [app-client] (ecmascript) <export default as Check>");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/utils.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function ShareButton({ title, text, url, className }) {
    _s();
    const [copied, setCopied] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    async function handleShare() {
        if (typeof navigator !== "undefined" && "share" in navigator) {
            try {
                await navigator.share({
                    title,
                    text,
                    url
                });
                return;
            } catch  {
            // user cancelled or share API threw — fall through to clipboard
            }
        }
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(()=>setCopied(false), 1500);
        } catch  {
        // clipboard unavailable
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
        variant: "ghost",
        size: "sm",
        onClick: ()=>{
            void handleShare();
        },
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("font-display text-xs tracking-widest uppercase gap-1", className),
        style: {
            color: "var(--cyan-accent)"
        },
        children: copied ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                    className: "w-3.5 h-3.5"
                }, void 0, false, {
                    fileName: "[project]/components/mmr/share-button.tsx",
                    lineNumber: 46,
                    columnNumber: 11
                }, this),
                "COPIED"
            ]
        }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$share$2d$2$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Share2$3e$__["Share2"], {
                    className: "w-3.5 h-3.5"
                }, void 0, false, {
                    fileName: "[project]/components/mmr/share-button.tsx",
                    lineNumber: 51,
                    columnNumber: 11
                }, this),
                "SHARE"
            ]
        }, void 0, true)
    }, void 0, false, {
        fileName: "[project]/components/mmr/share-button.tsx",
        lineNumber: 37,
        columnNumber: 5
    }, this);
}
_s(ShareButton, "NE86rL3vg4NVcTTWDavsT0hUBJs=");
_c = ShareButton;
var _c;
__turbopack_context__.k.register(_c, "ShareButton");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_0j6of_r._.js.map