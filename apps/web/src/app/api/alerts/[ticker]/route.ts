import { getDb, schema } from "@all-in/db";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { env } from "@/config/env";
import { requireUser } from "@/lib/require-user";
import type { PriceAlert, SetAlertInput } from "@/types/alert";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ ticker: string }> },
) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const ticker = decodeURIComponent((await params).ticker).toUpperCase();
  const body = (await request.json().catch(() => null)) as SetAlertInput | null;

  if (!body || typeof body.targetPrice !== "number" || body.targetPrice <= 0) {
    return NextResponse.json(
      {
        message: "Permintaan tidak valid",
        errors: { targetPrice: ["Target harga wajib diisi dan lebih dari 0"] },
      },
      { status: 422 },
    );
  }

  const [row] = await getDb(env.DATABASE_URL)
    .insert(schema.priceAlert)
    .values({
      userId: user.id,
      ticker,
      targetPrice: body.targetPrice,
      condition: body.condition,
    })
    .onConflictDoUpdate({
      target: [schema.priceAlert.userId, schema.priceAlert.ticker],
      set: { targetPrice: body.targetPrice, condition: body.condition },
    })
    .returning();

  if (!row) {
    return NextResponse.json({ message: "Gagal menyimpan alert" }, { status: 500 });
  }

  const alert: PriceAlert = {
    ticker: row.ticker,
    targetPrice: row.targetPrice,
    condition: row.condition as PriceAlert["condition"],
  };
  return NextResponse.json(alert);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ ticker: string }> },
) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const ticker = decodeURIComponent((await params).ticker).toUpperCase();

  await getDb(env.DATABASE_URL)
    .delete(schema.priceAlert)
    .where(
      and(eq(schema.priceAlert.userId, user.id), eq(schema.priceAlert.ticker, ticker)),
    );

  return new NextResponse(null, { status: 204 });
}
