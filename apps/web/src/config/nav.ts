import type { ComponentType } from "react";
import type { IconProps } from "@/components/icons";
import {
  BookIcon,
  BulbIcon,
  DocumentIcon,
  HomeIcon,
  ListIcon,
  SearchIcon,
  StarIcon,
} from "@/components/icons";

export type NavItem = {
  href: string;
  key: string;
  Icon: ComponentType<IconProps>;
};

/** Seluruh menu, dipakai sidebar desktop yang punya ruang vertikal. */
export const mainNav: NavItem[] = [
  { href: "/home", key: "home", Icon: HomeIcon },
  { href: "/analysis", key: "analysis", Icon: BulbIcon },
  { href: "/history", key: "history", Icon: ListIcon },
  { href: "/companies", key: "companies", Icon: SearchIcon },
  { href: "/watchlist", key: "watchlist", Icon: StarIcon },
  { href: "/news", key: "news", Icon: DocumentIcon },
  { href: "/learn", key: "learn", Icon: BookIcon },
];

/**
 * Navigasi bawah di ponsel dibatasi lima. Komponennya membagi lebar dengan
 * `flex-1`, jadi tujuh item pada layar 360px menyisakan sekitar 51px per item,
 * terlalu sempit untuk ikon beserta labelnya. Sisanya tetap terjangkau lewat
 * sidebar dan menu pengguna, jadi tidak ada yang benar benar hilang.
 */
export const mobileNav: NavItem[] = mainNav.filter((item) =>
  ["/home", "/analysis", "/history", "/companies", "/watchlist"].includes(item.href),
);
