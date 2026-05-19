import { SearchForm } from "@/components/search-form";

export default function Home() {
  return (
    <main
      className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden"
      style={{ background: "var(--surface-0)" }}
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,212,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,212,255,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Corner decorations */}
      <div className="absolute top-8 left-8 opacity-20 hidden md:block">
        <div style={{ width: 40, height: 40, borderTop: "2px solid var(--cyan-accent)", borderLeft: "2px solid var(--cyan-accent)" }} />
      </div>
      <div className="absolute top-8 right-8 opacity-20 hidden md:block">
        <div style={{ width: 40, height: 40, borderTop: "2px solid var(--cyan-accent)", borderRight: "2px solid var(--cyan-accent)" }} />
      </div>
      <div className="absolute bottom-8 left-8 opacity-20 hidden md:block">
        <div style={{ width: 40, height: 40, borderBottom: "2px solid var(--cyan-accent)", borderLeft: "2px solid var(--cyan-accent)" }} />
      </div>
      <div className="absolute bottom-8 right-8 opacity-20 hidden md:block">
        <div style={{ width: 40, height: 40, borderBottom: "2px solid var(--cyan-accent)", borderRight: "2px solid var(--cyan-accent)" }} />
      </div>

      <div className="relative z-10 w-full max-w-xl mx-auto text-center">
        {/* Eyebrow */}
        <p
          className="text-xs tracking-[0.4em] uppercase mb-4 font-display"
          style={{ color: "var(--cyan-accent)", opacity: 0.7 }}
        >
          Overwatch 2 · Community Tool
        </p>

        {/* Wordmark */}
        <h1
          className="font-display leading-none mb-2"
          style={{
            fontSize: "clamp(64px, 14vw, 120px)",
            fontWeight: 900,
            letterSpacing: "-0.02em",
            color: "white",
          }}
        >
          ow<span style={{ color: "var(--cyan-accent)" }}>MMR</span>
        </h1>

        <p
          className="text-sm tracking-[0.2em] uppercase mb-12 font-display"
          style={{ color: "rgba(255,255,255,0.35)" }}
        >
          Estimated MMR · Based on rank & performance
        </p>

        {/* Search form */}
        <SearchForm />

        {/* Footer note */}
        <p
          className="mt-12 text-xs opacity-25 font-display tracking-wide"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          Unofficial · Our model&apos;s estimate · Not affiliated with Blizzard Entertainment
        </p>
      </div>
    </main>
  );
}
