"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { SearchIcon, StarIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useWatchlist } from "./use-watchlist";
import { WatchlistRow } from "./watchlist-row";

export function WatchlistView() {
  const watchlist = useWatchlist();
  const t = useTranslations("watchlist");

  if (watchlist.isPending) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map((key) => (
          <div
            key={key}
            className="h-20 animate-pulse rounded-card border border-line bg-surface"
          />
        ))}
      </div>
    );
  }

  if (watchlist.isError) {
    return (
      <div className="rounded-card border border-line bg-surface p-8 text-center">
        <p className="text-sm text-ink">{t("error")}</p>
      </div>
    );
  }

  if (watchlist.data.length === 0) {
    return (
      <div className="rounded-card border border-line bg-surface p-10 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full border border-brass bg-brass-bg text-brass-ink">
          <StarIcon size={22} />
        </div>
        <p className="mt-6 text-sm text-ink">{t("emptyTitle")}</p>
        <p className="mx-auto mt-2 max-w-md text-xs text-ink-muted">{t("emptyBody")}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild variant="secondary">
            <Link href="/companies">
              <SearchIcon size={16} />
              {t("browseCompanies")}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {watchlist.data.map((item) => (
        <WatchlistRow key={item.id} item={item} />
      ))}
    </div>
  );
}
