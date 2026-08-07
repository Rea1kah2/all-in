"use client";

import Image from "next/image";
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

/**
 * Yahoo menyertakan gambar untuk sebagian besar beritanya, jadi dipakai apa
 * adanya. Ikon hanya muncul untuk berita yang benar benar tidak punya gambar,
 * bukan sebagai penampilan utama, karena kotak placeholder besar di kartu utama
 * cuma membuang ruang.
 */
function Thumb({
  item,
  className,
  iconSize,
  sizes,
}: {
  item: NewsItem;
  className?: string;
  iconSize: number;
  sizes: string;
}) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-linear-to-br from-brass-bg to-surface text-brass-ink",
        className,
      )}
    >
      {item.image ? (
        <Image src={item.image} alt="" fill sizes={sizes} className="object-cover" />
      ) : (
        <NewsIcon size={iconSize} className="opacity-70" />
      )}
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
      <Thumb
        item={item}
        iconSize={20}
        sizes="96px"
        className="h-16 w-24 shrink-0 rounded-badge"
      />
      <div className="min-w-0">
        <p className="line-clamp-2 text-sm leading-snug text-ink">{item.title}</p>
        <Meta item={item} locale={locale} />
      </div>
    </a>
  );
}

/**
 * Kartu utama memakai tata letak mendatar di layar lebar, bukan gambar selebar
 * kartu. Thumbnail Yahoo sering hanya berukuran beberapa ratus piksel, jadi
 * meregangkannya selebar halaman membuatnya pecah dan terlihat murah. Dengan
 * lebar gambar yang dibatasi, gambar tetap tajam dan kartunya jadi lebih padat.
 */
export function NewsFeatured({ item }: { item: NewsItem }) {
  const locale = useLocale();
  return (
    <a
      {...externalLinkProps(item.url)}
      className="group flex flex-col overflow-hidden rounded-card border border-line bg-surface transition-colors hover:border-brass/40 sm:flex-row"
    >
      <Thumb
        item={item}
        iconSize={36}
        sizes="(min-width: 640px) 280px, 100vw"
        className="h-40 w-full shrink-0 sm:h-auto sm:w-64 sm:self-stretch"
      />
      <div className="flex flex-col justify-center p-5">
        <p className="line-clamp-3 text-base leading-snug text-ink group-hover:text-brass-ink">
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
