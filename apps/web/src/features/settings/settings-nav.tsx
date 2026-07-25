"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { GearIcon, PersonIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

const items = [
  { href: "/settings/profile", key: "profile" as const, Icon: PersonIcon },
  { href: "/settings", key: "settings" as const, Icon: GearIcon },
];

export function SettingsNav() {
  const pathname = usePathname();
  const t = useTranslations("userMenu");

  return (
    <nav className="flex items-center gap-2 border-line border-b pb-3">
      {items.map(({ href, key, Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-1.5 rounded-badge px-3 py-1.5 text-sm transition-colors",
              active
                ? "bg-brass-bg text-brass-ink"
                : "text-ink-muted hover:bg-surface-hover hover:text-ink",
            )}
          >
            <Icon size={15} />
            {t(key)}
          </Link>
        );
      })}
    </nav>
  );
}
