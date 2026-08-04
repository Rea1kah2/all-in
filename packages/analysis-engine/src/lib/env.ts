import { z } from "zod";

/**
 * Env khusus mesin analisis, divalidasi terpisah dari env aplikasi Next.js yang
 * memanggilnya. Ini sama seperti pola env backend Express sebelumnya, hanya
 * saja field yang khusus server HTTP (PORT, ALLOWED_ORIGIN,
 * BACKEND_SHARED_SECRET, RATE_LIMIT_PER_MINUTE) sudah tidak relevan karena
 * mesin ini dipanggil langsung di dalam proses yang sama, bukan lewat jaringan.
 */
const envSchema = z.object({
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY wajib diisi"),
  GEMINI_MODEL: z.string().min(1).default("gemini-3.5-flash"),
  GEMINI_LIGHT_MODEL: z.string().min(1).default("gemini-3.5-flash-lite"),
  GEMINI_DAILY_CALL_LIMIT: z.coerce.number().int().positive().default(18),
  /** 0 mematikan cache. */
  ANALYSIS_CACHE_TTL_MS: z.coerce.number().int().nonnegative().default(600_000),
});

type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

/**
 * Divalidasi malas (bukan konstanta modul) supaya `next build` tidak gagal.
 * Next.js memuat setiap Route Handler saat "Collecting page data" untuk
 * memeriksa metadatanya, terlepas dari apakah rute itu benar benar akan
 * dipanggil, dan itu terjadi sebelum env produksi tentu tersedia di semua
 * tahap build. Validasi di sini baru berjalan saat mesin analisis benar benar
 * dipakai (permintaan pertama), bukan saat modulnya di-import.
 */
export function getEnv(): Env {
  if (cached) return cached;

  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `  ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Konfigurasi environment analysis-engine tidak valid\n${details}`);
  }

  cached = parsed.data;
  return cached;
}

/**
 * Dua tingkat model, dan tiap tingkat memakai yang lain sebagai cadangan.
 *
 * Pembagiannya mengikuti beban kerja: agent yang hanya menafsirkan angka yang
 * sudah dihitung memakai model ringan, agent yang benar benar menimbang memakai
 * model penuh. Karena kuota Gemini dihitung per model, pembagian ini sekaligus
 * menyebar pemakaian ke dua jatah harian, bukan menghabiskan satu.
 */
function chain(first: string, second: string): string[] {
  return first === second ? [first] : [first, second];
}

export function getGeminiModelChain(): { heavy: string[]; light: string[] } {
  const env = getEnv();
  return {
    heavy: chain(env.GEMINI_MODEL, env.GEMINI_LIGHT_MODEL),
    light: chain(env.GEMINI_LIGHT_MODEL, env.GEMINI_MODEL),
  };
}

export function getGeminiModels(): string[] {
  const env = getEnv();
  return [...new Set([env.GEMINI_MODEL, env.GEMINI_LIGHT_MODEL])];
}
