import { ThemeToggle } from "@/components/theme-toggle";

const swatches = [
  { name: "bg", className: "bg-bg" },
  { name: "surface", className: "bg-surface" },
  { name: "line", className: "bg-line" },
  { name: "ink", className: "bg-ink" },
  { name: "ink muted", className: "bg-ink-muted" },
  { name: "brass", className: "bg-brass" },
  { name: "teal", className: "bg-teal" },
  { name: "bull", className: "bg-bull" },
  { name: "bear", className: "bg-bear" },
  { name: "hold", className: "bg-hold" },
];

export default function HomePage() {
  return (
    <main className="min-h-screen px-8 py-12">
      <div className="mx-auto max-w-3xl space-y-10">
        <header className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl">Design tokens</h1>
            <p className="mt-1 text-sm text-ink-muted">
              Verifikasi palet, tipografi, dan mode gelap
            </p>
          </div>
          <ThemeToggle />
        </header>

        <section className="space-y-3">
          <h2 className="text-sm text-ink-muted">Palet</h2>
          <div className="grid grid-cols-5 gap-3">
            {swatches.map((swatch) => (
              <div key={swatch.name} className="space-y-2">
                <div
                  className={`h-14 rounded-badge border border-line ${swatch.className}`}
                />
                <p className="text-xs text-ink-muted">{swatch.name}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm text-ink-muted">Tipografi</h2>
          <div className="rounded-card border border-line bg-surface p-5 space-y-3">
            <p className="text-2xl">Judul halaman, IBM Plex Sans 500</p>
            <p className="text-base">
              Isi teks memakai bobot 400. Nada bahasa profesional namun humanis,
              tidak korporat kaku.
            </p>
            <p className="font-mono text-2xl text-bull">184.32</p>
            <p className="font-mono text-sm text-ink-muted">
              Seluruh angka memakai IBM Plex Mono
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm text-ink-muted">Sinyal AI dan verdict</h2>
          <div className="flex flex-wrap gap-3">
            <span className="rounded-badge bg-bull-bg px-3 py-1.5 font-mono text-xs text-bull">
              BUY
            </span>
            <span className="rounded-badge bg-hold-bg px-3 py-1.5 font-mono text-xs text-hold">
              HOLD
            </span>
            <span className="rounded-badge bg-bear-bg px-3 py-1.5 font-mono text-xs text-bear">
              SELL
            </span>
            <span className="rounded-badge bg-brass-bg px-3 py-1.5 text-xs text-brass-ink">
              Sinyal AI
            </span>
          </div>
        </section>
      </div>
    </main>
  );
}