/**
 * Kutipan harga ringan langsung dari Yahoo Finance chart endpoint, dipakai
 * untuk indeks, top movers, dan watchlist. Ini bukan AI Analysis, cuma harga.
 */

type YahooChartPayload = {
  chart?: {
    result?: Array<{
      meta?: {
        regularMarketPrice?: number;
        previousClose?: number;
        chartPreviousClose?: number;
        currency?: string;
      };
      indicators?: { quote?: Array<{ close?: (number | null)[] }> };
    }>;
  };
};

export type YahooQuote = {
  price: number;
  change: number;
  changePercent: number;
  currency: string;
  spark: number[];
};

/**
 * Sama seperti aturan di backend AI Analysis: titik pada simbol Yahoo berarti
 * kelas saham Amerika (BRK.B -> BRK-B) hanya kalau bagian setelah titik satu
 * huruf. Akhiran bursa dua huruf atau lebih (BBCA.JK) harus dibiarkan, kalau
 * tidak Yahoo membalas 404 dan seluruh pasar Indonesia berhenti bekerja.
 */
export function toYahooChartSymbol(ticker: string): string {
  const symbol = ticker.trim().toUpperCase();
  const lastDot = symbol.lastIndexOf(".");
  if (lastDot === -1) return symbol;

  const suffix = symbol.slice(lastDot + 1);
  if (suffix.length !== 1) return symbol;

  return `${symbol.slice(0, lastDot)}-${suffix}`;
}

export async function fetchYahooQuote(ticker: string): Promise<YahooQuote> {
  const yahooSymbol = toYahooChartSymbol(ticker);
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?range=5d&interval=15m`;
  const response = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
    next: { revalidate: 30 },
  });
  if (!response.ok) {
    throw new Error(`Yahoo Finance ${yahooSymbol} responded ${response.status}`);
  }

  const payload = (await response.json()) as YahooChartPayload;
  const result = payload.chart?.result?.[0];
  const meta = result?.meta;
  if (!meta?.regularMarketPrice) {
    throw new Error(`Yahoo Finance ${yahooSymbol} missing price`);
  }

  const previousClose =
    meta.previousClose ?? meta.chartPreviousClose ?? meta.regularMarketPrice;
  const closes = (result?.indicators?.quote?.[0]?.close ?? []).filter(
    (value): value is number => typeof value === "number",
  );
  const spark =
    closes.length >= 2 ? closes.slice(-24) : [previousClose, meta.regularMarketPrice];
  const change = meta.regularMarketPrice - previousClose;
  const changePercent = previousClose !== 0 ? (change / previousClose) * 100 : 0;

  return {
    price: meta.regularMarketPrice,
    change: Number(change.toFixed(2)),
    changePercent: Number(changePercent.toFixed(2)),
    currency: meta.currency ?? "USD",
    spark,
  };
}
