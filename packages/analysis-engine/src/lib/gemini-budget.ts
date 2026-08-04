import { getDb, schema } from "@all-in/db";
import { and, eq, sql } from "drizzle-orm";

/**
 * Penghitung panggilan Gemini per model per hari, disimpan di tabel
 * `gemini_budget` di Postgres.
 *
 * Kuota free tier Gemini dihitung per project per model per hari, dan direset di
 * tengah malam waktu Pacific. Penghitung ini memakai batas hari yang sama supaya
 * hitungannya tidak pernah bergeser dari hitungan Google.
 *
 * Dulu ini berkas JSON lokal, tapi fungsi serverless (Vercel) tidak punya disk
 * yang bertahan antar permintaan, kadang malah antar baris kode yang sama
 * dijalankan di instance berbeda sekaligus. Postgres adalah satu satunya tempat
 * yang benar benar dibagi oleh semua instance.
 */

const pacificDateFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Los_Angeles",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function pacificDate(now: Date = new Date()): string {
  return pacificDateFormatter.format(now);
}

export class GeminiBudget {
  constructor(private readonly dailyLimit: number) {}

  async used(model: string): Promise<number> {
    const db = getDb();
    const today = pacificDate();
    const [row] = await db
      .select({ count: schema.geminiBudget.count })
      .from(schema.geminiBudget)
      .where(
        and(
          eq(schema.geminiBudget.model, model),
          eq(schema.geminiBudget.pacificDate, today),
        ),
      );
    return row?.count ?? 0;
  }

  async remaining(model: string): Promise<number> {
    return Math.max(this.dailyLimit - (await this.used(model)), 0);
  }

  async hasRoom(model: string): Promise<boolean> {
    return (await this.remaining(model)) > 0;
  }

  /**
   * Dipanggil tepat sebelum panggilan dikirim, supaya percobaan yang gagal
   * tetap dihitung. Upsert atomik lewat `ON CONFLICT ... DO UPDATE`, aman
   * terhadap permintaan bersamaan dari instance serverless yang berbeda.
   */
  async record(model: string): Promise<void> {
    const db = getDb();
    const today = pacificDate();
    await db
      .insert(schema.geminiBudget)
      .values({ model, pacificDate: today, count: 1 })
      .onConflictDoUpdate({
        target: [schema.geminiBudget.model, schema.geminiBudget.pacificDate],
        set: { count: sql`${schema.geminiBudget.count} + 1` },
      });
  }

  async snapshot(
    models: string[],
  ): Promise<{ date: string; limit: number; used: Record<string, number> }> {
    const today = pacificDate();
    const used: Record<string, number> = {};
    for (const model of models) {
      used[model] = await this.used(model);
    }
    return { date: today, limit: this.dailyLimit, used };
  }
}
