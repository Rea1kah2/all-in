"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { GearIcon, LogoutIcon, PersonIcon } from "@/components/icons";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogout, useSession } from "@/features/auth/use-auth";
import { LanguageSwitcher } from "@/features/i18n/language-switcher";

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const second = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return `${first}${second}`.toUpperCase() || "?";
}

export function UserMenu() {
  const { data: user, isPending } = useSession();
  const logout = useLogout();
  const t = useTranslations("userMenu");
  const tLang = useTranslations("language");
  const tConfirm = useTranslations("confirm");
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (isPending) {
    return <div className="size-9 rounded-full border border-line bg-surface" />;
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={t("open")}
          className="flex size-9 items-center justify-center rounded-full border border-line bg-surface font-mono text-xs text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        >
          {initialsOf(user.name)}
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          <DropdownMenuLabel>
            <p className="text-sm text-ink">{user.name}</p>
            <p className="mt-0.5 font-mono text-xs text-ink-faint">{user.email}</p>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link href="/profile">
              <PersonIcon size={16} />
              {t("profile")}
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link href="/settings">
              <GearIcon size={16} />
              {t("settings")}
            </Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuLabel>
            <p className="text-xs text-ink-faint">{tLang("label")}</p>
          </DropdownMenuLabel>
          <LanguageSwitcher />

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              setConfirmOpen(true);
            }}
            className="text-bear focus:bg-bear-bg focus:text-bear"
          >
            <LogoutIcon size={16} />
            {t("logout")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        destructive
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={tConfirm("logoutTitle")}
        description={tConfirm("logoutBody")}
        confirmLabel={tConfirm("logoutConfirm")}
        loading={logout.isPending}
        onConfirm={() => logout.mutate()}
      />
    </>
  );
}
