import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
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
  { key: "collector", Icon: SearchIcon },
  { key: "agent1", Icon: BarChartIcon },
  { key: "agent2", Icon: NewsIcon },
  { key: "agent3", Icon: BulbIcon },
];

const features = [
  { key: "reasoning", Icon: BulbIcon },
  { key: "hybrid", Icon: BarChartIcon },
  { key: "education", Icon: BookIcon },
  { key: "history", Icon: DocumentIcon },
];

export default async function LandingPage() {
  const t = await getTranslations("landing");
  const simpleItems = t.raw("simpleItems") as string[];
  const proItems = t.raw("proItems") as string[];

  return (
    <>
      <section className="mx-auto max-w-6xl px-5 pt-16 pb-20 md:px-8 md:pt-24">
        <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
          <div>
            <Badge variant="signal">
              <BulbIcon size={12} />
              {t("badge")}
            </Badge>

            <h1 className="mt-6 text-4xl leading-tight text-ink md:text-5xl">
              {t("heroTitle")}
            </h1>

            <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-muted">
              {t("heroBody")}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/register">{t("ctaPrimary")}</Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="#cara-kerja">{t("ctaSecondary")}</Link>
              </Button>
            </div>

            <p className="mt-6 max-w-md text-xs leading-relaxed text-ink-faint">
              {t("heroNote")}
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
              {agents.map(({ key, Icon }, index) => (
                <div key={key} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-brass bg-brass-bg text-brass-ink">
                      <Icon size={15} />
                    </span>
                    {index < agents.length - 1 ? (
                      <span className="w-px flex-1 bg-brass/35" />
                    ) : null}
                  </div>
                  <div className="pb-6">
                    <p className="text-sm text-ink">{t(`agents.${key}Name`)}</p>
                    <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                      {t(`agents.${key}Role`)}
                    </p>
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
          <h2 className="max-w-xl text-3xl leading-tight text-ink">{t("howTitle")}</h2>

          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {(["1", "2", "3"] as const).map((step) => (
              <div key={step}>
                <span className="font-mono text-xs text-brass">0{step}</span>
                <h3 className="mt-3 text-lg text-ink">{t(`step${step}Title`)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  {t(`step${step}Body`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="keunggulan" className="py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <h2 className="max-w-xl text-3xl leading-tight text-ink">
            {t("featuresTitle")}
          </h2>

          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {features.map(({ key, Icon }) => (
              <div key={key} className="rounded-card border border-line bg-surface p-6">
                <span className="flex size-9 items-center justify-center rounded-badge bg-brass-bg text-brass-ink">
                  <Icon size={18} />
                </span>
                <h3 className="mt-4 text-base text-ink">{t(`features.${key}Title`)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  {t(`features.${key}Body`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="mode" className="border-t border-line bg-surface/40 py-20 md:py-24">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <h2 className="max-w-xl text-3xl leading-tight text-ink">{t("modeTitle")}</h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-muted">
            {t("modeBody")}
          </p>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            <div className="rounded-card border border-line bg-surface p-7">
              <Badge variant="neutral">{t("simpleBadge")}</Badge>
              <p className="mt-4 text-sm leading-relaxed text-ink-muted">
                {t("simpleBody")}
              </p>
              <ul className="mt-6 space-y-3">
                {simpleItems.map((item) => (
                  <li key={item} className="flex gap-2.5 text-sm text-ink">
                    <CheckIcon size={16} className="mt-0.5 shrink-0 text-teal" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-card border border-brass/40 bg-surface p-7">
              <Badge variant="signal">{t("proBadge")}</Badge>
              <p className="mt-4 text-sm leading-relaxed text-ink-muted">
                {t("proBody")}
              </p>
              <ul className="mt-6 space-y-3">
                {proItems.map((item) => (
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
          <h2 className="text-3xl leading-tight text-ink">{t("finalTitle")}</h2>
          <p className="mt-4 text-base leading-relaxed text-ink-muted">
            {t("finalBody")}
          </p>
          <div className="mt-8 flex justify-center">
            <Button asChild size="lg">
              <Link href="/register">{t("finalCta")}</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
