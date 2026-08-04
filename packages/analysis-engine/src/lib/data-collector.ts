import YahooFinance from "yahoo-finance2";
import { tickerNotFound, upstreamDataError } from "./errors.ts";

const yahooFinance = new YahooFinance({
  suppressNotices: ["yahooSurvey"],
  validation: { logErrors: false },
});

/**
 * Hari kalender, bukan hari bursa. Harus benar benar satu tahun karena
 * `changePercent1y` diturunkan dari deret ini dan UI melabelinya perubahan satu
 * tahun.
 */
const HISTORY_DAYS = 365;
const MAX_HEADLINES = 5;

const SUMMARY_MODULES = [
  "price",
  "summaryDetail",
  "defaultKeyStatistics",
  "financialData",
  "assetProfile",
] as const;

type SummaryModule = (typeof SUMMARY_MODULES)[number];

type QuoteSummary = {
  price?: {
    regularMarketPrice?: number;
    longName?: string;
    shortName?: string;
    currency?: string;
    marketCap?: number;
  };
  summaryDetail?: {
    previousClose?: number;
    trailingPE?: number;
    forwardPE?: number;
    dividendYield?: number;
    beta?: number;
    fiftyTwoWeekHigh?: number;
    fiftyTwoWeekLow?: number;
  };
  financialData?: {
    returnOnEquity?: number;
    debtToEquity?: number;
    profitMargins?: number;
    revenueGrowth?: number;
  };
  assetProfile?: {
    sector?: string;
    industry?: string;
  };
};

export type CollectedData = {
  ticker: string;
  companyName: string;
  sector: string | null;
  industry: string | null;
  currency: string;
  price: number;
  previousClose: number | null;
  marketCap: number | null;
  peRatio: number | null;
  forwardPE: number | null;
  roe: number | null;
  debtToEquityPercent: number | null;
  profitMargin: number | null;
  revenueGrowth: number | null;
  dividendYield: number | null;
  beta: number | null;
  fiftyTwoWeekHigh: number | null;
  fiftyTwoWeekLow: number | null;
  closes: number[];
  headlines: string[];
};

/**
 * Titik pada simbol Yahoo punya dua arti yang berbeda.
 *
 * Kelas saham Amerika memakai strip, `BRK.B` menjadi `BRK-B`. Akhiran bursa tetap
 * memakai titik, `BBCA.JK` harus dibiarkan apa adanya, dan mengubahnya menjadi
 * `BBCA-JK` membuat Yahoo mengembalikan 404.
 *
 * Pembedanya panjang bagian setelah titik terakhir: satu huruf berarti kelas
 * saham, dua huruf atau lebih berarti kode bursa.
 */
export function toYahooSymbol(ticker: string): string {
  const symbol = ticker.trim().toUpperCase();
  const lastDot = symbol.lastIndexOf(".");
  if (lastDot === -1) return symbol;

  const suffix = symbol.slice(lastDot + 1);
  if (suffix.length !== 1) return symbol;

  return `${symbol.slice(0, lastDot)}-${suffix}`;
}

function toNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function isNotFound(error: unknown): boolean {
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  return (
    message.includes("not found") ||
    message.includes("no data found") ||
    message.includes("invalid symbol")
  );
}

async function requestSummary(
  symbol: string,
  modules: SummaryModule[],
): Promise<QuoteSummary> {
  const result = await yahooFinance.quoteSummary(symbol, { modules });
  return (result ?? {}) as QuoteSummary;
}

async function fetchSummary(symbol: string): Promise<QuoteSummary> {
  try {
    return await requestSummary(symbol, [...SUMMARY_MODULES]);
  } catch (error) {
    if (isNotFound(error)) throw tickerNotFound(symbol);
    return fetchSummaryPerModule(symbol);
  }
}

async function fetchSummaryPerModule(symbol: string): Promise<QuoteSummary> {
  const settled = await Promise.all(
    SUMMARY_MODULES.map(async (moduleName) => {
      try {
        return await requestSummary(symbol, [moduleName]);
      } catch {
        return null;
      }
    }),
  );

  const merged: QuoteSummary = {};
  for (const part of settled) {
    if (part) Object.assign(merged, part);
  }

  if (!merged.price) throw upstreamDataError();
  return merged;
}

