"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { mobileNav } from "@/config/nav";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-surface md:hidden">
      {mobileNav.map(({ href, key, Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] transition-colors",
              active ? "text-teal" : "text-ink-faint",
            )}
          >
            <Icon size={20} />
            {t(`${key}.short`)}
          </Link>
        );
      })}
    </nav>
  );
}
