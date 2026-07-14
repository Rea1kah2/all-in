import type { Metadata } from "next";
import Link from "next/link";
import {
  BarChartIcon,
  BookIcon,
  BulbIcon,
  CandlestickIcon,
  CheckIcon,
  DocumentIcon,
  NewsIcon,
  SearchIcon,
} from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: `${site.name}, ${site.tagline}`,
  description: site.description,
};

const agents = [
  {
    name: "Data Collector",
    role: "Mengumpulkan laporan keuangan, harga historis, dan berita terbaru",
    Icon: SearchIcon,
  },
  {
    name: "Fundamental",
    role: "Menilai kesehatan bisnis, valuasi, dan keunggulan kompetitif",
    Icon: BarChartIcon,
  },
  {
    name: "Technical",
    role: "Membaca struktur harga dengan kerangka Smart Money Concept",
    Icon: CandlestickIcon,
  },
  {
    name: "Sentiment dan Risk",
    role: "Menimbang berita, aktivitas insider, dan volatilitas",
    Icon: NewsIcon,
  },
  {
    name: "Decision",
    role: "Menyatukan semuanya jadi satu kesimpulan yang bisa Anda uji",
    Icon: BulbIcon,
  },
];

const features = [
  {
    title: "Penalaran yang terbuka",
    body: "Setiap kesimpulan bisa ditelusuri sampai ke data mentahnya. Anda tidak diminta percaya begitu saja.",
    Icon: BulbIcon,
  },
  {
    title: "Fundamental dan teknikal sekaligus",
    body: "Kesehatan bisnis dan struktur harga dianalisis bersama, bukan dipilih salah satu.",
    Icon: BarChartIcon,
  },
  {
    title: "Edukasi yang menyatu",
    body: "Klik istilah mana pun di hasil analisis, penjelasannya terbuka tanpa perlu berpindah halaman.",
    Icon: BookIcon,
  },
  {
    title: "Rekam jejak yang tersimpan",
    body: "Setiap analisis tercatat, jadi Anda bisa menilai sendiri seberapa berguna alat ini bagi Anda.",
    Icon: DocumentIcon,
  },
];

const simpleMode = [
  "Kesimpulan dalam bahasa sehari hari",
  "Alasan utama diringkas tiga poin",
  "Istilah teknis dijelaskan saat diklik",
  "Grafik bersih tanpa indikator berlapis",
];

const proMode = [
  "Seluruh penalaran lima agent terbuka",
  "Overlay Smart Money Concept di grafik",
  "Metrik fundamental lengkap",
  "Zona likuiditas dan order block",
];

