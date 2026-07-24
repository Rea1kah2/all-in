"use client";

import { useTranslations } from "next-intl";
import { MarketStatus } from "@/components/domain/market-status";
import { TrendingDownIcon, TrendingUpIcon } from "@/components/icons";
import { Sparkline } from "@/components/ui/sparkline";
import { useMarket } from "@/features/market/use-market";
import { cn, formatPercent } from "@/lib/utils";

function formatIndexValue(value: number) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function MarketSummary() {
  const market = useMarket();
  const t = useTranslations("home");

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm text-ink-muted">{t("marketSummary")}</h2>
        <MarketStatus />
      </div>

      {market.isPending ? (
        <div className="grid gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((key) => (
            <div
              key={key}
              className="h-24 animate-pulse rounded-card border border-line bg-surface"
            />
          ))}
        </div>
      ) : market.isError || !market.data ? (
        <div className="rounded-card border border-line bg-surface p-6 text-center text-sm text-ink-muted">
          {t("marketError")}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-3">
          {market.data.indices.map((index) => {
            const positive = index.change >= 0;
            return (
              <div
                key={index.symbol}
                className="rounded-card border border-line bg-surface p-5"
              >
                <p className="text-xs text-ink-muted">{index.name}</p>
                <div className="mt-2 flex items-end justify-between gap-3">
                  <div>
                    <p className="font-mono text-2xl text-ink">
                      {formatIndexValue(index.value)}
                    </p>
                    <p
                      className={cn(
                        "mt-1 flex items-center gap-1.5 font-mono text-xs",
                        positive ? "text-bull" : "text-bear",
                      )}
                    >
                      {positive ? (
                        <TrendingUpIcon size={13} />
                      ) : (
                        <TrendingDownIcon size={13} />
                      )}
                      {formatPercent(index.changePercent)}
                    </p>
                  </div>
                  <Sparkline
                    data={index.spark}
                    className={cn("shrink-0", positive ? "text-bull" : "text-bear")}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
