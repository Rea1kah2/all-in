"use client";

import Link from "next/link";
import { GearIcon, LogoutIcon, PersonIcon } from "@/components/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogout, useSession } from "@/features/auth/use-auth";

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const second = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return `${first}${second}`.toUpperCase() || "?";
}

export function UserMenu() {
  const { data: user, isPending } = useSession();
  const logout = useLogout();

  if (isPending) {
    return <div className="size-9 rounded-full border border-line bg-surface" />;
  }

  if (!user) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Buka menu akun"
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
          <Link href="/settings/profile">
            <PersonIcon size={16} />
            Profil investasi
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/settings">
            <GearIcon size={16} />
            Pengaturan
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onSelect={() => logout.mutate()}
          className="text-bear focus:bg-bear-bg focus:text-bear"
        >
          <LogoutIcon size={16} />
          {logout.isPending ? "Keluar" : "Keluar"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
