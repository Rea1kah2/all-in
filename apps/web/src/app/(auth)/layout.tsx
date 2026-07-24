import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { BookIcon, BulbIcon, CandlestickIcon } from "@/components/icons";
import { site } from "@/config/site";
import { LocaleToggle } from "@/features/i18n/locale-toggle";

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const t = await getTranslations("authPanel");

  const points = [
    { Icon: BulbIcon, title: t("reasoningTitle"), body: t("reasoningBody") },
    { Icon: BookIcon, title: t("educationTitle"), body: t("educationBody") },
    { Icon: CandlestickIcon, title: t("smcTitle"), body: t("smcBody") },
  ];

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="hidden flex-col justify-between bg-linear-to-br from-brass-bg/50 to-surface p-10 lg:flex xl:p-14">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="size-2 rounded-full bg-brass" />
          <span className="text-sm text-ink">{site.name}</span>
        </Link>

        <div className="max-w-md space-y-8">
          <p className="text-2xl leading-snug text-ink">{t("tagline")}</p>
          <ul className="space-y-5">
            {points.map((point) => (
              <li key={point.title} className="flex gap-3.5">
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-badge bg-brass-bg text-brass-ink">
                  <point.Icon size={18} />
                </span>
                <div>
                  <p className="text-sm text-ink">{point.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                    {point.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="max-w-md text-xs leading-relaxed text-ink-faint">
          {t("disclaimer")}
        </p>
      </aside>

      <main className="flex flex-col items-center justify-center px-5 py-10">
        <div className="flex w-full max-w-sm items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 lg:hidden">
            <span className="size-2 rounded-full bg-brass" />
            <span className="text-sm text-ink">{site.name}</span>
          </Link>
          <div className="ml-auto">
            <LocaleToggle />
          </div>
        </div>

        <div className="mt-8 w-full max-w-sm rounded-card border border-line bg-surface p-7">
          {children}
        </div>
      </main>
    </div>
  );
}
