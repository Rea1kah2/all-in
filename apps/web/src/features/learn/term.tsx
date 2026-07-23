"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { ArrowRightIcon } from "@/components/icons";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { findCategory, findTerm, localizedCategory, localizedTerm } from "@/config/learn";

export function Term({ slug, children }: { slug: string; children: ReactNode }) {
  const locale = useLocale();
  const t = useTranslations("learn");
  const term = findTerm(slug);

  if (!term) {
    return <>{children}</>;
  }

  const category = findCategory(term.category);
  const display = localizedTerm(term, locale);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="cursor-help font-medium text-ink underline decoration-brass decoration-dotted underline-offset-4 transition-colors hover:text-brass-ink"
        >
          {children}
        </button>
      </PopoverTrigger>
      <PopoverContent>
        <p className="text-sm text-ink">{display.term}</p>
        <p className="mt-2 text-xs leading-relaxed text-ink-muted">{display.short}</p>
        {category ? (
          <Link
            href={`/learn/${term.category}#${term.slug}`}
            className="mt-3 inline-flex items-center gap-1 text-xs text-teal transition-colors hover:opacity-80"
          >
            {t("learnMoreIn", {
              category: localizedCategory(category, locale).title,
            })}
            <ArrowRightIcon size={13} />
          </Link>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
