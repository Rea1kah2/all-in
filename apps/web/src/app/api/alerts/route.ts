import { getDb, schema } from "@all-in/db";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { env } from "@/config/env";
import { requireUser } from "@/lib/require-user";
import type { PriceAlert } from "@/types/alert";

export async function GET() {
  const { user, response } = await requireUser();
  if (!user) return response;

  const rows = await getDb(env.DATABASE_URL).query.priceAlert.findMany({
    where: eq(schema.priceAlert.userId, user.id),
  });

  const alerts: PriceAlert[] = rows.map((row) => ({
    ticker: row.ticker,
    targetPrice: row.targetPrice,
    condition: row.condition as PriceAlert["condition"],
  }));

  return NextResponse.json(alerts);
}
