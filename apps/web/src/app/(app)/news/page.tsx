import { getTranslations } from "next-intl/server";
import { NewsFeed } from "@/features/news/news-feed";

export default async function NewsPage() {
  const t = await getTranslations("newsPage");

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl text-ink">{t("title")}</h1>
        <p className="text-sm text-ink-muted">{t("subtitle")}</p>
      </div>

      <NewsFeed />
    </div>
  );
}
