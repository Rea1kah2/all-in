"use client";

import { useTranslations } from "next-intl";
import { StarIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useAddToWatchlist, useRemoveFromWatchlist, useWatchlist } from "./use-watchlist";

export function WatchlistStar({ ticker }: { ticker: string }) {
  const t = useTranslations("watchlistStar");
  const watchlist = useWatchlist();
  const add = useAddToWatchlist();
  const remove = useRemoveFromWatchlist();

  const existing = watchlist.data?.find((item) => item.ticker === ticker);
  const isSaved = Boolean(existing);
  const isBusy = watchlist.isPending || add.isPending || remove.isPending;

  const toggle = () => {
    if (existing) {
      remove.mutate(existing.id);
    } else {
      add.mutate({ ticker });
    }
  };

  return (
    <Button variant="secondary" onClick={toggle} loading={isBusy} aria-pressed={isSaved}>
      {isBusy ? null : (
        <StarIcon size={16} className={isSaved ? "fill-current" : undefined} />
      )}
      {isSaved ? t("saved") : t("save")}
    </Button>
  );
}
