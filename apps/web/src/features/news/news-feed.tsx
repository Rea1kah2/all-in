"use client";

import { useTranslations } from "next-intl";
import { useNews } from "@/features/market/use-market";
import { NewsFeatured, NewsRow } from "@/features/news/news-row";

export function NewsFeed() {
  const news = useNews();
  const t = useTranslations("newsPage");

  if (news.isPending) {
    return (
      <div className="space-y-3">
        {/* Tingginya mengikuti kartu sungguhan supaya tata letak tidak melompat. */}
        <div className="h-64 w-full animate-pulse rounded-card bg-surface sm:h-40" />
        {[0, 1, 2, 3].map((key) => (
          <div key={key} className="h-20 animate-pulse rounded-card bg-surface" />
        ))}
      </div>
    );
  }

  if (news.isError) {
    return (
      <div className="rounded-card border border-line bg-surface p-8 text-center">
        <p className="text-sm text-ink-muted">{t("error")}</p>
      </div>
    );
  }

  const items = news.data ?? [];
  const [featured, ...rest] = items;

  if (!featured) {
    return (
      <div className="rounded-card border border-line bg-surface p-8 text-center">
        <p className="text-sm text-ink">{t("empty")}</p>
        <p className="mt-1 text-xs text-ink-muted">{t("emptyBody")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <NewsFeatured item={featured} />

      {rest.length > 0 ? (
        <div className="rounded-card border border-line bg-surface p-2">
          {rest.map((item) => (
            <NewsRow key={item.id} item={item} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
