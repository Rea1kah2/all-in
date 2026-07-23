"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { NewsIcon } from "@/components/icons";
import type { NewsItem } from "@/types/news";

function relativeTime(iso: string, locale: string) {
  const diffMinutes = Math.round((new Date(iso).getTime() - Date.now()) / 60_000);
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  if (Math.abs(diffMinutes) < 60) return formatter.format(diffMinutes, "minute");
  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) return formatter.format(diffHours, "hour");
  return formatter.format(Math.round(diffHours / 24), "day");
}

export function NewsRow({ item }: { item: NewsItem }) {
  const locale = useLocale();
  const primaryTicker = item.tickers[0];
  const content = (
    <div className="flex items-start gap-3 rounded-badge p-3 transition-colors hover:bg-surface-hover">
      <span className="mt-0.5 text-ink-faint">
        <NewsIcon size={18} />
      </span>
      <div className="min-w-0">
        <p className="text-sm leading-snug text-ink">{item.title}</p>
        <p className="mt-1 text-xs text-ink-muted">
          {item.source}, {relativeTime(item.publishedAt, locale)}
          {primaryTicker ? (
            <span className="ml-2 font-mono text-ink-faint">{primaryTicker}</span>
          ) : null}
        </p>
      </div>
    </div>
  );

  if (primaryTicker) {
    return <Link href={`/companies/${primaryTicker}`}>{content}</Link>;
  }
  return content;
}
