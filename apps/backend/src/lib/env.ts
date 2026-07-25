import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(8081),
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY wajib diisi"),
  GEMINI_MODEL: z.string().min(1).default("gemini-2.5-flash"),
  ALLOWED_ORIGIN: z.string().min(1).default("http://localhost:3000"),
  ANALYSIS_CACHE_TTL_MS: z.coerce.number().int().nonnegative().default(600_000),
  RATE_LIMIT_PER_MINUTE: z.coerce.number().int().positive().default(20),
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
