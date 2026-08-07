import createMDX from "@next/mdx";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

import "./src/config/env";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  pageExtensions: ["ts", "tsx", "mdx"],
  images: {
    // next/image menolak host yang tidak didaftarkan di sini.
    remotePatterns: [
      // Foto profil, disimpan di Vercel Blob.
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      // Gambar berita Yahoo Finance, seluruhnya disajikan lewat CDN yimg.
      { protocol: "https", hostname: "s.yimg.com" },
    ],
  },
};

const withMDX = createMDX();
const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(withMDX(nextConfig));
