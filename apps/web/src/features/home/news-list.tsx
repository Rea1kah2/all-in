"use client";

import { useTranslations } from "next-intl";
import { useNews } from "@/features/market/use-market";
import { NewsFeatured, NewsRow } from "@/features/news/news-row";

export function NewsList() {
  const news = useNews();
  const t = useTranslations("home");

  const [featured, ...rest] = news.data ?? [];

  return (
    <section className="space-y-3">
      <h2 className="text-sm text-ink-muted">{t("news")}</h2>

      {news.isPending ? (
        <div className="space-y-3">
          <div className="aspect-video animate-pulse rounded-card border border-line bg-surface" />
          <div className="h-16 animate-pulse rounded-card border border-line bg-surface" />
        </div>
      ) : news.isError || !news.data ? (
        <p className="rounded-card border border-line bg-surface p-4 text-center text-sm text-ink-muted">
          {t("newsError")}
        </p>
      ) : (
        <div className="space-y-3">
          {featured ? <NewsFeatured item={featured} /> : null}
          {rest.length > 0 ? (
            <div className="rounded-card border border-line bg-surface p-2">
              {rest.map((item) => (
                <NewsRow key={item.id} item={item} />
              ))}
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
