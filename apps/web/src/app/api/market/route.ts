import { NextResponse } from "next/server";
import { popularTickers } from "@/config/tickers";
import { buildMovers, liveIndices } from "@/lib/mock-api";
import type { MarketIndex, MarketSummary, Mover } from "@/types/market";

const INDEX_SYMBOLS: { symbol: string; name: string; yahoo: string }[] = [
  { symbol: "SPX", name: "S&P 500", yahoo: "^GSPC" },
  { symbol: "IXIC", name: "Nasdaq Composite", yahoo: "^IXIC" },
  { symbol: "DJI", name: "Dow Jones", yahoo: "^DJI" },
];

const MOVER_TICKERS = popularTickers.slice(0, 6).map((item) => item.ticker);

type YahooChartPayload = {
  chart?: {
    result?: Array<{
      meta?: {
        regularMarketPrice?: number;
        previousClose?: number;
        chartPreviousClose?: number;
      };
      indicators?: { quote?: Array<{ close?: (number | null)[] }> };
    }>;
  };
};

async function fetchYahooQuote(yahooSymbol: string) {
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
    spark,
  };
}

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
      const quote = await fetchYahooQuote(ticker.replace(".", "-"));
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
  } catch {
    const { gainers, losers } = buildMovers();
    const summary: MarketSummary = { indices: liveIndices(), gainers, losers };
    return NextResponse.json(summary);
  }
}
