import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    /**
     * Koneksi Postgres untuk data pengguna (auth, watchlist, alert, riwayat
     * analisis, notifikasi) dan sekarang juga penghitung kuota Gemini plus
     * cache hasil analisis. Opsional di level skema supaya `pnpm dev` tetap
     * bisa jalan sebelum database disiapkan, fitur yang membutuhkannya gagal
     * dengan pesan jelas, bukan membuat seluruh aplikasi tidak bisa start.
     */
    DATABASE_URL: z.string().optional(),
    /** Secret penandatanganan sesi better-auth. Wajib diisi sebelum deploy. */
    BETTER_AUTH_SECRET: z.string().optional(),
    /**
     * Alamat publik aplikasi, misalnya https://all-in.vercel.app. Wajib di
     * produksi: tanpa ini better-auth menurunkan origin dari request, dan di
     * belakang proxy Vercel hasilnya bisa salah sehingga pemeriksaan origin
     * menolak permintaan yang sah. Di lokal boleh kosong.
     */
    BETTER_AUTH_URL: z.string().url().optional(),
  },
  // Tidak ada variabel klien. Semua permintaan menuju Route Handler di origin
  // yang sama, jadi browser tidak perlu tahu alamat apa pun. Env untuk mesin
  // analisis (GEMINI_API_KEY dst) divalidasi terpisah di
  // packages/analysis-engine/src/lib/env.ts, tidak lewat berkas ini.
  client: {},
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
  },
  emptyStringAsUndefined: true,
});
