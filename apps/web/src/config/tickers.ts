export type PopularTicker = {
  ticker: string;
  name: string;
  sector: string;
};

export const popularTickers: PopularTicker[] = [
  { ticker: "AAPL", name: "Apple Inc.", sector: "Technology" },
  { ticker: "MSFT", name: "Microsoft Corporation", sector: "Technology" },
  { ticker: "GOOGL", name: "Alphabet Inc.", sector: "Communication Services" },
  { ticker: "AMZN", name: "Amazon.com, Inc.", sector: "Consumer Discretionary" },
  { ticker: "TSLA", name: "Tesla, Inc.", sector: "Consumer Discretionary" },
  { ticker: "NVDA", name: "NVIDIA Corporation", sector: "Technology" },
  { ticker: "META", name: "Meta Platforms, Inc.", sector: "Communication Services" },
  { ticker: "BRK.B", name: "Berkshire Hathaway Inc.", sector: "Financials" },
  { ticker: "JPM", name: "JPMorgan Chase & Co.", sector: "Financials" },
  { ticker: "JNJ", name: "Johnson & Johnson", sector: "Health Care" },
  { ticker: "MSTR", name: "MicroStrategy Incorporated", sector: "Technology" },
  { ticker: "NFLX", name: "Netflix, Inc.", sector: "Communication Services" },
  { ticker: "AMD", name: "Advanced Micro Devices, Inc.", sector: "Technology" },
  { ticker: "DIS", name: "The Walt Disney Company", sector: "Communication Services" },
  { ticker: "COIN", name: "Coinbase Global, Inc.", sector: "Financials" },
  { ticker: "PLTR", name: "Palantir Technologies Inc.", sector: "Technology" },
  { ticker: "UBER", name: "Uber Technologies, Inc.", sector: "Technology" },
  { ticker: "RKLB", name: "Rocket Lab USA, Inc.", sector: "Industrials" },
  { ticker: "KO", name: "The Coca-Cola Company", sector: "Consumer Staples" },
  { ticker: "SHOP", name: "Shopify Inc.", sector: "Technology" },
  { ticker: "INTC", name: "Intel Corporation", sector: "Technology" },
];
