"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Sparkline } from "@/components/ui/sparkline";
import { popularTickers } from "@/config/tickers";
import { useWatchlist } from "@/features/watchlist/use-watchlist";
import { cn, formatPercent, formatPrice } from "@/lib/utils";

export function FavoritesStrip() {
  const watchlist = useWatchlist();
  const t = useTranslations("home");

  const favorites = watchlist.data?.slice(0, 5) ?? [];

  return (
    <section className="space-y-3">
      <h2 className="text-sm text-ink-muted">{t("favorites")}</h2>

      {watchlist.isPending ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((key) => (
            <div
              key={key}
              className="h-16 animate-pulse rounded-card border border-line bg-surface"
            />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="rounded-card border border-line bg-surface p-5">
          <p className="text-xs text-ink-muted">{t("favoritesEmpty")}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {popularTickers.slice(0, 5).map((item) => (
              <Link
                key={item.ticker}
                href={`/companies/${item.ticker}`}
                className="rounded-pill border border-line px-3 py-1.5 font-mono text-xs text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink"
              >
                {item.ticker}
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((item) => {
            const positive = item.price.changePercent >= 0;
            return (
              <Link
                key={item.id}
                href={`/companies/${item.ticker}`}
                className="flex items-center justify-between gap-3 rounded-card border border-line bg-surface p-4 transition-colors hover:border-brass/50 hover:bg-surface-hover"
              >
                <div className="min-w-0">
                  <p className="font-mono text-sm text-ink">{item.ticker}</p>
                  <p className="truncate text-xs text-ink-muted">{item.name}</p>
                </div>
                <div className="flex items-center gap-3">
                  {item.spark ? (
                    <Sparkline
                      data={item.spark}
                      width={56}
                      height={24}
                      className={cn("shrink-0", positive ? "text-bull" : "text-bear")}
                    />
                  ) : null}
                  <div className="text-right">
                    <p className="font-mono text-xs text-ink">
                      {formatPrice(item.price.current, item.price.currency)}
                    </p>
                    <p
                      className={cn(
                        "font-mono text-xs",
                        positive ? "text-bull" : "text-bear",
                      )}
                    >
                      {formatPercent(item.price.changePercent)}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