async function fetchCloses(symbol: string): Promise<number[]> {
  try {
    const chart = await yahooFinance.chart(symbol, {
      period1: new Date(Date.now() - HISTORY_DAYS * 86_400_000),
      period2: new Date(),
      interval: "1d",
    });
    return (chart.quotes ?? [])
      .map((quote) => toNumber(quote.close))
      .filter((close): close is number => close !== null);
  } catch {
    return [];
  }
}

/**
 * Yahoo tetap mengembalikan berita meski tidak punya apa apa tentang tickernya,
 * dan isinya umpan generik yang sama untuk ticker apa pun. Sudah terlihat pada
 * BBCA.JK dan BBRI.JK yang keduanya menerima berita basket SMA yang identik.
 *
 * Pembedanya, berita yang benar benar terkait membawa `relatedTickers` yang
 * memuat simbolnya, sedangkan umpan generik tidak punya field itu sama sekali.
 * Lebih baik mengirim nol berita ke Market Intelligence Agent daripada berita
 * yang salah, karena agent itu akan menalar di atas apa pun yang diberikan.
 */
function isRelated(relatedTickers: unknown, symbol: string): boolean {
  if (!Array.isArray(relatedTickers)) return false;

  const base = symbol.split(".")[0]?.toUpperCase() ?? symbol.toUpperCase();
  return relatedTickers.some((entry) => {
    if (typeof entry !== "string") return false;
    const candidate = entry.toUpperCase();
    return candidate === symbol.toUpperCase() || candidate === base;
  });
}

async function fetchHeadlines(symbol: string): Promise<string[]> {
  try {
    const result = await yahooFinance.search(symbol, {
      newsCount: MAX_HEADLINES * 2,
      quotesCount: 0,
    });

    return (result.news ?? [])
      .filter((item) =>
        isRelated((item as { relatedTickers?: unknown }).relatedTickers, symbol),
      )
      .map((item) => item.title)
      .filter((title): title is string => typeof title === "string" && title.length > 0)
      .slice(0, MAX_HEADLINES);
  } catch {
    return [];
  }
}

export async function collectMarketData(rawTicker: string): Promise<CollectedData> {
  const ticker = rawTicker.trim().toUpperCase();
  if (!ticker) throw tickerNotFound(rawTicker);

  const symbol = toYahooSymbol(ticker);
  const summary = await fetchSummary(symbol);

  const price = toNumber(summary.price?.regularMarketPrice);
  if (price === null) throw tickerNotFound(ticker);

  const [closes, headlines] = await Promise.all([
    fetchCloses(symbol),
    fetchHeadlines(symbol),
  ]);

  const detail = summary.summaryDetail;
  const financial = summary.financialData;
  const profile = summary.assetProfile;

  return {
    ticker,
    companyName: summary.price?.longName ?? summary.price?.shortName ?? ticker,
    sector: profile?.sector ?? null,
    industry: profile?.industry ?? null,
    currency: summary.price?.currency ?? "USD",
    price,
    previousClose: toNumber(detail?.previousClose),
    marketCap: toNumber(summary.price?.marketCap),
    peRatio: toNumber(detail?.trailingPE),
    forwardPE: toNumber(detail?.forwardPE),
    roe: toNumber(financial?.returnOnEquity),
    debtToEquityPercent: toNumber(financial?.debtToEquity),
    profitMargin: toNumber(financial?.profitMargins),
    revenueGrowth: toNumber(financial?.revenueGrowth),
    dividendYield: toNumber(detail?.dividendYield),
    beta: toNumber(detail?.beta),
    fiftyTwoWeekHigh: toNumber(detail?.fiftyTwoWeekHigh),
    fiftyTwoWeekLow: toNumber(detail?.fiftyTwoWeekLow),
    closes,
    headlines,
  };
}
