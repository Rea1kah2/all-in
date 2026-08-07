"use client";

import { useTranslations } from "next-intl";
import { BulbIcon, CheckIcon, PlusIcon, StarIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { site } from "@/config/site";
import { MarketSnapshot } from "@/features/analysis/market-snapshot";
import { ReasoningTrail } from "@/features/analysis/reasoning-trail";
import { ScoreCards } from "@/features/analysis/score-cards";
import { VerdictCard } from "@/features/analysis/verdict-card";
import { useAddToWatchlist } from "@/features/watchlist/use-watchlist";
import type { AnalyzeResponse } from "@/types/analysis";

type Props = {
  result: AnalyzeResponse;
  ticker: string;
  companyName: string;
  onReset: () => void;
};

export function AnalysisResult({ result, ticker, companyName, onReset }: Props) {
  const save = useAddToWatchlist();
  const t = useTranslations("analysis");

  return (
    <div className="space-y-6">
      <VerdictCard result={result} ticker={ticker} companyName={companyName} />

      <ReasoningTrail result={result} />

      <ScoreCards result={result} />

      {result.market_data ? <MarketSnapshot data={result.market_data} /> : null}

      <div
        className="animate-stagger rounded-card border border-line bg-surface p-6"
        style={{ animationDelay: "2000ms" }}
      >
        <div className="flex items-center gap-2.5">
          <BulbIcon size={16} className="text-brass" />
          <h2 className="text-sm text-ink">{t("reasons")}</h2>
        </div>
        <ul className="mt-4 space-y-3">
          {result.reason.map((item) => (
            <li key={item} className="flex gap-3 text-sm text-ink">
              <span className="mt-2 size-1 shrink-0 rounded-full bg-brass" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {result.final_reasoning || result.what_could_change ? (
        <div className="grid gap-4 md:grid-cols-2">
          {result.final_reasoning ? (
            <div className="rounded-card border border-line bg-surface p-6">
              <h2 className="text-sm text-ink">{t("decisionSummary")}</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                {result.final_reasoning}
              </p>
            </div>
          ) : null}
          {result.what_could_change ? (
            <div className="rounded-card border border-brass/40 bg-brass-bg/30 p-6">
              <h2 className="text-sm text-ink">{t("whatCouldChange")}</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                {result.what_could_change}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      <div
        className="animate-stagger flex flex-wrap gap-3 pt-2"
        style={{ animationDelay: "2200ms" }}
      >
        <Button variant="secondary" onClick={onReset}>
          <PlusIcon size={16} />
          {t("analyzeAnother")}
        </Button>
        <Button
          variant="signal"
          onClick={() =>
            save.mutate({
              ticker,
              recommendation: result.recommendation,
              confidence: result.confidence,
            })
          }
          loading={save.isPending}
          disabled={save.isSuccess}
        >
          {save.isPending ? null : save.isSuccess ? (
            <CheckIcon size={16} />
          ) : (
            <StarIcon size={16} />
          )}
          {save.isSuccess ? t("saved") : t("save")}
        </Button>
      </div>

      {save.isError ? (
        <p className="rounded-badge bg-bear-bg px-3 py-2 text-xs text-bear">
          {t("saveError")}
        </p>
      ) : null}

      <p
        className="animate-stagger max-w-xl text-xs leading-relaxed text-ink-faint"
        style={{ animationDelay: "2400ms" }}
      >
        {t("disclaimer", { name: site.name })}
      </p>
    </div>
  );
}
