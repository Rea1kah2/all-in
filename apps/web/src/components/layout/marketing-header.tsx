import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { marketingNav, site } from "@/config/site";
import { LocaleToggle } from "@/features/i18n/locale-toggle";

export async function MarketingHeader() {
  const t = await getTranslations("marketing");

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-5 md:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="size-2 rounded-full bg-brass" />
          <span className="text-sm text-ink">{site.name}</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {marketingNav.map(({ href, key }) => (
            <Link
              key={href}
              href={href}
              className="text-sm text-ink-muted transition-colors hover:text-ink"
            >
              {t(`nav.${key}`)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <LocaleToggle />
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href="/login">{t("login")}</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/register">{t("register")}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
