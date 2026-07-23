"use client";

import { useTranslations } from "next-intl";
import { useNews } from "@/features/market/use-market";
import { NewsRow } from "@/features/news/news-row";

export function NewsList() {
  const news = useNews();
  const t = useTranslations("home");

  return (
    <section className="space-y-3">
      <h2 className="text-sm text-ink-muted">{t("news")}</h2>
      <div className="rounded-card border border-line bg-surface p-2">
        {news.isPending ? (
          <div className="space-y-2 p-1">
            {[0, 1, 2].map((key) => (
              <div key={key} className="h-14 animate-pulse rounded-badge bg-bg" />
            ))}
          </div>
        ) : news.isError || !news.data ? (
          <p className="p-4 text-center text-sm text-ink-muted">{t("newsError")}</p>
        ) : (
          news.data.map((item) => <NewsRow key={item.id} item={item} />)
        )}
      </div>
    </section>
  );
}
