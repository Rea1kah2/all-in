import type { LearnCategorySlug } from "@/config/learn";

type Display = { term: string; short: string };

export const categoriesEn: Record<
  LearnCategorySlug,
  { title: string; description: string }
> = {
  fundamental: {
    title: "Fundamental",
    description: "Judging business health, valuation, and the numbers behind a stock.",
  },
  technical: {
    title: "Technical and SMC",
    description:
      "Reading price structure and momentum, including the Smart Money Concept framework.",
  },
  risk: {
    title: "Risk Management",
    description:
      "Protecting capital through position sizing, stop loss, and diversification.",
  },
  psychology: {
    title: "Investing Psychology",
    description: "Managing the emotions and biases that shape investment decisions.",
  },
};

export const glossaryEn: Record<string, Display> = {
  "pe-ratio": {
    term: "P/E Ratio",
    short:
      "Share price relative to earnings per share. It shows how much investors pay for each dollar of profit.",
  },
  roe: {
    term: "ROE",
    short:
      "Return on Equity measures how efficiently a company turns shareholder capital into profit. Higher is generally better.",
  },
  eps: {
    term: "EPS",
    short:
      "Net profit divided by shares outstanding, the slice of earnings attributable to each share.",
  },
  "dividend-yield": {
    term: "Dividend Yield",
    short:
      "Annual dividend divided by share price, shown as a percent. Zero or empty means the company pays no dividend.",
  },
  "market-cap": {
    term: "Market Cap",
    short:
      "The total value of a company's shares, calculated as share price times shares outstanding.",
  },
  "debt-to-equity": {
    term: "Debt to Equity",
    short:
      "Total debt relative to equity. A high ratio signals the company leans heavily on borrowing.",
  },
  "revenue-growth": {
    term: "Revenue Growth",
    short:
      "How fast revenue rises over time, an early signal of whether the business is expanding or slowing.",
  },
  "free-cash-flow": {
    term: "Free Cash Flow",
    short:
      "Cash left after operating costs and capital spending, the real money available for dividends, buybacks, or expansion.",
  },
  "support-resistance": {
    term: "Support and Resistance",
    short:
      "Support is a price area that tends to halt declines, resistance an area that tends to cap advances.",
  },
  trend: {
    term: "Trend",
    short:
      "The dominant direction of price. An uptrend prints higher highs and higher lows, a downtrend the reverse.",
  },
  "moving-average": {
    term: "Moving Average",
    short:
      "An average of price over a set period that smooths noise and helps reveal the direction of the trend.",
  },
  rsi: {
    term: "RSI",
    short:
      "The Relative Strength Index measures the speed of price moves from zero to one hundred, often used to flag overbought or oversold conditions.",
  },
  volume: {
    term: "Volume",
    short:
      "The number of shares traded in a period. Heavy volume adds conviction to a price move.",
  },
  "order-block": {
    term: "Order Block",
    short:
      "In Smart Money Concept, the last candle area before a strong move, read as the footprint of large institutional orders and a likely reaction zone.",
  },
  liquidity: {
    term: "Liquidity",
    short:
      "Clusters of orders, often around obvious highs or lows, that price tends to target in the Smart Money Concept framework.",
  },
  "fair-value-gap": {
    term: "Fair Value Gap",
    short:
      "A price gap left by a fast move that creates an imbalance, often revisited before price continues.",
  },
  "break-of-structure": {
    term: "Break of Structure",
    short:
      "When price breaks a significant high or low in the direction of the trend, suggesting the current trend likely continues.",
  },
  "change-of-character": {
    term: "Change of Character",
    short:
      "An early reversal signal in Smart Money Concept, when price breaks structure against the prior trend.",
  },
  "premium-discount": {
    term: "Premium and Discount",
    short:
      "Splitting a price range into expensive (premium) and cheap (discount) zones around the midpoint, to judge where an entry sits.",
  },
  "risk-reward": {
    term: "Risk Reward Ratio",
    short:
      "Potential loss weighed against potential gain on a position. One to two means risking one for a shot at two.",
  },
  "position-sizing": {
    term: "Position Sizing",
    short:
      "Deciding how much capital goes into a single position so one loss cannot wreck the whole portfolio.",
  },
  "stop-loss": {
    term: "Stop Loss",
    short:
      "A preset price that closes a position automatically to cap losses when price moves against the plan.",
  },
  diversification: {
    term: "Diversification",
    short:
      "Spreading capital across several stocks or sectors so one falling asset does not sink everything.",
  },
  drawdown: {
    term: "Drawdown",
    short:
      "How far a portfolio falls from its peak to its trough before recovering, a measure of how deep temporary losses run.",
  },
  fomo: {
    term: "FOMO",
    short:
      "The urge to buy out of fear of missing a rally, which often drags investors in at high prices without analysis.",
  },
  "loss-aversion": {
    term: "Loss Aversion",
    short:
      "Feeling the pain of a loss more sharply than the pleasure of a gain, which often makes investors hold losers too long.",
  },
  "confirmation-bias": {
    term: "Confirmation Bias",
    short:
      "Seeking only information that supports what you already believe while ignoring contradicting evidence.",
  },
  discipline: {
    term: "Discipline",
    short:
      "Sticking to the plan you set, including entry rules, stop loss, and targets, instead of acting on momentary emotion.",
  },
};
