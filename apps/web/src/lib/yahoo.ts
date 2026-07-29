import YahooFinance from "yahoo-finance2";

/**
 * Data pasar langsung dari Yahoo Finance, dipakai untuk indeks, top movers,
 * watchlist, profil perusahaan, dan berita. Ini bukan AI Analysis, jadi sengaja
 * tidak lewat backend Render: halaman perusahaan harus tetap hidup meski
 * layanan analisis sedang tidur.
 */

const yahooFinance = new YahooFinance({
  suppressNotices: ["yahooSurvey"],
  validation: { logErrors: false },
});

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

type QuoteSummary = {
  price?: { longName?: string; shortName?: string; exchangeName?: string };
  summaryDetail?: { trailingPE?: number; dividendYield?: number };
  financialData?: { returnOnEquity?: number; debtToEquity?: number };
  assetProfile?: { sector?: string; industry?: string; longBusinessSummary?: string };
};

export type YahooProfile = {
  name: string;
  exchange: string;
  sector: string;
  industry: string;
  description: string;
  peRatio: number | null;
  roe: number | null;
  debtToEquity: number | null;
  dividendYield: number | null;
};

function toNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/**
 * `quoteSummary` butuh penanganan crumb dan cookie Yahoo yang tidak bisa
 * ditiru dengan fetch mentah, jadi bagian ini memakai `yahoo-finance2`, berbeda
 * dari `fetchYahooQuote` di atas yang cukup memanggil chart endpoint langsung.
 */
export async function fetchYahooProfile(ticker: string): Promise<YahooProfile> {
  const symbol = toYahooChartSymbol(ticker);
  const summary = (await yahooFinance.quoteSummary(symbol, {
    modules: ["price", "summaryDetail", "financialData", "assetProfile"],
  })) as QuoteSummary;

  const name = summary.price?.longName ?? summary.price?.shortName;
  if (!name) {
    throw new Error(`Yahoo Finance ${symbol} tidak punya profil`);
  }

  return {
    name,
    exchange: summary.price?.exchangeName ?? "",
    sector: summary.assetProfile?.sector ?? "",
    industry: summary.assetProfile?.industry ?? "",
    description: summary.assetProfile?.longBusinessSummary ?? "",
    peRatio: toNumber(summary.summaryDetail?.trailingPE),
    roe: toNumber(summary.financialData?.returnOnEquity),
    debtToEquity: toNumber(summary.financialData?.debtToEquity),
    dividendYield: toNumber(summary.summaryDetail?.dividendYield),
  };
}

export type YahooCandle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
};

const CANDLE_DAYS = 180;

export async function fetchYahooCandles(ticker: string): Promise<YahooCandle[]> {
  const symbol = toYahooChartSymbol(ticker);
  const chart = await yahooFinance.chart(symbol, {
    period1: new Date(Date.now() - CANDLE_DAYS * 86_400_000),
    period2: new Date(),
    interval: "1d",
  });

  return (chart.quotes ?? []).flatMap((quote) => {
    const open = toNumber(quote.open);
    const high = toNumber(quote.high);
    const low = toNumber(quote.low);
    const close = toNumber(quote.close);
    if (open === null || high === null || low === null || close === null) return [];
    return [
      {
        time: Math.floor(new Date(quote.date).getTime() / 1000),
        open,
        high,
        low,
        close,
      },
    ];
  });
}

export type YahooHeadline = {
  id: string;
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  tickers: string[];
};

const MAX_HEADLINES = 12;

/**
 * Yahoo tetap mengembalikan berita meski tidak punya apa apa tentang tickernya,
 * dan isinya umpan generik yang sama untuk ticker apa pun. Berita yang benar
 * benar terkait membawa `relatedTickers`, umpan generik tidak. Aturan penyaringan
 * ini sama persis dengan yang dipakai backend AI Analysis.
 */
export async function fetchYahooNews(ticker?: string): Promise<YahooHeadline[]> {
  const query = ticker ? toYahooChartSymbol(ticker) : "stock market";
  const result = await yahooFinance.search(query, {
    newsCount: MAX_HEADLINES * 2,
    quotesCount: 0,
  });

  const base = ticker ? (ticker.split(".")[0]?.toUpperCase() ?? "") : null;

  return (result.news ?? [])
    .flatMap((item) => {
      const related = (item as { relatedTickers?: unknown }).relatedTickers;
      const tickers = Array.isArray(related)
        ? related.filter((entry): entry is string => typeof entry === "string")
        : [];

      // Saat menyaring per ticker, hanya berita yang menyebut ticker itu yang
      // lolos. Untuk feed umum, cukup punya relatedTickers sama sekali, karena
      // itu yang membedakan berita saham dari umpan generik.
      if (base) {
        const matches = tickers.some(
          (entry) => entry.toUpperCase() === base || entry.toUpperCase() === query,
        );
        if (!matches) return [];
      } else if (tickers.length === 0) {
        return [];
      }

      if (!item.title || !item.link) return [];

      return [
        {
          id: item.uuid ?? item.link,
          title: item.title,
          source: item.publisher ?? "Yahoo Finance",
          url: item.link,
          publishedAt: new Date(item.providerPublishTime ?? Date.now()).toISOString(),
          tickers,
        },
      ];
    })
    .slice(0, MAX_HEADLINES);
}
