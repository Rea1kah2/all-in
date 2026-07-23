import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowRightIcon } from "@/components/icons";
import {
  findCategory,
  learnCategories,
  learnCategorySlugSchema,
  localizedCategory,
  localizedTerm,
  termsByCategory,
} from "@/config/learn";
import { categoryArticles } from "@/features/learn/category-content";
import type { Locale } from "@/i18n/config";

export function generateStaticParams() {
  return learnCategories.map((category) => ({ category: category.slug }));
}

export const dynamicParams = false;

export default async function LearnCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: raw } = await params;
  const parsed = learnCategorySlugSchema.safeParse(raw);
  if (!parsed.success) {
    notFound();
  }

  const slug = parsed.data;
  const category = findCategory(slug);
  if (!category) {
    notFound();
  }

  const t = await getTranslations("learn");
  const locale = (await getLocale()) as Locale;
  const Article = categoryArticles[locale][slug];
  const terms = termsByCategory(slug);
  const categoryDisplay = localizedCategory(category, locale);

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <div>
        <Link
          href="/learn"
          className="text-xs text-ink-muted transition-colors hover:text-ink"
        >
          {t("title")}
        </Link>
        <h1 className="mt-2 text-2xl text-ink">{categoryDisplay.title}</h1>
        <p className="mt-1 text-sm text-ink-muted">{categoryDisplay.description}</p>
      </div>

      <article>
        <Article />
      </article>

      <section className="space-y-4">
        <h2 className="text-sm text-ink-muted">{t("termsInCategory")}</h2>
        <div className="space-y-3">
          {terms.map((term) => {
            const display = localizedTerm(term, locale);
            return (
              <div
                key={term.slug}
                id={term.slug}
                className="scroll-mt-24 rounded-card border border-line bg-surface p-4"
              >
                <p className="text-sm text-ink">{display.term}</p>
                <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                  {display.short}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <Link
        href="/learn"
        className="inline-flex items-center gap-1 text-xs text-teal transition-colors hover:opacity-80"
      >
        {t("backToCategories")}
        <ArrowRightIcon size={13} />
      </Link>
    </div>
  );
}
