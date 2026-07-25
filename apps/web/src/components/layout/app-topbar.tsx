"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { MarketStatus } from "@/components/domain/market-status";
import { MenuIcon } from "@/components/icons";
import { LogoutButton } from "@/components/layout/logout-button";
import { UserMenu } from "@/components/layout/user-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { LocaleToggle } from "@/features/i18n/locale-toggle";
import { NotificationBell } from "@/features/notifications/notification-bell";

export function AppTopbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const t = useTranslations("app");

  return (
    <header className="sticky top-0 z-30 w-full border-line border-b bg-bg/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between gap-4 px-5 md:px-8">
        <div className="flex items-center gap-2.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            aria-label={t("toggleSidebar")}
            className="hidden md:inline-flex"
          >
            <MenuIcon size={20} />
          </Button>

          <Link href="/home" className="flex items-center gap-2.5">
            <span className="size-2 rounded-full bg-brass" />
            <span className="text-sm text-ink">Stock AI</span>
          </Link>
        </div>

        <div className="flex items-center gap-2.5">
          <MarketStatus />
          <NotificationBell />
          <ThemeToggle />
          <span className="hidden sm:inline-flex">
            <LocaleToggle />
          </span>
          <span className="hidden sm:inline-flex">
            <LogoutButton />
          </span>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
