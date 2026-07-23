import type { ComponentType } from "react";
import type { IconProps } from "@/components/icons";
import { BookIcon, BulbIcon, HomeIcon, SearchIcon, StarIcon } from "@/components/icons";

export type NavItem = {
  href: string;
  key: string;
  Icon: ComponentType<IconProps>;
};

export const mainNav: NavItem[] = [
  { href: "/home", key: "home", Icon: HomeIcon },
  { href: "/analysis", key: "analysis", Icon: BulbIcon },
  { href: "/companies", key: "companies", Icon: SearchIcon },
  { href: "/watchlist", key: "watchlist", Icon: StarIcon },
  { href: "/learn", key: "learn", Icon: BookIcon },
];
