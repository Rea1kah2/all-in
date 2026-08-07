"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { MarketStatus } from "@/components/domain/market-status";
import { MenuIcon } from "@/components/icons";
import { LogoutButton } from "@/components/layout/logout-button";
import { UserMenu } from "@/components/layout/user-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { site } from "@/config/site";
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

          {/*
            `shrink-0` dan `whitespace-nowrap` mencegah nama brand terpotong
            menjadi dua baris di layar sempit, yang sempat terjadi karena baris
            kanan topbar penuh oleh status pasar dan tombol tombol.
          */}
          <Link href="/home" className="flex shrink-0 items-center gap-2.5">
            <span className="size-2 shrink-0 rounded-full bg-brass" />
            <span className="whitespace-nowrap text-sm text-ink">{site.name}</span>
          </Link>
        </div>

        <div className="flex items-center gap-2.5">
          {/*
            Disembunyikan di ponsel. Badge ini tidak bisa menyusut karena
            labelnya satu baris, jadi di layar sempit ia mendorong avatar keluar
            layar. Halaman Home sudah menampilkan status pasar yang sama di
            bagian Ringkasan pasar, jadi tidak ada informasi yang hilang.
          */}
          <div className="hidden sm:flex">
            <MarketStatus />
          </div>
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
