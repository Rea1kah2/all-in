"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRightIcon, BulbIcon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNewsItem } from "@/features/market/use-market";
import { NewsImage } from "@/features/news/news-row";

function relativeTime(iso: string, locale: string) {
  const diffMinutes = Math.round((new Date(iso).getTime() - Date.now()) / 60_000);
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  if (Math.abs(diffMinutes) < 60) return formatter.format(diffMinutes, "minute");
  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) return formatter.format(diffHours, "hour");
  return formatter.format(Math.round(diffHours / 24), "day");
}

export default function NewsDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("newsDetail");
  const tCategory = useTranslations("newsCategory");
  const news = useNewsItem(params.id);

  if (news.isPending) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="aspect-video w-full animate-pulse rounded-card bg-surface" />
        <div className="h-8 w-3/4 animate-pulse rounded-badge bg-surface" />
        <div className="h-24 w-full animate-pulse rounded-card bg-surface" />
      </div>
    );
  }

  if (news.isError || !news.data) {
    return (
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-xs text-ink-muted transition-colors hover:text-ink"
        >
          {t("back")}
        </button>
        <div className="mt-6 rounded-card border border-line bg-surface p-8 text-center">
          <p className="text-sm text-ink">{t("loadError")}</p>
          <p className="mt-1 text-xs text-ink-muted">{t("loadErrorHint")}</p>
        </div>
      </div>
    );
  }

  const item = news.data;
  const primaryTicker = item.tickers[0];

  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <button
        type="button"
        onClick={() => router.back()}
        className="inline-flex items-center gap-1 text-xs text-ink-muted transition-colors hover:text-ink"
      >
        <ArrowRightIcon size={13} className="rotate-180" />
        {t("back")}
      </button>

      <NewsImage
        category={item.category}
        alt={item.title}
        iconSize={56}
        sizes="(min-width: 768px) 768px, 100vw"
        className="aspect-video w-full rounded-card border border-line"
      />

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2.5 text-xs text-ink-muted">
          <Badge variant="neutral">{tCategory(item.category)}</Badge>
          <span>{item.source}</span>
          <span className="text-ink-faint">{relativeTime(item.publishedAt, locale)}</span>
        </div>
        <h1 className="text-2xl leading-snug text-ink md:text-3xl">{item.title}</h1>
      </div>

      <div className="space-y-4">
        {item.body.map((paragraph) => (
          <p key={paragraph} className="text-sm leading-relaxed text-ink-muted">
            {paragraph}
          </p>
        ))}
      </div>

      <p className="rounded-badge bg-surface-hover px-3 py-2 text-xs text-ink-faint">
        {t("placeholderNote")}
      </p>

      {primaryTicker ? (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-line bg-surface p-5">
          <div>
            <p className="text-xs text-ink-muted">{t("relatedCompany")}</p>
            <p className="mt-0.5 font-mono text-sm text-ink">{primaryTicker}</p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <Button asChild variant="secondary" size="sm">
              <Link href={`/companies/${primaryTicker}`}>{t("viewCompany")}</Link>
            </Button>
            <Button asChild variant="signal" size="sm">
              <Link href={`/analysis?ticker=${primaryTicker}`}>
                <BulbIcon size={15} />
                {t("analyze")}
              </Link>
            </Button>
          </div>
        </div>
      ) : null}
    </article>
  );
}
