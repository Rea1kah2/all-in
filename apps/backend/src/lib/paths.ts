import { join } from "node:path";

/**
 * Folder cache milik backend, ditambatkan ke lokasi berkas ini, bukan ke
 * `process.cwd()`. Proses bisa dijalankan dari root monorepo lewat Turborepo
 * maupun dari dalam `apps/backend`, dan keduanya harus menunjuk folder yang sama.
 *
 * Dari `src/lib` naik dua tingkat berarti `apps/backend`.
 */
export const cacheDir = join(import.meta.dirname, "..", "..", ".cache");
