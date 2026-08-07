import { getTranslations } from "next-intl/server";
import { ActivityStrip } from "@/features/home/activity-strip";
import { FavoritesStrip } from "@/features/home/favorites-strip";
import { MarketMovers } from "@/features/home/market-movers";
import { MarketSummary } from "@/features/home/market-summary";
import { NewsList } from "@/features/home/news-list";
import { WatchlistSnippet } from "@/features/home/watchlist-snippet";

export default async function HomePage() {
  const t = await getTranslations("home");

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl text-ink">{t("title")}</h1>
        <p className="mt-1 text-sm text-ink-muted">{t("subtitle")}</p>
      </div>

      <ActivityStrip />

      {/*
        Dua kolom di layar lebar, bukan satu tumpukan selebar halaman. Kolom
        utama memuat data pasar yang memang butuh ruang, kolom samping memuat
        daftar yang tetap terbaca meski sempit. Di bawah lg keduanya menumpuk
        seperti semula, jadi tampilan ponsel tidak berubah.
      */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <MarketSummary />
          <FavoritesStrip />
          <MarketMovers />
        </div>

        <div className="space-y-6">
          <WatchlistSnippet />
          <NewsList />
        </div>
      </div>
    </div>
  );
}
