export default function Loading() {
  return (
    <div className="min-h-screen" style={{ background: "var(--surface-0)" }}>
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

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8 pb-16">
        {/* Back skeleton */}
        <div
          className="h-4 w-16 rounded mb-8 animate-pulse"
          style={{ background: "var(--surface-3)" }}
        />

        {/* Share card skeleton */}
        <div
          className="rounded-xl mb-6 overflow-hidden"
          style={{ background: "var(--surface-1)", border: "1px solid var(--border-accent)" }}
        >
          {/* Top row */}
          <div className="flex items-start gap-4 p-5 sm:p-6">
            <div
              className="w-16 h-16 rounded-lg shrink-0 animate-pulse"
              style={{ background: "var(--surface-3)" }}
            />
            <div className="flex-1 space-y-2">
              <div className="h-7 w-44 rounded animate-pulse" style={{ background: "var(--surface-3)" }} />
              <div className="flex gap-2">
                <div className="h-4 w-10 rounded animate-pulse" style={{ background: "var(--surface-3)" }} />
                <div className="h-4 w-14 rounded animate-pulse" style={{ background: "var(--surface-3)" }} />
              </div>
            </div>
            <div
              className="h-7 w-20 rounded animate-pulse shrink-0"
              style={{ background: "var(--surface-3)" }}
            />
          </div>

          {/* Verdict bar */}
          <div
            className="px-5 py-3 text-center space-y-2"
            style={{ borderTop: "1px solid var(--border-subtle)" }}
          >
            <div
              className="h-7 w-64 rounded mx-auto animate-pulse"
              style={{ background: "var(--surface-3)" }}
            />
            <div
              className="h-3 w-32 rounded mx-auto animate-pulse"
              style={{ background: "var(--surface-3)" }}
            />
          </div>

          {/* Role mini-rows */}
          <div
            className="grid grid-cols-3 gap-px"
            style={{ background: "var(--border-subtle)", borderTop: "1px solid var(--border-subtle)" }}
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-1.5 px-2 py-3"
                style={{ background: "var(--surface-1)" }}
              >
                <div className="h-3 w-10 rounded animate-pulse" style={{ background: "var(--surface-3)" }} />
                <div className="h-3 w-14 rounded animate-pulse" style={{ background: "var(--surface-3)" }} />
                <div className="h-3 w-6 rounded animate-pulse" style={{ background: "var(--surface-3)" }} />
                <div className="h-3 w-14 rounded animate-pulse" style={{ background: "var(--surface-3)" }} />
              </div>
            ))}
          </div>

          {/* Wordmark row */}
          <div
            className="flex items-center justify-between px-5 py-2.5"
            style={{ background: "rgba(0,0,0,0.3)", borderTop: "1px solid var(--border-subtle)" }}
          >
            <div className="h-4 w-16 rounded animate-pulse" style={{ background: "var(--surface-3)" }} />
            <div className="h-3 w-12 rounded animate-pulse" style={{ background: "var(--surface-3)" }} />
          </div>
        </div>

        {/* Primary MMR card skeleton */}
        <div
          className="rounded-xl mb-6 p-8"
          style={{ background: "var(--surface-1)", border: "1px solid var(--border-accent)" }}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="h-3 w-24 rounded animate-pulse" style={{ background: "var(--surface-3)" }} />
            <div
              className="rounded-md animate-pulse"
              style={{ width: 128, height: 128, background: "var(--surface-3)" }}
            />
            <div className="h-16 w-48 rounded animate-pulse" style={{ background: "var(--surface-3)" }} />
            <div className="h-7 w-56 rounded animate-pulse" style={{ background: "var(--surface-3)" }} />
            <div className="h-4 w-44 rounded animate-pulse" style={{ background: "var(--surface-3)" }} />
          </div>
        </div>

        {/* Toggle panel skeleton */}
        <div
          className="rounded-lg mb-6 overflow-hidden"
          style={{ background: "var(--surface-1)", border: "1px solid var(--border-subtle)" }}
        >
          {[0, 1].map((row) => (
            <div key={row}>
              {row > 0 && <div style={{ borderTop: "1px solid var(--border-subtle)" }} />}
              <div className="flex flex-wrap items-center gap-2 px-4 py-3">
                <div
                  className="h-3 w-16 rounded animate-pulse shrink-0 mr-2"
                  style={{ background: "var(--surface-3)" }}
                />
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-7 w-20 rounded animate-pulse"
                    style={{ background: "var(--surface-3)" }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Role card skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-lg p-5 flex flex-col gap-4"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border-subtle)" }}
            >
              {/* Header */}
              <div className="h-3 w-14 rounded animate-pulse" style={{ background: "var(--surface-3)" }} />
              {/* Twin chips */}
              <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <div className="h-3 w-14 rounded animate-pulse" style={{ background: "var(--surface-3)" }} />
                  <div className="w-14 h-14 rounded animate-pulse" style={{ background: "var(--surface-3)" }} />
                  <div className="h-3 w-16 rounded animate-pulse" style={{ background: "var(--surface-3)" }} />
                </div>
                <div className="w-7 h-7 rounded-full animate-pulse" style={{ background: "var(--surface-3)" }} />
                <div className="flex flex-col items-center gap-1.5">
                  <div className="h-3 w-16 rounded animate-pulse" style={{ background: "var(--surface-3)" }} />
                  <div className="w-14 h-14 rounded animate-pulse" style={{ background: "var(--surface-3)" }} />
                  <div className="h-3 w-14 rounded animate-pulse" style={{ background: "var(--surface-3)" }} />
                </div>
              </div>
              {/* Details row */}
              <div
                className="flex items-center justify-between gap-2 pt-3"
                style={{ borderTop: "1px solid var(--border-subtle)" }}
              >
                <div className="h-3 w-20 rounded animate-pulse" style={{ background: "var(--surface-3)" }} />
                <div className="h-3 w-8 rounded animate-pulse" style={{ background: "var(--surface-3)" }} />
                <div className="h-5 w-20 rounded animate-pulse" style={{ background: "var(--surface-3)" }} />
              </div>
            </div>
          ))}
        </div>

        {/* Breakdown placeholder */}
        <div
          className="rounded-lg mb-6"
          style={{ background: "var(--surface-1)", border: "1px solid var(--border-subtle)" }}
        >
          <div className="flex items-center justify-between px-5 py-4">
            <div className="h-3 w-36 rounded animate-pulse" style={{ background: "var(--surface-3)" }} />
            <div className="h-4 w-4 rounded animate-pulse" style={{ background: "var(--surface-3)" }} />
          </div>
        </div>

        {/* Scanning indicator */}
        <div className="flex items-center gap-3 justify-center mt-8 opacity-40">
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: "var(--cyan-accent)" }}
          />
          <p
            className="text-xs font-display tracking-widest uppercase"
            style={{ color: "var(--cyan-accent)" }}
          >
            Scanning profile…
          </p>
        </div>
      </div>
    </div>
  );
}
