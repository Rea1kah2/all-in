import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    /**
     * Alamat backend AI Analysis, sengaja tanpa awalan NEXT_PUBLIC supaya tidak
     * pernah ikut ke bundel klien. Browser memanggil Route Handler di sini, dan
     * Route Handler itu yang meneruskan ke backend.
     */
    ANALYSIS_API_URL: z.string().url().optional(),
    /** Secret bersama antara Route Handler dan backend. Backend menolak tanpa ini. */
    BACKEND_SHARED_SECRET: z.string().optional(),
    /**
     * Koneksi Postgres untuk data pengguna (auth, watchlist, alert, riwayat
     * analisis, notifikasi). Opsional di level skema supaya `pnpm dev` tetap
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
  // Tidak ada lagi variabel klien. Semua permintaan menuju Route Handler di
  // origin yang sama, jadi browser tidak perlu tahu alamat apa pun.
  client: {},
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    ANALYSIS_API_URL: process.env.ANALYSIS_API_URL,
    BACKEND_SHARED_SECRET: process.env.BACKEND_SHARED_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
  },
  emptyStringAsUndefined: true,
});
