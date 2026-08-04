import type { AnalyzeResponse } from "@all-in/contracts";
import { getDb, schema } from "@all-in/db";
import { eq, lt } from "drizzle-orm";
import { env } from "./env.ts";

/**
 * Cache hasil analisis di tabel `analysis_cache`, menggantikan `TtlCache`
 * berbasis berkas JSON yang dipakai backend Express sebelumnya. Permintaan
 * identik (ticker, profil risiko, horizon, bahasa, model) dalam jendela waktu
 * `ANALYSIS_CACHE_TTL_MS` tidak perlu memanggil Gemini ulang.
 */

export async function getCachedAnalysis(key: string): Promise<AnalyzeResponse | null> {
  if (env.ANALYSIS_CACHE_TTL_MS <= 0) return null;

  const db = getDb();
  const [row] = await db
    .select()
    .from(schema.analysisCache)
    .where(eq(schema.analysisCache.cacheKey, key));

  if (!row) return null;
  if (row.expiresAt.getTime() <= Date.now()) {
    await db.delete(schema.analysisCache).where(eq(schema.analysisCache.cacheKey, key));
    return null;
  }

  return row.payload as AnalyzeResponse;
}

export async function setCachedAnalysis(
  key: string,
  payload: AnalyzeResponse,
): Promise<void> {
  if (env.ANALYSIS_CACHE_TTL_MS <= 0) return;

  const db = getDb();
  const expiresAt = new Date(Date.now() + env.ANALYSIS_CACHE_TTL_MS);

  await db
    .insert(schema.analysisCache)
    .values({ cacheKey: key, payload, expiresAt })
    .onConflictDoUpdate({
      target: schema.analysisCache.cacheKey,
      set: { payload, expiresAt },
    });

  // Sapuan ringan entri kedaluwarsa. Tidak butuh job terjadwal terpisah untuk
  // tabel yang kecil dan jarang ditulis seperti ini.
  await db
    .delete(schema.analysisCache)
    .where(lt(schema.analysisCache.expiresAt, new Date()));
}
