import Link from "next/link";
import { MarketStatus } from "@/components/domain/market-status";
import { UserMenu } from "@/components/layout/user-menu";
import { ThemeToggle } from "@/components/theme-toggle";

export function AppTopbar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-line bg-bg/85 px-5 backdrop-blur md:px-8">
      <Link href="/home" className="flex items-center gap-2.5 md:hidden">
        <span className="size-2 rounded-full bg-brass" />
        <span className="text-sm text-ink">Stock AI</span>
      </Link>

      <div className="hidden md:block" />

      <div className="flex items-center gap-3">
        <MarketStatus />
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
