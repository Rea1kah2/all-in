import { isAbsolute, join } from "node:path";
import { env } from "./env.ts";

/**
 * Folder cache milik backend, tempat penghitung kuota harian dan cache hasil
 * analisis disimpan.
 *
 * Defaultnya ditambatkan ke lokasi berkas ini, bukan ke `process.cwd()`, karena
 * proses bisa dijalankan dari root monorepo lewat Turborepo maupun dari dalam
 * `apps/backend`, dan keduanya harus menunjuk folder yang sama. Dari `src/lib`
 * (atau `dist/lib` setelah build) naik dua tingkat berarti `apps/backend`.
 *
 * `CACHE_DIR` bisa mengarahkannya ke disk persisten. Ini penting saat deploy:
 * di hosting tanpa disk persisten, folder ini terhapus tiap kali proses
 * di-restart, sehingga penghitung kuota kembali ke nol dan cache analisis
 * hilang. Kuota Google sendiri tetap berlaku, jadi yang hilang hanyalah
 * kemampuan menolak panggilan sebelum dikirim.
 */
export const cacheDir = env.CACHE_DIR
  ? isAbsolute(env.CACHE_DIR)
    ? env.CACHE_DIR
    : join(process.cwd(), env.CACHE_DIR)
  : join(import.meta.dirname, "..", "..", ".cache");
