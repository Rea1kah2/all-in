"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mainNav } from "@/config/nav";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 border-r border-lin bg-surface md:sticky md:top-0 md:flex md:h-screen md:flex-col">
      <div className="flex h-16 items-center border-b border-line px-5">
        <Link href="/home" className="flex items-center gap-2.5">
          <span className="size-2 rounded-full bg-brass" />
          <span className="text-sm text-ink">Stock AI</span>
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {mainNav.map(({ href, label, Icon }) => {
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
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-line p-4">
        <p className="text-xs leading-relaxed text-ink-faint">
          Analisis AI membantu Anda berpikir jernih. STAY DYOR!
        </p>
      </div>
    </aside>
  );
}
