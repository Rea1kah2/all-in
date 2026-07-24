import { getTranslations } from "next-intl/server";
import { FavoritesStrip } from "@/features/home/favorites-strip";
import { MarketMovers } from "@/features/home/market-movers";
import { MarketSummary } from "@/features/home/market-summary";
import { NewsList } from "@/features/home/news-list";
import { WatchlistSnippet } from "@/features/home/watchlist-snippet";

export default async function HomePage() {
  const t = await getTranslations("home");

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl text-ink">{t("title")}</h1>
        <p className="mt-1 text-sm text-ink-muted">{t("subtitle")}</p>
      </div>

      <MarketSummary />
      <FavoritesStrip />
      <MarketMovers />

      <div className="grid gap-6 lg:grid-cols-2">
        <NewsList />
        <WatchlistSnippet />
      </div>
    </div>
  );
}
