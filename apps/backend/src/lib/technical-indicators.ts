export type Trend = "uptrend" | "downtrend" | "neutral";

export type MacdResult = {
  macd: number;
  signal: number;
  histogram: number;
  position: "bullish" | "bearish" | "neutral";
  crossedRecently: boolean;
};

export type TechnicalReading = {
  score: number;
  rsi: number;
  trend: Trend;
  ema20: number;
  ema50: number;
  macd: MacdResult;
  volatility: number;
  changePercent1y: number;
  reasons: string[];
};

export function calculateRSI(closes: number[], period = 14): number {
  if (closes.length < period + 1) {
    return 50;
  }

  let gainSum = 0;
  let lossSum = 0;
  for (let i = 1; i <= period; i++) {
    const current = closes[i];
    const previous = closes[i - 1];
    if (current === undefined || previous === undefined) continue;
    const delta = current - previous;
    if (delta >= 0) gainSum += delta;
    else lossSum -= delta;
  }

  let avgGain = gainSum / period;
  let avgLoss = lossSum / period;

  for (let i = period + 1; i < closes.length; i++) {
    const current = closes[i];
    const previous = closes[i - 1];
    if (current === undefined || previous === undefined) continue;
    const delta = current - previous;
    const gain = delta > 0 ? delta : 0;
    const loss = delta < 0 ? -delta : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }

  if (avgLoss === 0) {
    return avgGain === 0 ? 50 : 100;
  }

  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

export function calculateEMA(closes: number[], period: number): number {
  if (closes.length === 0) return 0;
  if (closes.length < period) {
    return closes.reduce((sum, value) => sum + value, 0) / closes.length;
  }

  const multiplier = 2 / (period + 1);
  const seed = closes.slice(0, period);
  let ema = seed.reduce((sum, value) => sum + value, 0) / period;

  for (let i = period; i < closes.length; i++) {
    const value = closes[i];
    if (value === undefined) continue;
    ema = (value - ema) * multiplier + ema;
  }

  return ema;
}

function emaSeries(closes: number[], period: number): number[] {
  if (closes.length < period) return [];

  const multiplier = 2 / (period + 1);
  const seed = closes.slice(0, period);
  let ema = seed.reduce((sum, value) => sum + value, 0) / period;
  const series = [ema];

  for (let i = period; i < closes.length; i++) {
    const value = closes[i];
    if (value === undefined) continue;
    ema = (value - ema) * multiplier + ema;
    series.push(ema);
  }

  return series;
}

export function calculateMACD(closes: number[]): MacdResult {
  const empty: MacdResult = {
    macd: 0,
    signal: 0,
    histogram: 0,
    position: "neutral",
    crossedRecently: false,
  };
  if (closes.length < 35) return empty;

  const fast = emaSeries(closes, 12);
  const slow = emaSeries(closes, 26);
  if (fast.length === 0 || slow.length === 0) return empty;

  const offset = fast.length - slow.length;
  const macdLine: number[] = [];
  for (let i = 0; i < slow.length; i++) {
    const fastValue = fast[i + offset];
    const slowValue = slow[i];
    if (fastValue === undefined || slowValue === undefined) continue;
    macdLine.push(fastValue - slowValue);
  }
  if (macdLine.length < 9) return empty;

  const signalLine = emaSeries(macdLine, 9);
  if (signalLine.length < 2) return empty;

  const macd = macdLine[macdLine.length - 1] ?? 0;
  const signal = signalLine[signalLine.length - 1] ?? 0;
  const previousMacd = macdLine[macdLine.length - 2] ?? 0;
  const previousSignal = signalLine[signalLine.length - 2] ?? 0;

  const histogram = macd - signal;
  const previousHistogram = previousMacd - previousSignal;
  const position: MacdResult["position"] =
    histogram > 0 ? "bullish" : histogram < 0 ? "bearish" : "neutral";
  const crossedRecently =
    (histogram > 0 && previousHistogram <= 0) ||
    (histogram < 0 && previousHistogram >= 0);

  return {
    macd: round(macd, 4),
    signal: round(signal, 4),
    histogram: round(histogram, 4),
    position,
    crossedRecently,
  };
}

export function classifyTrend(closes: number[]): Trend {
  if (closes.length < 20) return "neutral";

  const last = closes[closes.length - 1];
  if (last === undefined) return "neutral";

  const ema20 = calculateEMA(closes, 20);
  const ema50 = closes.length >= 50 ? calculateEMA(closes, 50) : ema20;

  if (last > ema20 && ema20 >= ema50) return "uptrend";
  if (last < ema20 && ema20 <= ema50) return "downtrend";
  return "neutral";
}

export function calculateVolatility(closes: number[]): number {
  if (closes.length < 2) return 0;

  const returns: number[] = [];
  for (let i = 1; i < closes.length; i++) {
    const current = closes[i];
    const previous = closes[i - 1];
    if (current === undefined || previous === undefined || previous === 0) continue;
    returns.push((current - previous) / previous);
  }
  if (returns.length === 0) return 0;

  const mean = returns.reduce((sum, value) => sum + value, 0) / returns.length;
  const variance =
    returns.reduce((sum, value) => sum + (value - mean) ** 2, 0) / returns.length;

  return round(Math.sqrt(variance) * Math.sqrt(252) * 100, 2);
}

function round(value: number, digits: number): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function computeTechnicalScore(closes: number[]): TechnicalReading {
  const rsi = round(calculateRSI(closes), 1);
  const trend = classifyTrend(closes);
  const macd = calculateMACD(closes);
  const ema20 = round(calculateEMA(closes, 20), 2);
  const ema50 = round(calculateEMA(closes, 50), 2);
  const volatility = calculateVolatility(closes);

  const first = closes[0];
  const last = closes[closes.length - 1];
  const changePercent1y =
    first !== undefined && last !== undefined && first !== 0
      ? round(((last - first) / first) * 100, 2)
      : 0;

  const reasons: string[] = [];
  let score = 55;

  if (trend === "uptrend") {
    score += 12;
    reasons.push(`Harga bergerak di atas EMA20 ${ema20} dengan struktur uptrend`);
  } else if (trend === "downtrend") {
    score -= 12;
    reasons.push(`Harga tertekan di bawah EMA20 ${ema20} dengan struktur downtrend`);
  } else {
    reasons.push(`Struktur harga netral di sekitar EMA20 ${ema20}`);
  }

  if (rsi >= 70) {
    score -= 10;
    reasons.push(`RSI ${rsi} masuk area overbought, rawan koreksi jangka pendek`);
  } else if (rsi <= 30) {
    // Oversold dihukum lebih berat daripada sekadar melemah. Hukumannya dulu
    // justru lebih ringan, sehingga saham yang jatuh dalam menerima skor lebih
    // baik daripada yang cuma kehilangan momentum.
    score -= 8;
    reasons.push(`RSI ${rsi} masuk area oversold, tekanan jual masih dominan`);
  } else if (rsi >= 55) {
    score += 8;
    reasons.push(`RSI ${rsi} menunjukkan momentum positif yang sehat`);
  } else if (rsi <= 45) {
    score -= 6;
    reasons.push(`RSI ${rsi} menunjukkan momentum yang melemah`);
  } else {
    reasons.push(`RSI ${rsi} berada di zona netral`);
  }

  if (macd.position === "bullish") {
    score += macd.crossedRecently ? 12 : 8;
    reasons.push(
      macd.crossedRecently
        ? "MACD baru memotong ke atas garis sinyal, konfirmasi momentum naik"
        : "MACD bertahan di atas garis sinyal, momentum naik masih berlaku",
    );
  } else if (macd.position === "bearish") {
    score -= macd.crossedRecently ? 12 : 8;
    reasons.push(
      macd.crossedRecently
        ? "MACD baru memotong ke bawah garis sinyal, konfirmasi momentum turun"
        : "MACD bertahan di bawah garis sinyal, momentum turun masih berlaku",
    );
  }

  if (ema50 > 0 && ema20 > ema50) {
    score += 6;
  } else if (ema50 > 0 && ema20 < ema50) {
    score -= 6;
  }

  if (volatility > 45) {
    score -= 5;
    reasons.push(`Volatilitas tahunan ${volatility}% tergolong tinggi`);
  }

  return {
    score: Math.round(clamp(score, 5, 95)),
    rsi,
    trend,
    ema20,
    ema50,
    macd,
    volatility,
    changePercent1y,
    reasons,
  };
}
