"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";
import { type ComponentType, useState } from "react";
import {
  BulbIcon,
  CandlestickIcon,
  DocumentIcon,
  GridIcon,
  type IconProps,
  SearchIcon,
  TrendingUpIcon,
} from "@/components/icons";
import { cn, relativeTime } from "@/lib/utils";
import { type NewsCategory, type NewsItem, newsImagePath } from "@/types/news";

const categoryStyle: Record<
  NewsCategory,
  { Icon: ComponentType<IconProps>; accent: string; tint: string }
> = {
  tech: { Icon: BulbIcon, accent: "text-teal", tint: "from-teal/15" },
  chips: { Icon: GridIcon, accent: "text-hold", tint: "from-hold/15" },
  macro: { Icon: DocumentIcon, accent: "text-ink-muted", tint: "from-ink/10" },
  auto: { Icon: TrendingUpIcon, accent: "text-bull", tint: "from-bull/15" },
  retail: { Icon: SearchIcon, accent: "text-teal", tint: "from-teal/15" },
  crypto: { Icon: CandlestickIcon, accent: "text-hold", tint: "from-hold/15" },
};

export function NewsImage({
  category,
  alt,
  iconSize,
  sizes,
  className,
}: {
  category: NewsCategory;
  alt: string;
  iconSize: number;
  sizes: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const style = categoryStyle[category];
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-linear-to-br to-surface",
        style.tint,
        className,
      )}
    >
      {failed ? (
        <style.Icon size={iconSize} className={cn(style.accent, "opacity-80")} />
      ) : (
        <Image
          src={newsImagePath(category)}
          alt={alt}
          fill
          sizes={sizes}
          className="object-cover"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

function Meta({ item, locale }: { item: NewsItem; locale: string }) {
  const primaryTicker = item.tickers[0];
  return (
    <p className="mt-1.5 flex items-center gap-2 text-xs text-ink-muted">
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

export function NewsRow({ item }: { item: NewsItem }) {
  const locale = useLocale();
  return (
    <Link
      href={`/news/${item.id}`}
      className="flex items-center gap-3 rounded-badge p-2.5 transition-colors hover:bg-surface-hover"
    >
      <NewsImage
        category={item.category}
        alt={item.title}
        iconSize={20}
        sizes="96px"
        className="h-16 w-24 shrink-0 rounded-badge"
      />
      <div className="min-w-0">
        <p className="line-clamp-2 text-sm leading-snug text-ink">{item.title}</p>
        <Meta item={item} locale={locale} />
      </div>
    </Link>
  );
}

export function NewsFeatured({ item }: { item: NewsItem }) {
  const locale = useLocale();
  return (
    <Link
      href={`/news/${item.id}`}
      className="group block overflow-hidden rounded-card border border-line bg-surface transition-colors hover:border-brass/40"
    >
      <NewsImage
        category={item.category}
        alt={item.title}
        iconSize={44}
        sizes="(min-width: 1024px) 50vw, 100vw"
        className="aspect-video w-full"
      />
      <div className="p-4">
        <p className="line-clamp-2 text-base leading-snug text-ink group-hover:text-brass-ink">
          {item.title}
        </p>
        <Meta item={item} locale={locale} />
      </div>
    </Link>
  );
}
