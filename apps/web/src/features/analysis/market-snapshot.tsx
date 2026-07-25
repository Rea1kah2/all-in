"use client";

import { useTranslations } from "next-intl";
import { cn, formatPercent, formatPrice } from "@/lib/utils";
import type { MarketData } from "@/types/analysis";

type Stat = { label: string; value: string; tone?: string };

export function MarketSnapshot({ data }: { data: MarketData }) {
  const t = useTranslations("analysis.snapshot");

  const stats: Stat[] = [];
  if (data.price !== undefined) {
    stats.push({ label: t("price"), value: formatPrice(data.price, "USD") });
  }
  if (data.rsi !== undefined) {
    stats.push({ label: t("rsi"), value: String(data.rsi) });
  }
  if (data.trend) {
    stats.push({ label: t("trend"), value: data.trend });
  }
  if (data.changePercent1y !== undefined) {
    stats.push({
      label: t("change1y"),
      value: formatPercent(data.changePercent1y),
      tone: data.changePercent1y >= 0 ? "text-bull" : "text-bear",
    });
  }

  if (stats.length === 0 && (!data.news || data.news.length === 0)) {
    return null;
  }

  return (
    <div className="rounded-card border border-line bg-surface p-6">
      <h2 className="text-sm text-ink">{t("title")}</h2>

      {stats.length > 0 ? (
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-xs text-ink-muted">{stat.label}</p>
              <p className={cn("mt-1 font-mono text-lg text-ink", stat.tone)}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      {data.news && data.news.length > 0 ? (
        <div className="mt-5 border-line border-t pt-4">
          <p className="text-xs text-ink-muted">{t("news")}</p>
          <ul className="mt-2 space-y-1.5">
            {data.news.map((headline) => (
              <li key={headline} className="flex gap-2 text-sm text-ink">
                <span className="mt-2 size-1 shrink-0 rounded-full bg-ink-faint" />
                {headline}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
