import { getDb, schema } from "@all-in/db";
import { count, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { env } from "@/config/env";
import { requireUser } from "@/lib/require-user";

/**
 * Ringkasan akun untuk halaman profil. Semuanya dihitung dari tabel yang sudah
 * ada, tidak ada data baru yang perlu disimpan.
 */
export async function GET() {
  const { user, response } = await requireUser();
  if (!user) return response;

  const db = getDb(env.DATABASE_URL);

  const [analyses, watchlist, alerts] = await Promise.all([
    db
      .select({ value: count() })
      .from(schema.analysis)
      .where(eq(schema.analysis.userId, user.id)),
    db
      .select({ value: count() })
      .from(schema.watchlist)
      .where(eq(schema.watchlist.userId, user.id)),
    db
      .select({ value: count() })
      .from(schema.priceAlert)
      .where(eq(schema.priceAlert.userId, user.id)),
  ]);

  return NextResponse.json({
    analyses: analyses[0]?.value ?? 0,
    watchlist: watchlist[0]?.value ?? 0,
    alerts: alerts[0]?.value ?? 0,
  });
}
