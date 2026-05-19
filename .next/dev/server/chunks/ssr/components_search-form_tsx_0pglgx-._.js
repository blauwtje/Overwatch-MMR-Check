module.exports = [
"[project]/components/search-form.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SearchForm",
    ()=>SearchForm
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
"use client";
;
;
;
const BATTLETAG_REGEX = /^[\p{L}\d]{2,12}[#-]\d{4,8}$/u;
const RECENT_KEY = "owmmr:recent";
const PLATFORM_KEY = "owmmr:platform";
const GAMEMODE_KEY = "owmmr:gamemode";
const MAX_RECENT = 5;
function loadRecent() {
    try {
        return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
    } catch  {
        return [];
    }
}
function saveRecent(tag, platform, gamemode) {
    const items = loadRecent().filter((r)=>r.tag !== tag);
    items.unshift({
        tag,
        platform,
        gamemode,
        ts: Date.now()
    });
    localStorage.setItem(RECENT_KEY, JSON.stringify(items.slice(0, MAX_RECENT)));
}
function tagToUrl(tag) {
    return tag.replace("#", "-");
}
const PLATFORM_LABELS = {
    pc: "PC",
    console: "CONSOLE",
    mixed: "MIXED"
};
const GAMEMODE_LABELS = {
    ranked: "RANKED",
    unranked: "UNRANKED",
    both: "BOTH"
};
function SearchForm() {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const [input, setInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [platform, setPlatform] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("pc");
    const [gamemode, setGamemode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("ranked");
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("");
    const [recent, setRecent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const inputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const savedPlatform = localStorage.getItem(PLATFORM_KEY);
        if (savedPlatform === "pc" || savedPlatform === "console" || savedPlatform === "mixed") {
            setPlatform(savedPlatform);
        }
        const savedGamemode = localStorage.getItem(GAMEMODE_KEY);
        if (savedGamemode === "ranked" || savedGamemode === "unranked" || savedGamemode === "both") {
            setGamemode(savedGamemode);
        }
        setRecent(loadRecent());
        inputRef.current?.focus();
    }, []);
    function handlePlatformChange(p) {
        setPlatform(p);
        localStorage.setItem(PLATFORM_KEY, p);
    }
    function handleGamemodeChange(g) {
        setGamemode(g);
        localStorage.setItem(GAMEMODE_KEY, g);
    }
    function handleSubmit(e) {
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
    function handleRecentClick(item) {
        const gm = item.gamemode === "ranked" || item.gamemode === "unranked" || item.gamemode === "both" ? item.gamemode : "ranked";
        router.push(`/player/${tagToUrl(item.tag)}?platform=${item.platform}&gamemode=${gm}`);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "w-full max-w-xl mx-auto",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                onSubmit: handleSubmit,
                className: "space-y-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute inset-0 rounded-lg pointer-events-none",
                                style: {
                                    background: "linear-gradient(135deg, rgba(0,212,255,0.15) 0%, transparent 60%)",
                                    border: "1px solid var(--border-accent)"
                                }
                            }, void 0, false, {
                                fileName: "[project]/components/search-form.tsx",
                                lineNumber: 101,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "relative flex items-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "absolute left-4 text-sm font-display tracking-widest opacity-50 select-none",
                                        style: {
                                            color: "var(--cyan-accent)"
                                        },
                                        children: "//"
                                    }, void 0, false, {
                                        fileName: "[project]/components/search-form.tsx",
                                        lineNumber: 109,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        ref: inputRef,
                                        type: "text",
                                        value: input,
                                        onChange: (e)=>{
                                            setInput(e.target.value);
                                            setError("");
                                        },
                                        placeholder: "Name#1234",
                                        spellCheck: false,
                                        autoComplete: "off",
                                        className: "w-full bg-transparent pl-10 pr-4 py-4 text-lg tracking-wide outline-none placeholder:opacity-30",
                                        style: {
                                            fontFamily: "var(--font-display)",
                                            letterSpacing: "0.05em",
                                            color: "rgba(255,255,255,0.9)"
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/components/search-form.tsx",
                                        lineNumber: 115,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "submit",
                                        className: "mr-2 px-5 py-2 rounded text-xs font-display tracking-widest uppercase transition-all duration-200 shrink-0",
                                        style: {
                                            background: "var(--cyan-accent)",
                                            color: "var(--surface-0)",
                                            fontWeight: 700
                                        },
                                        onMouseEnter: (e)=>e.currentTarget.style.opacity = "0.85",
                                        onMouseLeave: (e)=>e.currentTarget.style.opacity = "1",
                                        children: "SCAN"
                                    }, void 0, false, {
                                        fileName: "[project]/components/search-form.tsx",
                                        lineNumber: 130,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/search-form.tsx",
                                lineNumber: 108,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/search-form.tsx",
                        lineNumber: 100,
                        columnNumber: 9
                    }, this),
                    error && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm font-display tracking-wide pl-1",
                        style: {
                            color: "var(--orange-accent)"
                        },
                        children: error
                    }, void 0, false, {
                        fileName: "[project]/components/search-form.tsx",
                        lineNumber: 151,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2 flex-wrap",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs tracking-widest uppercase font-display mr-1 w-20 shrink-0",
                                style: {
                                    color: "var(--text-tertiary)"
                                },
                                children: "Platform"
                            }, void 0, false, {
                                fileName: "[project]/components/search-form.tsx",
                                lineNumber: 161,
                                columnNumber: 11
                            }, this),
                            [
                                "pc",
                                "console",
                                "mixed"
                            ].map((p)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: ()=>handlePlatformChange(p),
                                    className: "px-4 py-1.5 rounded text-xs font-display tracking-widest uppercase transition-all duration-150",
                                    style: {
                                        background: platform === p ? "var(--cyan-accent)" : "var(--surface-2)",
                                        color: platform === p ? "var(--surface-0)" : "var(--text-secondary)",
                                        border: platform === p ? "1px solid var(--cyan-accent)" : "1px solid var(--border-subtle)",
                                        fontWeight: platform === p ? 700 : 400
                                    },
                                    children: PLATFORM_LABELS[p]
                                }, p, false, {
                                    fileName: "[project]/components/search-form.tsx",
                                    lineNumber: 168,
                                    columnNumber: 13
                                }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/search-form.tsx",
                        lineNumber: 160,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2 flex-wrap",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "text-xs tracking-widest uppercase font-display mr-1 w-20 shrink-0",
                                style: {
                                    color: "var(--text-tertiary)"
                                },
                                children: "Game mode"
                            }, void 0, false, {
                                fileName: "[project]/components/search-form.tsx",
                                lineNumber: 190,
                                columnNumber: 11
                            }, this),
                            [
                                "ranked",
                                "unranked",
                                "both"
                            ].map((g)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: ()=>handleGamemodeChange(g),
                                    className: "px-4 py-1.5 rounded text-xs font-display tracking-widest uppercase transition-all duration-150",
                                    style: {
                                        background: gamemode === g ? "var(--cyan-accent)" : "var(--surface-2)",
                                        color: gamemode === g ? "var(--surface-0)" : "var(--text-secondary)",
                                        border: gamemode === g ? "1px solid var(--cyan-accent)" : "1px solid var(--border-subtle)",
                                        fontWeight: gamemode === g ? 700 : 400
                                    },
                                    children: GAMEMODE_LABELS[g]
                                }, g, false, {
                                    fileName: "[project]/components/search-form.tsx",
                                    lineNumber: 197,
                                    columnNumber: 13
                                }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/search-form.tsx",
                        lineNumber: 189,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/search-form.tsx",
                lineNumber: 98,
                columnNumber: 7
            }, this),
            recent.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mt-8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs font-display tracking-widest uppercase mb-3",
                        style: {
                            color: "var(--text-tertiary)"
                        },
                        children: "Recent"
                    }, void 0, false, {
                        fileName: "[project]/components/search-form.tsx",
                        lineNumber: 221,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-wrap gap-2",
                        children: recent.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>handleRecentClick(item),
                                className: "px-3 py-1.5 rounded text-sm font-display tracking-wide transition-all duration-150 hover:opacity-80",
                                style: {
                                    background: "var(--surface-2)",
                                    color: "var(--text-secondary)",
                                    border: "1px solid var(--border-subtle)"
                                },
                                children: [
                                    item.tag,
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "ml-2 text-xs",
                                        style: {
                                            color: "var(--cyan-accent)",
                                            opacity: 0.7
                                        },
                                        children: item.platform.toUpperCase()
                                    }, void 0, false, {
                                        fileName: "[project]/components/search-form.tsx",
                                        lineNumber: 240,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, item.tag + item.platform, true, {
                                fileName: "[project]/components/search-form.tsx",
                                lineNumber: 229,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/components/search-form.tsx",
                        lineNumber: 227,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/search-form.tsx",
                lineNumber: 220,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/search-form.tsx",
        lineNumber: 97,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=components_search-form_tsx_0pglgx-._.js.map