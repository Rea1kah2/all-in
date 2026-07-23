"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { GridIcon, HistoryIcon, SpinnerIcon, TrashIcon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn, formatPercent, formatPrice } from "@/lib/utils";
import type { WatchlistItem } from "@/types/watchlist";
import { PriceAlertDialog } from "./price-alert-dialog";
import { useAlerts } from "./use-alerts";
import { useRemoveFromWatchlist } from "./use-watchlist";

const verdictVariant = {
  BUY: "bull",
  HOLD: "hold",
  SELL: "bear",
} as const;

export function WatchlistRow({ item }: { item: WatchlistItem }) {
  const remove = useRemoveFromWatchlist();
  const alerts = useAlerts();
  const t = useTranslations("watchlist.actions");
  const tVerdict = useTranslations("verdict");
  const tConfirm = useTranslations("confirm");
  const alert = alerts.data?.find((entry) => entry.ticker === item.ticker);
  const variant = item.recommendation ? verdictVariant[item.recommendation] : null;
  const isPositive = item.price.changePercent >= 0;

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-card border border-line bg-surface p-4 sm:flex-nowrap">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href={`/companies/${item.ticker}`}
            className="font-mono text-sm text-ink transition-colors hover:text-teal"
          >
            {item.ticker}
          </Link>
          {variant && item.recommendation ? (
            <Badge variant={variant} numeric>
              {tVerdict(`${item.recommendation}.label`)}
              {item.confidence !== null ? ` ${item.confidence}%` : ""}
            </Badge>
          ) : (
            <Badge variant="neutral">{tVerdict("notAnalyzed")}</Badge>
          )}
        </div>
        <p className="mt-1 truncate text-xs text-ink-muted">{item.name}</p>
      </div>

      <div className="text-right">
        <p className="font-mono text-sm text-ink">
          {formatPrice(item.price.current, item.price.currency)}
        </p>
        <p className={cn("font-mono text-xs", isPositive ? "text-bull" : "text-bear")}>
          {formatPercent(item.price.changePercent)}
        </p>
      </div>

      <div className="flex items-center gap-1">
        <Button
          asChild
          variant="ghost"
          size="icon"
          aria-label={t("reanalyze")}
          title={t("reanalyze")}
        >
          <Link href={`/analysis?ticker=${item.ticker}`}>
            <HistoryIcon size={18} />
          </Link>
        </Button>
        <PriceAlertDialog
          ticker={item.ticker}
          price={item.price.current}
          currency={item.price.currency}
          alert={alert}
        />
        <Button
          asChild
          variant="ghost"
          size="icon"
          aria-label={t("detail")}
          title={t("detail")}
        >
          <Link href={`/companies/${item.ticker}`}>
            <GridIcon size={18} />
          </Link>
        </Button>
        <ConfirmDialog
          destructive
          title={tConfirm("deleteWatchlistTitle")}
          description={tConfirm("deleteWatchlistBody", { name: item.name })}
          confirmLabel={tConfirm("deleteConfirm")}
          onConfirm={() => remove.mutate(item.id)}
          trigger={
            <Button
              variant="ghost"
              size="icon"
              aria-label={t("remove")}
              title={t("remove")}
              disabled={remove.isPending}
            >
              {remove.isPending ? <SpinnerIcon size={18} /> : <TrashIcon size={18} />}
            </Button>
          }
        />
      </div>
    </div>
  );
}
