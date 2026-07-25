import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(8081),
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY wajib diisi"),
  GEMINI_MODEL: z.string().min(1).default("gemini-3.5-flash"),
  GEMINI_LIGHT_MODEL: z.string().min(1).default("gemini-3.5-flash-lite"),
  GEMINI_DAILY_CALL_LIMIT: z.coerce.number().int().positive().default(18),
  ALLOWED_ORIGIN: z.string().min(1).default("http://localhost:3000"),
  /**
   * Secret bersama dengan Route Handler Next.js. Kalau diisi, `/api` menolak
   * permintaan yang tidak membawanya. Dikosongkan berarti endpoint terbuka, dan
   * itu hanya boleh untuk pengembangan lokal.
   */
  BACKEND_SHARED_SECRET: z.string().default(""),
  ANALYSIS_CACHE_TTL_MS: z.coerce.number().int().nonnegative().default(600_000),
  RATE_LIMIT_PER_MINUTE: z.coerce.number().int().positive().default(5),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `  ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
  throw new Error(`Konfigurasi environment tidak valid\n${details}`);
}

export const env = parsed.data;

export const allowedOrigins = env.ALLOWED_ORIGIN.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

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

export const geminiModelChain = {
  heavy: chain(env.GEMINI_MODEL, env.GEMINI_LIGHT_MODEL),
  light: chain(env.GEMINI_LIGHT_MODEL, env.GEMINI_MODEL),
};

export const geminiModels = [...new Set([env.GEMINI_MODEL, env.GEMINI_LIGHT_MODEL])];
