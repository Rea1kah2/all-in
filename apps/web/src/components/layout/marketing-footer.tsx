import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { site } from "@/config/site";

const footerLinks = [
  { href: "/learn", key: "footerLearn" },
  { href: "/privacy", key: "footerPrivacy" },
  { href: "/terms", key: "footerTerms" },
];

export async function MarketingFooter() {
  const t = await getTranslations("marketing");

  return (
    <footer className="border-t border-line">
      <div className="mx-auto max-w-6xl px-5 py-10 md:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2.5">
            <span className="size-2 rounded-full bg-brass" />
            <span className="text-sm text-ink">{site.name}</span>
          </div>

          <nav className="flex flex-wrap gap-6">
            {footerLinks.map(({ href, key }) => (
              <Link
                key={href}
                href={href}
                className="text-sm text-ink-muted transition-colors hover:text-ink"
              >
                {t(key)}
              </Link>
            ))}
          </nav>
        </div>

        <p className="mt-8 max-w-2xl text-xs leading-relaxed text-ink-faint">
          {t("disclaimer", { name: site.name })}
        </p>
      </div>
    </footer>
  );
}