export default function LandingPage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-5 pt-16 pb-20 md:px-8 md:pt-24">
        <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
          <div>
            <Badge variant="signal">
              <BulbIcon size={12} />
              Analisis multi agent
            </Badge>

            <h1 className="mt-6 text-4xl leading-tight text-ink md:text-5xl">
              Analisis saham yang menunjukkan cara berpikirnya
            </h1>

            <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-muted">
              Lima agent AI menganalisis fundamental, struktur harga, dan sentimen pasar.
              Anda melihat seluruh alur penalarannya, bukan sekadar kesimpulan akhirnya.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/register">Coba gratis</Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="#cara-kerja">Lihat cara kerjanya</Link>
              </Button>
            </div>

            <p className="mt-6 max-w-md text-xs leading-relaxed text-ink-faint">
              Kami bukan penasihat investasi. Analisis di sini membantu Anda berpikir
              lebih jernih, keputusan akhir tetap milik Anda.
            </p>
          </div>

          <div className="rounded-card border border-line bg-surface p-6 md:p-7">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-sm text-ink">AAPL</span>
                <span className="font-mono text-xs text-ink-faint">184.32</span>
              </div>
              <Badge variant="bull" numeric>
                BUY
              </Badge>
            </div>

            <div className="mt-7 space-y-1">
              {agents.map(({ name, role, Icon }, index) => (
                <div key={name} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-brass bg-brass-bg text-brass-ink">
                      <Icon size={15} />
                    </span>
                    {index < agents.length - 1 ? (
                      <span className="w-px flex-1 bg-brass/35" />
                    ) : null}
                  </div>
                  <div className="pb-6">
                    <p className="text-sm text-ink">{name}</p>
                    <p className="mt-1 text-xs leading-relaxed text-ink-muted">{role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="cara-kerja"
        className="border-t border-line bg-surface/40 py-20 md:py-24"
      >
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <h2 className="max-w-xl text-3xl leading-tight text-ink">
            Tiga langkah, satu kesimpulan yang bisa Anda uji
          </h2>

          <div className="mt-12 grid gap-10 md:grid-cols-3">
            <div>
              <span className="font-mono text-xs text-brass">01</span>
              <h3 className="mt-3 text-lg text-ink">Pilih saham</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                Cari berdasarkan ticker atau nama perusahaan. Profil bisnis dan angka
                pentingnya langsung terbuka.
              </p>
            </div>

            <div>
              <span className="font-mono text-xs text-brass">02</span>
              <h3 className="mt-3 text-lg text-ink">Jalankan analisis</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                Sebutkan horizon dan toleransi risiko Anda. Lima agent bekerja,
                penalarannya mengalir di layar saat itu juga.
              </p>
            </div>

            <div>
              <span className="font-mono text-xs text-brass">03</span>
              <h3 className="mt-3 text-lg text-ink">Uji kesimpulannya</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                Telusuri setiap alasan sampai ke data mentahnya. Setuju atau tidak, Anda
                tahu persis dasar penilaiannya.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="keunggulan" className="py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <h2 className="max-w-xl text-3xl leading-tight text-ink">
            Dibangun untuk orang yang ingin paham, bukan sekadar diberi tahu
          </h2>

          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {features.map(({ title, body, Icon }) => (
              <div key={title} className="rounded-card border border-line bg-surface p-6">
                <span className="flex size-9 items-center justify-center rounded-badge bg-brass-bg text-brass-ink">
                  <Icon size={18} />
                </span>
                <h3 className="mt-4 text-base text-ink">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="mode" className="border-t border-line bg-surface/40 py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <h2 className="max-w-xl text-3xl leading-tight text-ink">
            Sedalam yang Anda butuhkan, tidak lebih
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-muted">
            Mulai dari tampilan yang ringkas dan jelas. Saat Anda siap, buka seluruh
            kedalamannya dengan satu tombol.
          </p>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            <div className="rounded-card border border-line bg-surface p-7">
              <Badge variant="neutral">Mode Simple</Badge>
              <p className="mt-4 text-sm leading-relaxed text-ink-muted">
                Untuk Anda yang baru mulai, atau yang tidak punya waktu membaca dua puluh
                metrik.
              </p>
              <ul className="mt-6 space-y-3">
                {simpleMode.map((item) => (
                  <li key={item} className="flex gap-2.5 text-sm text-ink">
                    <CheckIcon size={16} className="mt-0.5 shrink-0 text-teal" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-card border border-brass/40 bg-surface p-7">
              <Badge variant="signal">Mode Pro</Badge>
              <p className="mt-4 text-sm leading-relaxed text-ink-muted">
                Untuk Anda yang ingin membedah setiap asumsi dan menantang kesimpulannya.
              </p>
              <ul className="mt-6 space-y-3">
                {proMode.map((item) => (
                  <li key={item} className="flex gap-2.5 text-sm text-ink">
                    <CheckIcon size={16} className="mt-0.5 shrink-0 text-brass" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-2xl px-5 text-center md:px-8">
          <h2 className="text-3xl leading-tight text-ink">
            Berhenti menebak. Mulai menguji.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink-muted">
            Coba analisis pertama Anda hari ini, tanpa kartu kredit.
          </p>
          <div className="mt-8 flex justify-center">
            <Button asChild size="lg">
              <Link href="/register">Coba gratis</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
