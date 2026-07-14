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

const placeholderUser = {
  name: "Azril",
  email: "jomok123@gmail.com",
  initials: "AZ",
};

export function UserMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Buka menu akun"
        className="flex size-9 items-center justify-center rounded-full border border-line bg-surface font-mono text-xs text-ink-muted transition-colors hover:bg-surface-hover hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
      >
        {placeholderUser.initials}
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuLabel>
          <p className="text-sm text-ink">{placeholderUser.name}</p>
          <p className="mt-0.5 font-mono text-xs text-ink-faint">
            {placeholderUser.email}
          </p>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/settings/profile">
            <PersonIcon size={16} />
            Profil Investasi
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/settings">
            <GearIcon size={16} />
            Pengaturan
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem className="text-bear focus:bg-bear-bg focus:text-bear">
          <LogoutIcon size={16} />
          Keluar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
