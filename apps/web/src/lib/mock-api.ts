import { ApiError } from "@/lib/api";
import { companyDescriptionsId, mockLocale, newsEn } from "@/lib/mock-i18n";
import type { PriceAlert, SetAlertInput } from "@/types/alert";
import type { AnalyzeResponse, WireRequest } from "@/types/analysis";
import type { User } from "@/types/auth";
import type { Candle, Company } from "@/types/company";
import type { MarketIndex, MarketSummary, Mover } from "@/types/market";
import type { NewsItem } from "@/types/news";
import type { Notification } from "@/types/notification";
import type { AddWatchlistInput, WatchlistItem } from "@/types/watchlist";

const USER_STORE_KEY = "mock:user";
const SESSION_COOKIE = "mock_session";
const WATCHLIST_STORE_KEY = "mock:watchlist";
const NOTIFICATIONS_STORE_KEY = "mock:notifications";
const FIRED_ALERTS_KEY = "mock:notifications:firedAlerts";
const NOTIFIED_NEWS_KEY = "mock:notifications:notifiedNews";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function persistUser(user: User) {
  localStorage.setItem(USER_STORE_KEY, JSON.stringify(user));
  // biome-ignore lint/suspicious/noDocumentCookie: mock sementara, dibuang saat backend siap
  document.cookie = `${SESSION_COOKIE}=1; path=/; max-age=86400; samesite=lax`;
}

