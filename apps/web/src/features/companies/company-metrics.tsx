"use client";

import { useTranslations } from "next-intl";
import type { Company } from "@/types/company";

type MetricCard = {
  label: string;
  value: number | null;
  format: "ratio" | "percent";
  hint: string;
};

function formatMetric(value: number | null, format: "ratio" | "percent") {
  if (value === null) return "-";
  if (format === "percent") return `${(value * 100).toFixed(2)}%`;
  return value.toFixed(2);
}

export function CompanyMetrics({ metrics }: { metrics: Company["metrics"] }) {
  const t = useTranslations("companies.metrics");

  const cards: MetricCard[] = [
    {
      label: t("peLabel"),
      value: metrics.peRatio,
      format: "ratio",
      hint: t("peHint"),
    },
    {
      label: t("roeLabel"),
      value: metrics.roe,
      format: "percent",
      hint: t("roeHint"),
    },
    {
      label: t("deLabel"),
      value: metrics.debtToEquity,
      format: "ratio",
      hint: t("deHint"),
    },
    {
      label: t("dividendLabel"),
      value: metrics.dividendYield,
      format: "percent",
      hint: t("dividendHint"),
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-card border border-line bg-surface p-5">
          <p className="text-xs text-ink-muted">{card.label}</p>
          <p className="mt-2 font-mono text-2xl text-ink">
            {formatMetric(card.value, card.format)}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-ink-faint">{card.hint}</p>
        </div>
      ))}
    </div>
  );
}
