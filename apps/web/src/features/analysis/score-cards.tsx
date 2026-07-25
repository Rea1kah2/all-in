"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { AnalyzeResponse } from "@/types/analysis";

type Score = {
  label: string;
  hint: string;
  value: number;
};

function scoreTone(value: number) {
  if (value >= 70) return "text-bull";
  if (value >= 55) return "text-hold";
  return "text-bear";
}

function barTone(value: number) {
  if (value >= 70) return "bg-bull";
  if (value >= 55) return "bg-hold";
  return "bg-bear";
}

export function ScoreCards({ result }: { result: AnalyzeResponse }) {
  const t = useTranslations("analysis.scores");

  const scores: Score[] = [
    {
      label: t("fundamentalLabel"),
      hint: t("fundamentalHint"),
      value: result.fundamental_score,
    },
    {
      label: t("technicalLabel"),
      hint: t("technicalHint"),
      value: result.technical_score,
    },
    {
      label: t("marketIntelLabel"),
      hint: t("marketIntelHint"),
      value: result.market_intelligence_score,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {scores.map(({ label, hint, value }, index) => (
        <div
          key={label}
          className="animate-stagger rounded-card border border-line bg-surface p-5"
          style={{ animationDelay: `${1400 + index * 200}ms` }}
        >
          <p className="text-xs text-ink-muted">{label}</p>
          <p className={cn("mt-2 font-mono text-3xl", scoreTone(value))}>{value}</p>
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-bg">
            <div
              className={cn("h-full rounded-full", barTone(value))}
              style={{ width: `${value}%` }}
            />
          </div>
          <p className="mt-3 text-xs leading-relaxed text-ink-faint">{hint}</p>
        </div>
      ))}
    </div>
  );
}
