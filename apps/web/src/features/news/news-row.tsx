"use client";

import { useLocale } from "next-intl";
import { ArrowRightIcon, NewsIcon } from "@/components/icons";
import { cn, relativeTime } from "@/lib/utils";
import type { NewsItem } from "@/types/news";

/**
 * Berita menautkan ke sumber aslinya di tab baru. Tidak ada halaman detail
 * karena Yahoo tidak menyediakan isi artikel, dan menyalinnya bukan hak kita.
 */
function externalLinkProps(url: string) {
  return { href: url, target: "_blank", rel: "noopener noreferrer" } as const;
}

function Meta({ item, locale }: { item: NewsItem; locale: string }) {
  const primaryTicker = item.tickers[0];
  return (
    <p className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-ink-muted">
      <span>{item.source}</span>
      <span className="text-ink-faint">{relativeTime(item.publishedAt, locale)}</span>
      {primaryTicker ? (
        <span className="rounded-badge bg-surface-hover px-1.5 py-0.5 font-mono text-ink-faint">
          {primaryTicker}
        </span>
      ) : null}
    </p>
  );
}

function Thumb({ className, iconSize }: { className?: string; iconSize: number }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center overflow-hidden bg-linear-to-br from-brass-bg to-surface text-brass-ink",
        className,
      )}
    >
      <NewsIcon size={iconSize} className="opacity-70" />
    </div>
  );
}

export function NewsRow({ item }: { item: NewsItem }) {
  const locale = useLocale();
  return (
    <a
      {...externalLinkProps(item.url)}
      className="flex items-center gap-3 rounded-badge p-2.5 transition-colors hover:bg-surface-hover"
    >
      <Thumb iconSize={20} className="h-16 w-24 shrink-0 rounded-badge" />
      <div className="min-w-0">
        <p className="line-clamp-2 text-sm leading-snug text-ink">{item.title}</p>
        <Meta item={item} locale={locale} />
      </div>
    </a>
  );
}

export function NewsFeatured({ item }: { item: NewsItem }) {
  const locale = useLocale();
  return (
    <a
      {...externalLinkProps(item.url)}
      className="group block overflow-hidden rounded-card border border-line bg-surface transition-colors hover:border-brass/40"
    >
      <Thumb iconSize={44} className="aspect-video w-full" />
      <div className="p-4">
        <p className="line-clamp-2 text-base leading-snug text-ink group-hover:text-brass-ink">
          {item.title}
        </p>
        <Meta item={item} locale={locale} />
        <span className="mt-3 inline-flex items-center gap-1.5 text-xs text-brass-ink">
          {item.source}
          <ArrowRightIcon size={13} />
        </span>
      </div>
    </a>
  );
}
