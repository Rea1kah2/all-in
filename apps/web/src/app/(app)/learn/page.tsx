import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowRightIcon } from "@/components/icons";
import { learnCategories, localizedCategory } from "@/config/learn";
import { GlossaryExplorer } from "@/features/learn/glossary-explorer";

export default async function LearnPage() {
  const t = await getTranslations("learn");
  const locale = await getLocale();

  return (
    <div className="mx-auto max-w-4xl space-y-10">
      <div>
        <h1 className="text-2xl text-ink">{t("title")}</h1>
        <p className="mt-1 text-sm text-ink-muted">{t("subtitle")}</p>
      </div>

      <section className="space-y-4">
        <h2 className="text-sm text-ink-muted">{t("categories")}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {learnCategories.map((category) => (
            <Link
              key={category.slug}
              href={`/learn/${category.slug}`}
              className="group flex items-start gap-4 rounded-card border border-line bg-surface p-5 transition-colors hover:border-brass/50 hover:bg-surface-hover"
            >
              <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full border border-brass bg-brass-bg text-brass-ink">
                <category.Icon size={18} />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-ink group-hover:text-brass-ink">
                  <span className="text-sm">
                    {localizedCategory(category, locale).title}
                  </span>
                  <ArrowRightIcon
                    size={14}
                    className="text-ink-faint transition-colors group-hover:text-brass"
                  />
                </div>
                <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                  {localizedCategory(category, locale).description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <GlossaryExplorer />
    </div>
  );
}
