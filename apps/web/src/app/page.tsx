import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
            <h1 className="text-2xl">Design tokens dan primitive</h1>
            <p className="mt-1 text-sm text-ink-muted">
              Verifikasi palet, tipografi, Button, dan Badge
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
          <div className="space-y-3 rounded-card border border-line bg-surface p-5">
            <p className="text-2xl">Judul halaman, IBM Plex Sans 500</p>
            <p className="text-base">
              Isi teks memakai bobot 400. Nada bahasa profesional namun humanis, tidak
              korporat kaku.
            </p>
            <p className="font-mono text-2xl text-bull">184.32</p>
            <p className="font-mono text-sm text-ink-muted">
              Seluruh angka memakai IBM Plex Mono
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm text-ink-muted">Badge</h2>
          <div className="flex flex-wrap gap-3">
            <Badge variant="bull" numeric>
              BUY
            </Badge>
            <Badge variant="hold" numeric>
              HOLD
            </Badge>
            <Badge variant="bear" numeric>
              SELL
            </Badge>
            <Badge variant="signal">Sinyal AI</Badge>
            <Badge variant="neutral">Netral</Badge>
            <Badge variant="bull" shape="pill" numeric>
              +2.34%
            </Badge>
            <Badge variant="bear" shape="pill" numeric>
              -1.87%
            </Badge>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm text-ink-muted">Button, varian</h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="signal">Analisis dengan AI</Button>
            <Button variant="destructive">Hapus</Button>
            <Button variant="primary" disabled>
              Disabled
            </Button>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm text-ink-muted">Button, ukuran</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Kecil</Button>
            <Button size="md">Sedang</Button>
            <Button size="lg">Besar</Button>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm text-ink-muted">Button, asChild sebagai link</h2>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="secondary">
              <a href="/">Kembali ke beranda</a>
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
