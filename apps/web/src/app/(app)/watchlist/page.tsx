import { getTranslations } from "next-intl/server";
import { WatchlistView } from "@/features/watchlist/watchlist-view";

export default async function WatchlistPage() {
  const t = await getTranslations("watchlist");

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl text-ink">{t("title")}</h1>
        <p className="mt-1 text-sm text-ink-muted">{t("subtitle")}</p>
      </div>

      <WatchlistView />
    </div>
  );
}
