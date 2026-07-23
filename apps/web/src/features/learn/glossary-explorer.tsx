"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { SearchIcon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { findCategory, glossary, localizedCategory, localizedTerm } from "@/config/learn";

export function GlossaryExplorer() {
  const [query, setQuery] = useState("");
  const locale = useLocale();
  const t = useTranslations("learn");

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (needle.length === 0) return glossary;
    return glossary.filter((item) => {
      const display = localizedTerm(item, locale);
      return (
        display.term.toLowerCase().includes(needle) ||
        display.short.toLowerCase().includes(needle) ||
        item.term.toLowerCase().includes(needle) ||
        item.aliases.some((alias) => alias.toLowerCase().includes(needle))
      );
    });
  }, [query, locale]);

  return (
    <section className="space-y-4">
      <h2 className="text-sm text-ink-muted">{t("glossary")}</h2>

      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-ink-faint">
          <SearchIcon size={18} />
        </span>
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("searchPlaceholder")}
          className="h-11 pl-11"
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      {results.length === 0 ? (
        <p className="rounded-card border border-line bg-surface p-6 text-center text-sm text-ink-muted">
          {t("noResults")}
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {results.map((item) => {
            const category = findCategory(item.category);
            const display = localizedTerm(item, locale);
            return (
              <Link
                key={item.slug}
                href={`/learn/${item.category}#${item.slug}`}
                className="group rounded-card border border-line bg-surface p-4 transition-colors hover:border-brass/50 hover:bg-surface-hover"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm text-ink group-hover:text-brass-ink">
                    {display.term}
                  </p>
                  {category ? (
                    <Badge variant="neutral">
                      {localizedCategory(category, locale).title}
                    </Badge>
                  ) : null}
                </div>
                <p className="mt-2 text-xs leading-relaxed text-ink-muted">
                  {display.short}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
