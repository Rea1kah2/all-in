"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { mainNav } from "@/config/nav";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppSidebar({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const tApp = useTranslations("app");

  return (
    <aside
      aria-hidden={collapsed}
      className={cn(
        "hidden shrink-0 overflow-hidden border-line bg-surface transition-[width] duration-200 md:sticky md:top-16 md:flex md:h-[calc(100vh-4rem)] md:flex-col",
        collapsed ? "md:w-0 md:border-0" : "md:w-60 md:border-r",
      )}
    >
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {mainNav.map(({ href, key, Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-badge px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-surface-hover text-teal"
                  : "text-ink-muted hover:bg-surface-hover hover:text-ink",
              )}
            >
              <Icon size={16} />
              {t(`${key}.label`)}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-line p-4">
        <p className="text-xs leading-relaxed text-ink-faint">{tApp("sidebarNote")}</p>
      </div>
    </aside>
  );
}
