import { analyzeResponseSchema } from "@all-in/contracts";
import { getDb, schema } from "@all-in/db";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { env } from "@/config/env";
import { requireUser } from "@/lib/require-user";

const HISTORY_LIMIT = 20;

/**
 * Riwayat analisis milik pengguna, terurut terbaru dulu. Tidak memanggil
 * Gemini sama sekali, murni membaca apa yang sudah pernah dibayar dan
 * disimpan oleh POST /api/analyze.
 */
export async function GET() {
  const { user, response } = await requireUser();
  if (!user) return response;

  const rows = await getDb(env.DATABASE_URL).query.analysis.findMany({
    where: eq(schema.analysis.userId, user.id),
    orderBy: desc(schema.analysis.createdAt),
    limit: HISTORY_LIMIT,
  });

  const items = rows.flatMap((row) => {
    const parsed = analyzeResponseSchema.safeParse(row.payload);
    if (!parsed.success) return [];
    return [
      {
        id: row.id,
        ticker: row.ticker,
        riskProfile: row.riskProfile,
        investmentGoal: row.investmentGoal,
        locale: row.locale,
        createdAt: row.createdAt.toISOString(),
        result: parsed.data,
      },
    ];
  });

  return NextResponse.json(items);
}
