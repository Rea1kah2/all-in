"use client";

import { useTranslations } from "next-intl";
import { TrendingDownIcon, TrendingUpIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import type { AnalyzeResponse } from "@/types/analysis";

const verdictStyles = {
  BUY: {
    border: "border-bull/50",
    background: "bg-bull-bg",
    text: "text-bull",
  },
  HOLD: {
    border: "border-hold/50",
    background: "bg-hold-bg",
    text: "text-hold",
  },
  SELL: {
    border: "border-bear/50",
    background: "bg-bear-bg",
    text: "text-bear",
  },
} as const;

export function VerdictCard({
  result,
  ticker,
  companyName,
}: {
  result: AnalyzeResponse;
  ticker: string;
  companyName: string;
}) {
  const t = useTranslations("analysis");
  const tVerdict = useTranslations("verdict");
  const style = verdictStyles[result.recommendation];
  const isBuy = result.recommendation === "BUY";
  const isSell = result.recommendation === "SELL";

  return (
    <div
      className={cn(
        "animate-stagger rounded-card border p-6 md:p-8",
        style.border,
        style.background,
      )}
      style={{ animationDelay: "0ms" }}
    >
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="space-y-2">
          <p className="font-mono text-xs text-ink-muted">
            {ticker}, {companyName}
          </p>
          <div className="flex items-baseline gap-3">
            <span className={cn("font-mono text-5xl", style.text)}>
              {result.recommendation}
            </span>
            {isBuy ? <TrendingUpIcon size={28} className={style.text} /> : null}
            {isSell ? <TrendingDownIcon size={28} className={style.text} /> : null}
          </div>
          <p className="text-sm text-ink">
            {tVerdict(`${result.recommendation}.label`)},{" "}
            {tVerdict(`${result.recommendation}.description`)}
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-ink-muted">{t("confidence")}</p>
          <p className={cn("font-mono text-3xl", style.text)}>{result.confidence}%</p>
        </div>
      </div>
    </div>
  );
}
