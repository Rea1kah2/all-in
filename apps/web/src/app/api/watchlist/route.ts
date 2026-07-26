import { getDb, schema } from "@all-in/db";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { env } from "@/config/env";
import { popularTickers } from "@/config/tickers";
import { requireUser } from "@/lib/require-user";
import { fetchYahooQuote } from "@/lib/yahoo";
import type { AddWatchlistInput, WatchlistItem } from "@/types/watchlist";

const nameByTicker = new Map(popularTickers.map((item) => [item.ticker, item.name]));

/**
 * Harga diambil langsung dari Yahoo saat dibaca, bukan disimpan di database.
 * Watchlist hanya menyimpan *apa yang diikuti pengguna*, bukan snapshot harga
 * yang akan basi begitu disimpan.
 */
async function enrich(
  row: typeof schema.watchlist.$inferSelect,
): Promise<WatchlistItem | null> {
  try {
    const quote = await fetchYahooQuote(row.ticker);
    return {
      id: row.id,
      ticker: row.ticker,
      name: nameByTicker.get(row.ticker) ?? row.ticker,
      price: {
        current: quote.price,
        change: quote.change,
        changePercent: quote.changePercent,
        currency: quote.currency,
      },
      recommendation: (row.recommendation as WatchlistItem["recommendation"]) ?? null,
      confidence: row.confidence,
      addedAt: row.addedAt.toISOString(),
      spark: quote.spark,
    };
  } catch (error) {
    // Satu ticker yang gagal (mis. delisted) tidak boleh menjatuhkan seluruh
    // daftar punya pengguna.
    console.error(`Gagal mengambil harga watchlist untuk ${row.ticker}`, error);
    return null;
  }
}

export async function GET() {
  const { user, response } = await requireUser();
  if (!user) return response;

  const rows = await getDb(env.DATABASE_URL).query.watchlist.findMany({
    where: eq(schema.watchlist.userId, user.id),
    orderBy: desc(schema.watchlist.addedAt),
  });

  const items = (await Promise.all(rows.map(enrich))).filter(
    (item): item is WatchlistItem => item !== null,
  );

  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const body = (await request.json().catch(() => null)) as AddWatchlistInput | null;
  if (!body?.ticker) {
    return NextResponse.json(
      { message: "Permintaan tidak valid", errors: { ticker: ["Ticker wajib diisi"] } },
      { status: 422 },
    );
  }

  const ticker = body.ticker.trim().toUpperCase();
  const db = getDb(env.DATABASE_URL);

  const [row] = await db
    .insert(schema.watchlist)
    .values({
      userId: user.id,
      ticker,
      recommendation: body.recommendation ?? null,
      confidence: body.confidence ?? null,
    })
    .onConflictDoUpdate({
      target: [schema.watchlist.userId, schema.watchlist.ticker],
      set: {
        recommendation: body.recommendation ?? null,
        confidence: body.confidence ?? null,
      },
    })
    .returning();

  if (!row) {
    return NextResponse.json(
      { message: "Gagal menyimpan ke watchlist" },
      { status: 500 },
    );
  }

  const item = await enrich(row);
  if (!item) {
    return NextResponse.json(
      { message: `Saham ${ticker} tidak ditemukan` },
      { status: 404 },
    );
  }

  return NextResponse.json(item);
}
