import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--surface-0)" }}
    >
      {/* Background grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 text-center max-w-md">
        <p
          className="text-xs font-display tracking-[0.4em] uppercase mb-4"
          style={{ color: "var(--orange-accent)" }}
        >
          404 · Not Found
        </p>

        <h1
          className="font-display font-black leading-none mb-6"
          style={{
            fontSize: "clamp(40px, 9vw, 64px)",
            letterSpacing: "-0.03em",
            color: "var(--text-primary)",
          }}
        >
          Player not found
        </h1>

        <ul
          className="text-sm font-display mb-8 space-y-3 text-left"
          style={{ color: "var(--text-secondary)" }}
        >
          <li>
            <span style={{ color: "var(--cyan-accent)" }}>// </span>
            <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>Case matters.</span>{" "}
            Battletags are case-sensitive — try{" "}
            <code style={{ color: "var(--text-primary)" }}>Name#1234</code> exactly as it appears
            in-game.
          </li>
          <li>
            <span style={{ color: "var(--cyan-accent)" }}>// </span>
            <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>Wrong platform.</span>{" "}
            The profile may exist only on the other platform — switch PC ↔ Console on the search
            form and try again.
          </li>
          <li>
            <span style={{ color: "var(--cyan-accent)" }}>// </span>
            <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>Private profile.</span>{" "}
            If Career Profile is set to private in Battle.net, we can&apos;t read it — make it
            public to be visible here.
          </li>
          <li>
            <span style={{ color: "var(--cyan-accent)" }}>// </span>
            <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>Brand-new account.</span>{" "}
            New accounts can take a few hours to be indexed.
          </li>
        </ul>

        <Link
          href="/"
          className="inline-block px-6 py-2.5 rounded font-display text-sm tracking-widest uppercase transition-opacity hover:opacity-80"
          style={{ background: "var(--cyan-accent)", color: "var(--surface-0)", fontWeight: 700 }}
        >
          Search Again
        </Link>
      </div>
    </div>
  );
}
