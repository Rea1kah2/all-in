"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRightIcon, StarIcon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { useWatchlist } from "@/features/watchlist/use-watchlist";
import { cn, formatPercent } from "@/lib/utils";
import type { WatchlistItem } from "@/types/watchlist";

const verdictVariant = {
  BUY: "bull",
  HOLD: "hold",
  SELL: "bear",
} as const;

function SnippetRow({ item }: { item: WatchlistItem }) {
  const tVerdict = useTranslations("verdict");
  const variant = item.recommendation ? verdictVariant[item.recommendation] : null;
  const positive = item.price.changePercent >= 0;
  return (
    <Link
      href={`/companies/${item.ticker}`}
      className="flex items-center justify-between gap-3 rounded-badge px-2 py-2 transition-colors hover:bg-surface-hover"
    >
      <div className="flex items-center gap-2.5">
        <span className="font-mono text-sm text-ink">{item.ticker}</span>
        {variant && item.recommendation ? (
          <Badge variant={variant}>{tVerdict(`${item.recommendation}.label`)}</Badge>
        ) : (
          <Badge variant="neutral">{tVerdict("notAnalyzed")}</Badge>
        )}
      </div>
      <span className={cn("font-mono text-xs", positive ? "text-bull" : "text-bear")}>
        {formatPercent(item.price.changePercent)}
      </span>
    </Link>
  );
}

export function WatchlistSnippet() {
  const watchlist = useWatchlist();
  const t = useTranslations("home");

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm text-ink-muted">{t("watchlist")}</h2>
        <Link
          href="/watchlist"
          className="flex items-center gap-1 text-xs text-teal transition-colors hover:opacity-80"
        >
          {t("seeAll")}
          <ArrowRightIcon size={14} />
        </Link>
      </div>

      <div className="rounded-card border border-line bg-surface p-2">
        {watchlist.isPending ? (
          <div className="space-y-2 p-1">
            {[0, 1, 2].map((key) => (
              <div key={key} className="h-10 animate-pulse rounded-badge bg-bg" />
            ))}
          </div>
        ) : watchlist.isError || !watchlist.data ? (
          <p className="p-4 text-center text-sm text-ink-muted">{t("watchlistError")}</p>
        ) : watchlist.data.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-6 text-center">
            <StarIcon size={20} className="text-ink-faint" />
            <p className="text-xs text-ink-muted">{t("watchlistEmpty")}</p>
          </div>
        ) : (
          watchlist.data
            .slice(0, 4)
            .map((item) => <SnippetRow key={item.id} item={item} />)
        )}
      </div>
    </section>
  );
}
