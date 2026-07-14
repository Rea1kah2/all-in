import type { ComponentType } from "react";
import type { IconProps } from "@/components/icons";
import { BookIcon, BulbIcon, HomeIcon, SearchIcon, StarIcon } from "@/components/icons";

export type NavItem = {
  href: string;
  label: string;
  shortLabel: string;
  Icon: ComponentType<IconProps>;
};

export const mainNav: NavItem[] = [
  { href: "/home", label: "Home", shortLabel: "Home", Icon: HomeIcon },
  { href: "/analysis", label: "AI Analysis", shortLabel: "Analisis", Icon: BulbIcon },
  {
    href: "/companies",
    label: "Company Explorer",
    shortLabel: "Jelajah",
    Icon: SearchIcon,
  },
  { href: "/watchlist", label: "Watchlist", shortLabel: "Watchlist", Icon: StarIcon },
  { href: "/learn", label: "Learn", shortLabel: "Learn", Icon: BookIcon },
];
