export default function Loading() {
  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--surface-0)" }}
    >
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
        <div className="h-4 w-16 rounded mb-8 animate-pulse" style={{ background: "var(--surface-3)" }} />

        {/* Player header skeleton */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-lg shrink-0 animate-pulse" style={{ background: "var(--surface-3)" }} />
          <div className="space-y-2">
            <div className="h-7 w-40 rounded animate-pulse" style={{ background: "var(--surface-3)" }} />
            <div className="h-4 w-20 rounded animate-pulse" style={{ background: "var(--surface-3)" }} />
          </div>
        </div>

        {/* Primary MMR skeleton */}
        <div
          className="rounded-xl mb-6 p-8 text-center"
          style={{ background: "var(--surface-1)", border: "1px solid var(--border-accent)" }}
        >
          <div className="h-4 w-32 rounded mx-auto mb-4 animate-pulse" style={{ background: "var(--surface-3)" }} />
          <div className="h-24 w-48 rounded mx-auto mb-3 animate-pulse" style={{ background: "var(--surface-3)" }} />
          <div className="h-5 w-28 rounded mx-auto animate-pulse" style={{ background: "var(--surface-3)" }} />
        </div>

        {/* Role cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-lg p-5 space-y-3"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border-subtle)" }}
            >
              <div className="h-3 w-16 rounded animate-pulse" style={{ background: "var(--surface-3)" }} />
              <div className="h-10 w-10 rounded animate-pulse" style={{ background: "var(--surface-3)" }} />
              <div className="h-10 w-32 rounded animate-pulse" style={{ background: "var(--surface-3)" }} />
              <div className="h-3 w-24 rounded animate-pulse" style={{ background: "var(--surface-3)" }} />
            </div>
          ))}
        </div>

        {/* Scanning indicator */}
        <div className="flex items-center gap-3 justify-center mt-8 opacity-40">
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: "var(--cyan-accent)" }}
          />
          <p className="text-xs font-display tracking-widest uppercase" style={{ color: "var(--cyan-accent)" }}>
            Scanning profile…
          </p>
        </div>
      </div>
    </div>
  );
}
