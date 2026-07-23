"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { ArrowRightIcon, SearchIcon } from "@/components/icons";
import { Input } from "@/components/ui/input";
import { popularTickers } from "@/config/tickers";

export default function CompaniesPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const t = useTranslations("companies");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const ticker = query.trim().toUpperCase();
    if (ticker.length === 0) return;
    router.push(`/companies/${ticker}`);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <div>
        <h1 className="text-2xl text-ink">{t("title")}</h1>
        <p className="mt-1 text-sm text-ink-muted">{t("subtitle")}</p>
      </div>

      <form onSubmit={handleSubmit} className="relative">
        <label htmlFor="ticker-search" className="sr-only">
          {t("searchLabel")}
        </label>
        <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-ink-faint">
          <SearchIcon size={18} />
        </span>
        <Input
          id="ticker-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("searchPlaceholder")}
          className="h-12 pl-11 text-base"
          autoComplete="off"
          spellCheck={false}
        />
      </form>

      <section className="space-y-4">
        <h2 className="text-sm text-ink-muted">{t("popular")}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {popularTickers.map(({ ticker, name, sector }) => (
            <button
              key={ticker}
              type="button"
              onClick={() => router.push(`/companies/${ticker}`)}
              className="group flex flex-col items-start gap-2 rounded-card border border-line bg-surface p-5 text-left transition-colors hover:border-brass/50 hover:bg-surface-hover"
            >
              <div className="flex w-full items-center justify-between">
                <span className="font-mono text-m text-ink">{ticker}</span>
                <span className="text-ink-faint transition-colors group-hover:text-brass">
                  <ArrowRightIcon size={16} />
                </span>
              </div>
              <p className="text-sm text-ink">{name}</p>
              <p className="text-xs text-ink-muted">{sector}</p>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