function clearUser() {
  localStorage.removeItem(USER_STORE_KEY);
  // biome-ignore lint/suspicious/noDocumentCookie: mock sementara, dibuang saat backend siap
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; samesite=lax`;
}

function storedUser(): User | null {
  const raw = localStorage.getItem(USER_STORE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

function storedNotifications(): Notification[] {
  const raw = localStorage.getItem(NOTIFICATIONS_STORE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Notification[];
  } catch {
    return [];
  }
}

function persistNotifications(items: Notification[]) {
  localStorage.setItem(NOTIFICATIONS_STORE_KEY, JSON.stringify(items));
}

function storedStringSet(key: string): Set<string> {
  const raw = localStorage.getItem(key);
  if (!raw) return new Set();
  try {
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function persistStringSet(key: string, value: Set<string>) {
  localStorage.setItem(key, JSON.stringify([...value]));
}

type NotificationInput = Notification extends infer N
  ? N extends { id: number; read: boolean; createdAt: string }
    ? Omit<N, "id" | "read" | "createdAt">
    : never
  : never;

function pushNotification(entry: NotificationInput) {
  const items = storedNotifications();
  const nextId = items.reduce((max, item) => Math.max(max, item.id), 0) + 1;
  const notification = {
    ...entry,
    id: nextId,
    read: false,
    createdAt: new Date().toISOString(),
  } as Notification;
  items.unshift(notification);
  persistNotifications(items.slice(0, 50));
}

function syncAlertNotifications(user: User) {
  if (!user.notifyPriceAlert) return;
  const alerts = storedAlerts();
  if (alerts.length === 0) return;
  const fired = storedStringSet(FIRED_ALERTS_KEY);
  let changed = false;
  for (const alert of alerts) {
    if (fired.has(alert.ticker)) continue;
    const company = companies[alert.ticker];
    if (!company) continue;
    const quote = liveQuote(alert.ticker, company.price.current);
    const hit =
      alert.condition === "above"
        ? quote.current >= alert.targetPrice
        : quote.current <= alert.targetPrice;
    if (hit) {
      pushNotification({
        type: "price_alert",
        ticker: alert.ticker,
        targetPrice: alert.targetPrice,
        condition: alert.condition,
        href: `/companies/${alert.ticker}`,
      });
      fired.add(alert.ticker);
      changed = true;
    }
  }
  if (changed) persistStringSet(FIRED_ALERTS_KEY, fired);
}

function syncNewsNotifications(user: User) {
  if (!user.notifyNewsDigest) return;
  const tickers = new Set(storedWatchlist().map((item) => item.ticker));
  if (tickers.size === 0) return;
  const notified = storedStringSet(NOTIFIED_NEWS_KEY);
  let changed = false;
  const relevant = [...newsItems]
    .filter((item) => item.tickers.some((ticker) => tickers.has(ticker)))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, 5);
  for (const item of relevant) {
    const key = String(item.id);
    if (notified.has(key)) continue;
    const ticker =
      item.tickers.find((entry) => tickers.has(entry)) ?? item.tickers[0] ?? "";
    pushNotification({
      type: "news",
      ticker,
      newsId: item.id,
      href: `/news/${item.id}`,
    });
    notified.add(key);
    changed = true;
  }
  if (changed) persistStringSet(NOTIFIED_NEWS_KEY, notified);
}

type StoredWatchlistItem = {
  id: number;
  ticker: string;
  recommendation: WatchlistItem["recommendation"];
  confidence: number | null;
  addedAt: string;
};

const watchlistSeed: StoredWatchlistItem[] = [
  {
    id: 1,
    ticker: "AAPL",
    recommendation: "BUY",
    confidence: 89,
    addedAt: "2026-07-17T09:00:00.000Z",
  },
  {
    id: 2,
    ticker: "NVDA",
    recommendation: null,
    confidence: null,
    addedAt: "2026-07-18T09:00:00.000Z",
  },
];

function storedWatchlist(): StoredWatchlistItem[] {
  const raw = localStorage.getItem(WATCHLIST_STORE_KEY);
  if (raw === null) {
    localStorage.setItem(WATCHLIST_STORE_KEY, JSON.stringify(watchlistSeed));
    return watchlistSeed.map((item) => ({ ...item }));
  }
  try {
    return JSON.parse(raw) as StoredWatchlistItem[];
  } catch {
    return [];
  }
}

function persistWatchlist(items: StoredWatchlistItem[]) {
  localStorage.setItem(WATCHLIST_STORE_KEY, JSON.stringify(items));
}

const ALERTS_STORE_KEY = "mock:alerts";

function storedAlerts(): PriceAlert[] {
  const raw = localStorage.getItem(ALERTS_STORE_KEY);
  if (raw === null) return [];
  try {
    return JSON.parse(raw) as PriceAlert[];
  } catch {
    return [];
  }
}

function persistAlerts(items: PriceAlert[]) {
  localStorage.setItem(ALERTS_STORE_KEY, JSON.stringify(items));
}

function toWatchlistItem(stored: StoredWatchlistItem): WatchlistItem | null {
  const company = companies[stored.ticker];
  if (!company) return null;
  return {
    id: stored.id,
    ticker: company.ticker,
    name: company.name,
    price: company.price,
    recommendation: stored.recommendation,
    confidence: stored.confidence,
    addedAt: stored.addedAt,
    spark: liveQuote(company.ticker, company.price.current).spark,
  };
}

const companies: Record<string, Company> = {
  AAPL: {
    ticker: "AAPL",
    name: "Apple Inc.",
    exchange: "NASDAQ",
    sector: "Technology",
    industry: "Consumer Electronics",
    description:
      "Apple Inc. is an American multinational technology company that designs, manufactures, and markets consumer electronics, software, and online services.",
    price: {
      current: 184.32,
      change: 2.45,
      changePercent: 1.35,
      currency: "USD",
    },
    metrics: {
      peRatio: 28.5,
      roe: 0.147,
      debtToEquity: 1.83,
      dividendYield: 0.0049,
    },
  },
  MSFT: {
    ticker: "MSFT",
    name: "Microsoft Corporation",
    exchange: "NASDAQ",
    sector: "Technology",
    industry: "Software—Infrastructure",
    description:
      "Microsoft Corporation is an American multinational technology company that develops, manufactures, licenses, supports, and sells computer software, consumer electronics, personal computers, and related services.",
    price: {
      current: 305.22,
      change: -1.12,
      changePercent: -0.37,
      currency: "USD",
    },
    metrics: {
      peRatio: 35.2,
      roe: 0.429,
      debtToEquity: 0.55,
      dividendYield: 0.0085,
    },
  },
  GOOGL: {
    ticker: "GOOGL",
    name: "Alphabet Inc.",
    exchange: "NASDAQ",
    sector: "Communication Services",
    industry: "Internet Content & Information",
    description:
      "Alphabet Inc. is an American multinational conglomerate that serves as the parent company of Google and several former Google subsidiaries.",
    price: {
      current: 135.67,
      change: 0.89,
      changePercent: 0.66,
      currency: "USD",
    },
    metrics: {
      peRatio: 30.1,
      roe: 0.175,
      debtToEquity: 0.03,
      dividendYield: null,
    },
  },
  AMZN: {
    ticker: "AMZN",
    name: "Amazon.com, Inc.",
    exchange: "NASDAQ",
    sector: "Consumer Discretionary",
    industry: "Internet Retail",
    description:
      "Amazon.com, Inc. is an American multinational technology company that focuses on e-commerce, cloud computing, digital streaming, and artificial intelligence.",
    price: {
      current: 98.45,
      change: -0.56,
      changePercent: -0.57,
      currency: "USD",
    },
    metrics: {
      peRatio: 60.3,
      roe: 0.115,
      debtToEquity: 1.12,
      dividendYield: null,
    },
  },
  TSLA: {
    ticker: "TSLA",
    name: "Tesla, Inc.",
    exchange: "NASDAQ",
    sector: "Consumer Discretionary",
    industry: "Auto Manufacturers",
    description:
      "Tesla, Inc. is an American electric vehicle and clean energy company that designs, manufactures, and sells electric vehicles, battery energy storage systems, and solar products.",
    price: {
      current: 720.15,
      change: 5.32,
      changePercent: 0.74,
      currency: "USD",
    },
    metrics: {
      peRatio: 110.2,
      roe: 0.125,
      debtToEquity: 1.85,
      dividendYield: null,
    },
  },
  NVDA: {
    ticker: "NVDA",
    name: "NVIDIA Corporation",
    exchange: "NASDAQ",
    sector: "Technology",
    industry: "Semiconductors",
    description:
      "NVIDIA Corporation is an American multinational technology company that designs graphics processing units (GPUs) for gaming and professional markets, as well as system on a chip units (SoCs) for the mobile computing and automotive market.",
    price: {
      current: 195.67,
      change: 3.45,
      changePercent: 1.79,
      currency: "USD",
    },
    metrics: {
      peRatio: 45.6,
      roe: 0.285,
      debtToEquity: 0.54,
      dividendYield: null,
    },
  },
  META: {
    ticker: "META",
    name: "Meta Platforms, Inc.",
    exchange: "NASDAQ",
    sector: "Communication Services",
    industry: "Internet Content & Information",
    description:
      "Meta Platforms, Inc. is an American multinational technology company that operates the social media platform Facebook and other services.",
    price: {
      current: 250.15,
      change: 5.32,
      changePercent: 2.17,
      currency: "USD",
    },
    metrics: {
      peRatio: 25.6,
      roe: 0.185,
      debtToEquity: 0.12,
      dividendYield: null,
    },
  },
  "BRK.B": {
    ticker: "BRK.B",
    name: "Berkshire Hathaway Inc.",
    exchange: "NYSE",
    sector: "Financials",
    industry: "Insurance—Diversified",
    description:
      "Berkshire Hathaway Inc. is an American multinational conglomerate holding company that oversees and manages a number of subsidiary companies.",
    price: {
      current: 300.45,
      change: -1.12,
      changePercent: -0.37,
      currency: "USD",
    },
    metrics: {
      peRatio: 20.3,
      roe: 0.125,
      debtToEquity: 0.45,
      dividendYield: 0.0025,
    },
  },
  JPM: {
    ticker: "JPM",
    name: "JPMorgan Chase & Co.",
    exchange: "NYSE",
    sector: "Financials",
    industry: "Banks—Diversified",
    description:
      "JPMorgan Chase & Co. is an American multinational investment bank and financial services holding company headquartered in New York City.",
    price: {
      current: 150.67,
      change: 1.45,
      changePercent: 0.97,
      currency: "USD",
    },
    metrics: {
      peRatio: 12.5,
      roe: 0.145,
      debtToEquity: 1.25,
      dividendYield: 0.0035,
    },
  },
  JNJ: {
    ticker: "JNJ",
    name: "Johnson & Johnson",
    exchange: "NYSE",
    sector: "Health Care",
    industry: "Drug Manufacturers—General",
    description:
      "Johnson & Johnson is an American multinational corporation that develops medical devices, pharmaceuticals, and consumer packaged goods.",
    price: {
      current: 165.45,
      change: -0.56,
      changePercent: -0.34,
      currency: "USD",
    },
    metrics: {
      peRatio: 18.2,
      roe: 0.185,
      debtToEquity: 0.45,
      dividendYield: 0.025,
    },
  },
  MSTR: {
    ticker: "MSTR",
    name: "MicroStrategy Incorporated",
    exchange: "NASDAQ",
    sector: "Technology",
    industry: "Software—Infrastructure",
    description:
      "MicroStrategy Incorporated is an American company that provides business intelligence, mobile software, and cloud-based services.",
    price: {
      current: 650.15,
      change: 10.32,
      changePercent: 1.61,
      currency: "USD",
    },
    metrics: {
      peRatio: 35.6,
      roe: 0.225,
      debtToEquity: 1.85,
      dividendYield: null,
    },
  },
  NFLX: {
    ticker: "NFLX",
    name: "Netflix, Inc.",
    exchange: "NASDAQ",
    sector: "Communication Services",
    industry: "Entertainment",
    description:
      "Netflix, Inc. is an American subscription streaming service and production company offering films and series across a wide range of genres and languages.",
    price: {
      current: 685.4,
      change: 8.2,
      changePercent: 1.21,
      currency: "USD",
    },
    metrics: {
      peRatio: 45.2,
      roe: 0.32,
      debtToEquity: 0.68,
      dividendYield: null,
    },
  },
  AMD: {
    ticker: "AMD",
    name: "Advanced Micro Devices, Inc.",
    exchange: "NASDAQ",
    sector: "Technology",
    industry: "Semiconductors",
    description:
      "Advanced Micro Devices, Inc. is an American semiconductor company that designs processors and graphics technologies for data centers, gaming, and embedded systems.",
    price: {
      current: 168.75,
      change: -2.1,
      changePercent: -1.23,
      currency: "USD",
    },
    metrics: {
      peRatio: 48.6,
      roe: 0.075,
      debtToEquity: 0.05,
      dividendYield: null,
    },
  },
  DIS: {
    ticker: "DIS",
    name: "The Walt Disney Company",
    exchange: "NYSE",
    sector: "Communication Services",
    industry: "Entertainment",
    description:
      "The Walt Disney Company is an American multinational mass media and entertainment conglomerate spanning studios, streaming, parks, and consumer products.",
    price: {
      current: 102.3,
      change: 0.65,
      changePercent: 0.64,
      currency: "USD",
    },
    metrics: {
      peRatio: 38.4,
      roe: 0.045,
      debtToEquity: 0.45,
      dividendYield: 0.008,
    },
  },
  COIN: {
    ticker: "COIN",
    name: "Coinbase Global, Inc.",
    exchange: "NASDAQ",
    sector: "Financials",
    industry: "Capital Markets",
    description:
      "Coinbase Global, Inc. is an American company that operates a platform for buying, selling, and storing cryptocurrency for retail and institutional users.",
    price: {
      current: 245.8,
      change: 12.45,
      changePercent: 5.33,
      currency: "USD",
    },
    metrics: {
      peRatio: 52.1,
      roe: 0.18,
      debtToEquity: 0.72,
      dividendYield: null,
    },
  },
  PLTR: {
    ticker: "PLTR",
    name: "Palantir Technologies Inc.",
    exchange: "NASDAQ",
    sector: "Technology",
    industry: "Software—Infrastructure",
    description:
      "Palantir Technologies Inc. is an American company that builds software platforms for data integration and analysis used by governments and enterprises.",
    price: {
      current: 68.9,
      change: 2.35,
      changePercent: 3.53,
      currency: "USD",
    },
    metrics: {
      peRatio: 210.5,
      roe: 0.11,
      debtToEquity: 0.02,
      dividendYield: null,
    },
  },
  UBER: {
    ticker: "UBER",
    name: "Uber Technologies, Inc.",
    exchange: "NYSE",
    sector: "Technology",
    industry: "Software—Application",
    description:
      "Uber Technologies, Inc. is an American company that operates a platform for ride hailing, food delivery, and freight logistics worldwide.",
    price: {
      current: 72.15,
      change: -0.9,
      changePercent: -1.23,
      currency: "USD",
    },
    metrics: {
      peRatio: 32.8,
      roe: 0.22,
      debtToEquity: 0.58,
      dividendYield: null,
    },
  },
  RKLB: {
    ticker: "RKLB",
    name: "Rocket Lab USA, Inc.",
    exchange: "NASDAQ",
    sector: "Industrials",
    industry: "Aerospace & Defense",
    description:
      "Rocket Lab USA, Inc. is an American aerospace company that provides launch services and space systems for small satellites and government missions.",
    price: {
      current: 24.6,
      change: 1.15,
      changePercent: 4.9,
      currency: "USD",
    },
    metrics: {
      peRatio: null,
      roe: -0.18,
      debtToEquity: 0.85,
      dividendYield: null,
    },
  },
  KO: {
    ticker: "KO",
    name: "The Coca-Cola Company",
    exchange: "NYSE",
    sector: "Consumer Staples",
    industry: "Beverages—Non-Alcoholic",
    description:
      "The Coca-Cola Company is an American multinational beverage corporation that manufactures and markets nonalcoholic drinks and syrups worldwide.",
    price: {
      current: 63.45,
      change: -0.22,
      changePercent: -0.35,
      currency: "USD",
    },
    metrics: {
      peRatio: 24.6,
      roe: 0.42,
      debtToEquity: 1.55,
      dividendYield: 0.031,
    },
  },
  SHOP: {
    ticker: "SHOP",
    name: "Shopify Inc.",
    exchange: "NYSE",
    sector: "Technology",
    industry: "Software—Application",
    description:
      "Shopify Inc. is a Canadian company that provides a commerce platform for merchants to build online stores and manage sales across channels.",
    price: {
      current: 78.2,
      change: 1.8,
      changePercent: 2.36,
      currency: "USD",
    },
    metrics: {
      peRatio: 88.3,
      roe: 0.09,
      debtToEquity: 0.12,
      dividendYield: null,
    },
  },
  INTC: {
    ticker: "INTC",
    name: "Intel Corporation",
    exchange: "NASDAQ",
    sector: "Technology",
    industry: "Semiconductors",
    description:
      "Intel Corporation is an American semiconductor company that designs and manufactures processors, chipsets, and related technologies for computing devices.",
    price: {
      current: 34.1,
      change: -0.55,
      changePercent: -1.59,
      currency: "USD",
    },
    metrics: {
      peRatio: 31.2,
      roe: 0.06,
      debtToEquity: 0.44,
      dividendYield: 0.014,
    },
  },
};

function generateCandles(basePrice: number): Candle[] {
  const days = 90;
  const candles: Candle[] = [];
  const now = Math.floor(Date.now() / 1000);
  const startTime = now - days * 86400; // 90 days ago in seconds
  const volatility = basePrice * 0.018;

  let price = basePrice * 0.87; // Start 13% below the base price
  let seed = basePrice * 1000; // Seed for deterministic randomness

  const random = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  for (let i = 0; i <= days; i++) {
    const time = startTime + i * 86400;
    const drift = (random() - 0.47) * volatility; // Random drift
    const open = price;
    const close = price + drift;
    const high = Math.max(open, close) + random() * volatility * 0.6;
    const low = Math.min(open, close) - random() * volatility * 0.6;

    candles.push({
      time,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
    });

    price = close;
  }
  return candles;
}

function mockAnalyze(ticker: string, request: WireRequest): AnalyzeResponse | null {
  const company = companies[ticker];
  if (!company) return null;

  const m = company.metrics;
  const changePct = company.price.changePercent;

  let fundamental = 55;
  if (m.roe && m.roe > 0.15) fundamental += 15;
  if (m.roe && m.roe > 0.25) fundamental += 10;
  if (m.debtToEquity !== null && m.debtToEquity < 1) fundamental += 8;
  if (m.debtToEquity !== null && m.debtToEquity > 1.5) fundamental -= 8;
  if (m.peRatio && m.peRatio < 25) fundamental += 8;
  if (m.peRatio && m.peRatio > 50) fundamental -= 12;
  fundamental = Math.max(25, Math.min(95, fundamental));

  let technical = 55;
  if (changePct > 0) technical += 12;
  if (changePct > 2) technical += 10;
  if (changePct < 0) technical -= 8;
  if (changePct < -2) technical -= 12;
  technical = Math.max(25, Math.min(95, technical));

  let marketIntel = 65;
  if (Math.abs(changePct) > 2) marketIntel -= 12;
  if (m.debtToEquity !== null && m.debtToEquity > 1.5) marketIntel -= 10;
  if (request.risk_profile === "conservative") marketIntel += 5;
  if (request.risk_profile === "aggressive") marketIntel -= 8;
  marketIntel = Math.max(30, Math.min(90, marketIntel));

  const average = (fundamental + technical + marketIntel) / 3;
  const recommendation: AnalyzeResponse["recommendation"] =
    average >= 72 ? "BUY" : average >= 55 ? "HOLD" : "SELL";
  const confidence = Math.min(95, Math.round(average + 6));

  const volatility = Math.abs(changePct);
  const riskLevel: AnalyzeResponse["risk_level"] =
    volatility > 2.5 || (m.debtToEquity !== null && m.debtToEquity > 1.8)
      ? "High"
      : volatility > 1 || (m.debtToEquity !== null && m.debtToEquity > 1.1)
        ? "Medium"
        : "Low";

  const reasons: string[] = [];
  if (fundamental > 70 && m.roe) {
    reasons.push(
      `Fundamental kuat, ROE ${(m.roe * 100).toFixed(1)}% menunjukkan efisiensi modal`,
    );
  }
  if (fundamental < 55) {
    reasons.push("Fundamental lemah, valuasi tinggi relatif terhadap laba");
  }
  if (technical > 70) {
    reasons.push(`Momentum harga positif, naik ${changePct.toFixed(2)}% terakhir`);
  }
  if (technical < 55) {
    reasons.push("Momentum harga melemah dalam periode terakhir");
  }
  if (marketIntel > 70) {
    reasons.push(
      `Profil risiko ${request.risk_profile} cocok dengan volatilitas terkini`,
    );
  }
  if (marketIntel < 55) {
    reasons.push("Volatilitas tinggi, waspada terhadap fluktuasi jangka pendek");
  }
  if (request.investment_goal === "long_term" && recommendation === "BUY") {
    reasons.push("Konsisten dengan tujuan jangka panjang");
  }
  if (reasons.length === 0) {
    reasons.push("Sinyal campuran, tunggu konfirmasi lanjutan");
  }

  const trend = changePct > 0.5 ? "uptrend" : changePct < -0.5 ? "downtrend" : "neutral";
  const rsi = Math.max(5, Math.min(95, Math.round(50 + changePct * 5)));
  const relatedNews = newsItems
    .filter((item) => item.tickers.includes(ticker))
    .slice(0, 3)
    .map((item) => item.title);

  const finalReasoning =
    `${recommendation} dipilih karena skor gabungan multi-agent ${confidence} dari 100. ` +
    `Keputusan menimbang kekuatan fundamental (${fundamental}), teknikal (${technical}), ` +
    `dan intelijen pasar (${marketIntel}), disesuaikan dengan profil risiko ${request.risk_profile}.`;

  const whatCouldChange = {
    BUY: "Verdict bisa turun ke HOLD jika momentum teknikal melemah, pertumbuhan laba meleset, atau risiko pasar naik signifikan.",
    HOLD: "Verdict bisa naik ke BUY jika momentum teknikal menguat dan pertumbuhan pendapatan kuartal berikutnya melampaui ekspektasi.",
    SELL: "Verdict bisa membaik ke HOLD jika valuasi menjadi lebih menarik, risiko utama menurun, dan fundamental pulih jelas.",
  }[recommendation];

  return {
    recommendation,
    confidence,
    fundamental_score: fundamental,
    technical_score: technical,
    market_intelligence_score: marketIntel,
    reason: reasons.slice(0, 4),
    company_name: company.name,
    sector: company.sector,
    risk_level: riskLevel,
    final_reasoning: finalReasoning,
    what_could_change: whatCouldChange,
    market_data: {
      price: company.price.current,
      changePercent1y: Number((changePct * 12).toFixed(2)),
      pe: m.peRatio ?? undefined,
      roe: m.roe ?? undefined,
      rsi,
      trend,
      news: relatedNews.length > 0 ? relatedNews : undefined,
    },
  };
}

const indexBases = [
  { symbol: "SPX", name: "S&P 500", value: 5478.12 },
  { symbol: "IXIC", name: "Nasdaq Composite", value: 17862.45 },
  { symbol: "DJI", name: "Dow Jones", value: 39120.78 },
];

function liveQuote(seedKey: string, base: number) {
  const bucket = Math.floor(Date.now() / 60_000);
  let seed = bucket % 233280;
  for (const char of seedKey) {
    seed = (seed * 31 + char.charCodeAt(0)) % 233280;
  }
  const random = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const spark: number[] = [];
  let value = base;
  for (let i = 0; i < 24; i++) {
    value += (random() - 0.5) * base * 0.004;
    spark.push(Number(value.toFixed(2)));
  }
  const current = spark[spark.length - 1] ?? base;
  const change = Number((current - base).toFixed(2));
  const changePercent = Number(((change / base) * 100).toFixed(2));
  return { spark, current, change, changePercent };
}

export function liveIndices(): MarketIndex[] {
  return indexBases.map((index) => {
    const quote = liveQuote(index.symbol, index.value);
    return {
      symbol: index.symbol,
      name: index.name,
      value: quote.current,
      change: quote.change,
      changePercent: quote.changePercent,
      spark: quote.spark,
    };
  });
}

const newsItems: NewsItem[] = [
  {
    id: 1,
    title: "Apple mempercepat peta jalan chip AI untuk perangkat generasi berikutnya",
    source: "Market Wire",
    url: "#",
    publishedAt: "2026-07-19T12:30:00.000Z",
    tickers: ["AAPL"],
    category: "chips",
    body: [
      "Apple dikabarkan mempercepat pengembangan chip khusus kecerdasan buatan untuk lini perangkat generasi berikutnya. Langkah ini menandai upaya perusahaan mengurangi ketergantungan pada pemasok pihak ketiga dan menempatkan pemrosesan AI langsung di perangkat pengguna.",
      "Analis menilai strategi silikon di dalam rumah dapat memperkuat margin jangka panjang dan mempercepat fitur AI baru. Investor akan mencermati apakah investasi riset ini terlihat pada panduan pendapatan kuartal mendatang.",
    ],
  },
  {
    id: 2,
    title: "NVIDIA memperluas pasokan pusat data seiring permintaan komputasi AI",
    source: "Tech Daily",
    url: "#",
    publishedAt: "2026-07-19T10:05:00.000Z",
    tickers: ["NVDA"],
    category: "chips",
    body: [
      "NVIDIA memperluas kapasitas pasokan untuk pusat data seiring permintaan komputasi kecerdasan buatan yang terus melonjak. Perusahaan berupaya memenuhi antrean pesanan dari penyedia layanan awan besar yang berlomba membangun infrastruktur AI.",
      "Kesenjangan antara permintaan dan pasokan chip kelas atas tetap menjadi sorotan utama. Ketahanan rantai pasok dinilai akan menentukan seberapa cepat pertumbuhan pendapatan segmen pusat data dapat dipertahankan.",
    ],
  },
  {
    id: 3,
    title: "Microsoft melaporkan pertumbuhan Azure yang tetap kuat pada kuartal ini",
    source: "Finance Post",
    url: "#",
    publishedAt: "2026-07-18T20:45:00.000Z",
    tickers: ["MSFT"],
    category: "tech",
    body: [
      "Microsoft melaporkan pertumbuhan Azure yang tetap kuat pada kuartal ini, didorong adopsi layanan awan dan beban kerja kecerdasan buatan. Segmen awan kembali menjadi mesin utama pertumbuhan perusahaan.",
      "Manajemen menekankan investasi berkelanjutan pada kapasitas pusat data. Investor menilai konsistensi pertumbuhan Azure sebagai indikator penting daya saing jangka panjang.",
    ],
  },
  {
    id: 4,
    title: "The Fed mempertahankan suku bunga, pasar merespons hati hati",
    source: "Macro Brief",
    url: "#",
    publishedAt: "2026-07-18T15:00:00.000Z",
    tickers: [],
    category: "macro",
    body: [
      "Bank sentral Amerika Serikat memutuskan mempertahankan suku bunga acuan pada level saat ini, sejalan dengan ekspektasi sebagian besar pelaku pasar. Pejabat menekankan pendekatan berbasis data sebelum menentukan arah kebijakan selanjutnya.",
      "Pasar merespons dengan hati hati, mencerna sinyal soal inflasi dan ketenagakerjaan. Keputusan ini berdampak luas pada valuasi saham, terutama sektor yang sensitif terhadap biaya pinjaman.",
    ],
  },
  {
    id: 5,
    title: "Amazon menata ulang jaringan logistik untuk menekan biaya pengiriman",
    source: "Retail Signal",
    url: "#",
    publishedAt: "2026-07-18T09:20:00.000Z",
    tickers: ["AMZN"],
    category: "retail",
    body: [
      "Amazon menata ulang jaringan logistiknya untuk menekan biaya pengiriman dan mempercepat waktu antar. Perusahaan mengoptimalkan lokasi gudang serta rute distribusi guna meningkatkan efisiensi operasional.",
      "Penghematan biaya di rantai pasok berpotensi memperbaiki margin ritel yang selama ini tipis. Analis mencermati dampaknya terhadap arus kas bebas pada kuartal mendatang.",
    ],
  },
  {
    id: 6,
    title: "Alphabet memperluas integrasi AI di seluruh lini produk pencarian",
    source: "Tech Daily",
    url: "#",
    publishedAt: "2026-07-19T08:15:00.000Z",
    tickers: ["GOOGL"],
    category: "tech",
    body: [
      "Alphabet memperluas integrasi kecerdasan buatan di seluruh lini produk pencarian, membawa ringkasan dan jawaban generatif ke lebih banyak pengguna. Langkah ini menegaskan posisi AI sebagai inti strategi produk perusahaan.",
      "Tantangannya adalah menjaga relevansi iklan sambil meningkatkan pengalaman pencarian. Investor menilai keseimbangan ini penting bagi keberlanjutan pendapatan iklan.",
    ],
  },
  {
    id: 7,
    title: "Tesla meningkatkan produksi pabrik baterai menjelang kuartal berikutnya",
    source: "Auto Wire",
    url: "#",
    publishedAt: "2026-07-18T13:40:00.000Z",
    tickers: ["TSLA"],
    category: "auto",
    body: [
      "Tesla meningkatkan produksi pabrik baterai menjelang kuartal berikutnya untuk memenuhi permintaan kendaraan listrik dan penyimpanan energi. Peningkatan kapasitas ini dinilai krusial bagi target pengiriman perusahaan.",
      "Efisiensi produksi baterai berkaitan langsung dengan struktur biaya kendaraan. Pasar mengamati apakah skala baru ini mampu menjaga margin di tengah persaingan harga.",
    ],
  },
  {
    id: 8,
    title: "Meta memperkenalkan alat periklanan berbasis AI generatif baru",
    source: "Market Wire",
    url: "#",
    publishedAt: "2026-07-17T16:10:00.000Z",
    tickers: ["META"],
    category: "tech",
    body: [
      "Meta memperkenalkan sejumlah alat periklanan berbasis kecerdasan buatan generatif yang membantu pengiklan membuat materi kreatif secara otomatis. Fitur ini bertujuan meningkatkan kinerja kampanye sekaligus menyederhanakan alur kerja.",
      "Otomasi kreatif berpotensi mendorong belanja iklan dari pelaku usaha kecil. Investor menilai adopsi alat ini sebagai penopang pertumbuhan pendapatan iklan.",
    ],
  },
  {
    id: 9,
    title: "Palantir memenangkan kontrak pemerintah baru untuk analitik data",
    source: "Gov Tech Brief",
    url: "#",
    publishedAt: "2026-07-17T11:25:00.000Z",
    tickers: ["PLTR"],
    category: "tech",
    body: [
      "Palantir memenangkan kontrak pemerintah baru untuk platform analitik data, memperkuat posisinya di sektor publik. Kontrak ini menambah aliran pendapatan berulang yang dinilai stabil oleh analis.",
      "Ketergantungan pada anggaran pemerintah tetap menjadi faktor risiko sekaligus peluang. Pasar mencermati apakah momentum kontrak dapat merambah ke sektor komersial.",
    ],
  },
  {
    id: 10,
    title: "Coinbase mencatat lonjakan volume perdagangan seiring rally kripto",
    source: "Crypto Ledger",
    url: "#",
    publishedAt: "2026-07-16T19:50:00.000Z",
    tickers: ["COIN"],
    category: "crypto",
    body: [
      "Coinbase mencatat lonjakan volume perdagangan seiring rally pasar kripto yang menarik kembali minat investor ritel maupun institusi. Aktivitas yang meningkat berdampak langsung pada pendapatan berbasis transaksi.",
      "Ketergantungan pada volatilitas kripto membuat pendapatan perusahaan sangat fluktuatif. Analis menyoroti upaya diversifikasi ke layanan yang lebih stabil seperti kustodian dan staking.",
    ],
  },
  {
    id: 11,
    title: "Intel memulai produksi node chip generasi terbaru di pabrik Arizona",
    source: "Tech Daily",
    url: "#",
    publishedAt: "2026-07-16T07:30:00.000Z",
    tickers: ["INTC"],
    category: "chips",
    body: [
      "Intel memulai produksi node chip generasi terbaru di pabrik Arizona, tonggak penting dalam upaya perusahaan merebut kembali kepemimpinan manufaktur semikonduktor. Fasilitas ini menjadi bagian dari ekspansi kapasitas domestik.",
      "Keberhasilan menaikkan hasil produksi pada node baru akan menentukan daya saing biaya. Investor menanti bukti bahwa investasi pabrik besar ini mulai membuahkan hasil.",
    ],
  },
];

function localizedCompany(company: Company): Company {
  if (mockLocale() !== "id") return company;
  const description = companyDescriptionsId[company.ticker];
  return description ? { ...company, description } : company;
}

function localizedNews(items: NewsItem[]): NewsItem[] {
  if (mockLocale() !== "en") return items;
  return items.map((item) => {
    const override = newsEn[item.id];
    return override ? { ...item, ...override } : item;
  });
}

export function buildMovers(): { gainers: Mover[]; losers: Mover[] } {
  const movers: Mover[] = Object.values(companies).map((company) => {
    const quote = liveQuote(company.ticker, company.price.current);
    return {
      ticker: company.ticker,
      name: company.name,
      price: quote.current,
      changePercent: quote.changePercent,
      spark: quote.spark,
    };
  });
  const byDesc = [...movers].sort((a, b) => b.changePercent - a.changePercent);
  const byAsc = [...movers].sort((a, b) => a.changePercent - b.changePercent);
  return { gainers: byDesc.slice(0, 3), losers: byAsc.slice(0, 3) };
}

type Credentials = { email?: string; password?: string; name?: string };

export async function mockApiFetch<T>(
  path: string,
  method: string,
  body: unknown,
): Promise<T> {
  await delay(600);

  const input = (body ?? {}) as Credentials;

  if (path === "/api/user" && method === "GET") {
    const user = storedUser();
    if (!user) {
      throw new ApiError("Belum masuk", 401);
    }
    return user as T;
  }

  if (path === "/api/user" && method === "PATCH") {
    const current = storedUser();
    if (!current) {
      throw new ApiError("Belum masuk", 401);
    }
    const updates = body as Partial<User>;
    const updated: User = { ...current, ...updates };
    persistUser(updated);
    return updated as T;
  }

  if (path === "/login" && method === "POST") {
    if (input.password === "salah") {
      throw new ApiError("Data yang diberikan tidak valid", 422, {
        email: ["Email atau kata sandi tidak cocok"],
      });
    }
    const user: User = {
      id: "mock-1",
      name: "Clay",
      email: input.email ?? "clay@example.com",
      notifyPriceAlert: true,
      notifyNewsDigest: true,
    };
    persistUser(user);
    return user as T;
  }

  if (path === "/register" && method === "POST") {
    if (input.email === "taken@example.com") {
      throw new ApiError("Data yang diberikan tidak valid", 422, {
        email: ["Email sudah terdaftar"],
      });
    }
    const user: User = {
      id: "mock-1",
      name: input.name ?? "Pengguna baru",
      email: input.email ?? "baru@example.com",
      notifyPriceAlert: true,
      notifyNewsDigest: true,
    };
    persistUser(user);
    return user as T;
  }

  if (path === "/logout" && method === "POST") {
    clearUser();
    return undefined as T;
  }

  const companyMatch = path.match(/^\/api\/company\/([A-Z0-9.]+)$/);
  if (companyMatch && method === "GET") {
    const ticker = companyMatch[1];
    if (!ticker) {
      throw new ApiError("Ticker tidak ditemukan", 404);
    }
    const company = companies[ticker];
    if (!company) {
      throw new ApiError(`Saham ${ticker} tidak ditemukan`, 404);
    }
    return localizedCompany(company) as T;
  }

  const candleMatch = path.match(/^\/api\/company\/([A-Z0-9.]+)\/candles$/);
  if (candleMatch && method === "GET") {
    const ticker = candleMatch[1];
    if (!ticker) {
      throw new ApiError("Ticker tidak ditemukan", 404);
    }
    const company = companies[ticker];
    if (!company) {
      throw new ApiError(`Saham ${ticker} tidak ditemukan`, 404);
    }
    return generateCandles(company.price.current) as T;
  }

  if (path === "/api/watchlist" && method === "GET") {
    const items = storedWatchlist()
      .map(toWatchlistItem)
      .filter((item): item is WatchlistItem => item !== null)
      .sort((a, b) => b.addedAt.localeCompare(a.addedAt));
    return items as T;
  }

  if (path === "/api/watchlist" && method === "POST") {
    const addInput = body as AddWatchlistInput;
    const ticker = addInput.ticker.toUpperCase();
    if (!companies[ticker]) {
      throw new ApiError(`Saham ${addInput.ticker} tidak ditemukan`, 404);
    }
    const items = storedWatchlist();
    const existing = items.find((item) => item.ticker === ticker);
    if (existing) {
      if (addInput.recommendation !== undefined) {
        existing.recommendation = addInput.recommendation;
      }
      if (addInput.confidence !== undefined) {
        existing.confidence = addInput.confidence;
      }
      persistWatchlist(items);
      return toWatchlistItem(existing) as T;
    }
    const nextId = items.reduce((max, item) => Math.max(max, item.id), 0) + 1;
    const created: StoredWatchlistItem = {
      id: nextId,
      ticker,
      recommendation: addInput.recommendation ?? null,
      confidence: addInput.confidence ?? null,
      addedAt: new Date().toISOString(),
    };
    items.push(created);
    persistWatchlist(items);
    return toWatchlistItem(created) as T;
  }

  const watchlistDeleteMatch = path.match(/^\/api\/watchlist\/(\d+)$/);
  if (watchlistDeleteMatch && method === "DELETE") {
    const id = Number(watchlistDeleteMatch[1]);
    persistWatchlist(storedWatchlist().filter((item) => item.id !== id));
    return undefined as T;
  }

  if (path === "/api/alerts" && method === "GET") {
    return storedAlerts() as T;
  }

  const alertMatch = path.match(/^\/api\/alerts\/([A-Z0-9.]+)$/);
  if (alertMatch) {
    const ticker = alertMatch[1] ?? "";
    if (method === "PUT") {
      const input = body as SetAlertInput;
      const alert: PriceAlert = {
        ticker,
        targetPrice: input.targetPrice,
        condition: input.condition,
      };
      const others = storedAlerts().filter((item) => item.ticker !== ticker);
      persistAlerts([...others, alert]);
      const fired = storedStringSet(FIRED_ALERTS_KEY);
      if (fired.delete(ticker)) persistStringSet(FIRED_ALERTS_KEY, fired);
      return alert as T;
    }
    if (method === "DELETE") {
      persistAlerts(storedAlerts().filter((item) => item.ticker !== ticker));
      const fired = storedStringSet(FIRED_ALERTS_KEY);
      if (fired.delete(ticker)) persistStringSet(FIRED_ALERTS_KEY, fired);
      return undefined as T;
    }
  }

  if (path === "/api/notifications" && method === "GET") {
    const user = storedUser();
    if (!user) {
      throw new ApiError("Belum masuk", 401);
    }
    syncAlertNotifications(user);
    syncNewsNotifications(user);
    return [...storedNotifications()].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    ) as T;
  }

  const notificationReadMatch = path.match(/^\/api\/notifications\/(\d+)\/read$/);
  if (notificationReadMatch && method === "PATCH") {
    const id = Number(notificationReadMatch[1]);
    persistNotifications(
      storedNotifications().map((item) =>
        item.id === id ? { ...item, read: true } : item,
      ),
    );
    return undefined as T;
  }

  if (path === "/api/notifications/read-all" && method === "POST") {
    persistNotifications(storedNotifications().map((item) => ({ ...item, read: true })));
    return undefined as T;
  }

  if (path === "/api/market" && method === "GET") {
    const { gainers, losers } = buildMovers();
    const summary: MarketSummary = { indices: liveIndices(), gainers, losers };
    return summary as T;
  }

  const newsDetailMatch = path.match(/^\/api\/news\/(\d+)$/);
  if (newsDetailMatch && method === "GET") {
    const id = Number(newsDetailMatch[1]);
    const item = newsItems.find((entry) => entry.id === id);
    if (!item) {
      throw new ApiError("Berita tidak ditemukan", 404);
    }
    return localizedNews([item])[0] as T;
  }

  const newsMatch = path.match(/^\/api\/news(?:\?(.*))?$/);
  if (newsMatch && method === "GET") {
    const ticker = new URLSearchParams(newsMatch[1] ?? "").get("ticker");
    const items = ticker
      ? newsItems.filter((item) => item.tickers.includes(ticker.toUpperCase()))
      : newsItems;
    return localizedNews(items) as T;
  }

  if (path === "/api/analyze" && method === "POST") {
    await delay(2400);
    const params = body as WireRequest;
    const ticker = params.ticker.toUpperCase();
    const result = mockAnalyze(ticker, params);
    if (!result) {
      throw new ApiError(`Saham ${params.ticker} tidak ditemukan`, 404);
    }
    if (storedUser()) {
      pushNotification({
        type: "analysis_done",
        ticker,
        recommendation: result.recommendation,
        href: `/companies/${ticker}`,
      });
    }
    return result as T;
  }

  throw new ApiError(`Endpoint tiruan belum tersedia, ${method} ${path}`, 404);
}
