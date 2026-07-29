import { NextResponse } from "next/server";
import { popularTickers } from "@/config/tickers";
import { fetchYahooQuote } from "@/lib/yahoo";
import type { MarketIndex, MarketSummary, Mover } from "@/types/market";

const INDEX_SYMBOLS: { symbol: string; name: string; yahoo: string }[] = [
  { symbol: "SPX", name: "S&P 500", yahoo: "^GSPC" },
  { symbol: "IXIC", name: "Nasdaq Composite", yahoo: "^IXIC" },
  { symbol: "DJI", name: "Dow Jones", yahoo: "^DJI" },
];

const MOVER_TICKERS = popularTickers.slice(0, 6).map((item) => item.ticker);

async function fetchIndices(): Promise<MarketIndex[]> {
  return Promise.all(
    INDEX_SYMBOLS.map(async ({ symbol, name, yahoo }) => {
      const quote = await fetchYahooQuote(yahoo);
      return {
        symbol,
        name,
        value: quote.price,
        change: quote.change,
        changePercent: quote.changePercent,
        spark: quote.spark,
      };
    }),
  );
}

async function fetchMovers(): Promise<{ gainers: Mover[]; losers: Mover[] }> {
  const nameByTicker = new Map(popularTickers.map((item) => [item.ticker, item.name]));
  const movers = await Promise.all(
    MOVER_TICKERS.map(async (ticker): Promise<Mover> => {
      const quote = await fetchYahooQuote(ticker);
      return {
        ticker,
        name: nameByTicker.get(ticker) ?? ticker,
        price: quote.price,
        changePercent: quote.changePercent,
        spark: quote.spark,
      };
    }),
  );
  const byDesc = [...movers].sort((a, b) => b.changePercent - a.changePercent);
  const byAsc = [...movers].sort((a, b) => a.changePercent - b.changePercent);
  return { gainers: byDesc.slice(0, 3), losers: byAsc.slice(0, 3) };
}

export async function GET() {
  try {
    const [indices, { gainers, losers }] = await Promise.all([
      fetchIndices(),
      fetchMovers(),
    ]);
    const summary: MarketSummary = { indices, gainers, losers };
    return NextResponse.json(summary);
  } catch (error) {
    // Dulu di sini ada fallback ke angka mock. Untuk produk keuangan yang
    // tayang ke pengguna nyata, menampilkan nilai indeks karangan yang tidak
    // bisa dibedakan dari data asli jauh lebih buruk daripada mengaku gagal.
    // Semua komponen yang memakai data ini sudah menangani state error.
    console.error("Gagal mengambil data pasar dari Yahoo", error);
    return NextResponse.json(
      { message: "Data pasar sedang tidak tersedia" },
      { status: 502 },
    );
  }
}
