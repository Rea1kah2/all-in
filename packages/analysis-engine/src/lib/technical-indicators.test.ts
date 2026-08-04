import assert from "node:assert/strict";
import { test } from "node:test";
import {
  calculateEMA,
  calculateMACD,
  calculateRSI,
  calculateVolatility,
  classifyTrend,
  computeTechnicalScore,
} from "./technical-indicators.ts";

const wilderCloses = [
  44.34, 44.09, 44.15, 43.61, 44.33, 44.83, 45.1, 45.42, 45.84, 46.08, 45.89, 46.03,
  45.61, 46.28, 46.28,
];

test("calculateRSI matches the published Wilder reference value", () => {
  const rsi = calculateRSI(wilderCloses, 14);
  assert.ok(
    Math.abs(rsi - 70.53) < 0.1,
    `expected RSI near 70.53 for the Wilder sample, received ${rsi}`,
  );
});

test("calculateRSI returns 100 when every step is a gain", () => {
  const rising = Array.from({ length: 20 }, (_, index) => 100 + index);
  assert.equal(calculateRSI(rising, 14), 100);
});

test("calculateRSI stays neutral on a flat series", () => {
  const flat = Array.from({ length: 20 }, () => 100);
  assert.equal(calculateRSI(flat, 14), 50);
});

test("calculateRSI falls below 30 on a sustained decline", () => {
  const falling = Array.from({ length: 20 }, (_, index) => 100 - index);
  assert.ok(calculateRSI(falling, 14) < 30);
});

test("calculateRSI degrades to neutral when data is too short", () => {
  assert.equal(calculateRSI([100, 101, 102], 14), 50);
});

test("calculateEMA equals the simple average when length matches the period", () => {
  const closes = Array.from({ length: 10 }, (_, index) => index + 1);
  assert.equal(calculateEMA(closes, 10), 5.5);
});

test("calculateEMA tracks a rising series above its midpoint", () => {
  const closes = Array.from({ length: 60 }, (_, index) => 100 + index);
  const ema = calculateEMA(closes, 20);
  assert.ok(ema > 140 && ema < 159, `unexpected EMA ${ema}`);
});

test("classifyTrend detects an uptrend and a downtrend", () => {
  const rising = Array.from({ length: 60 }, (_, index) => 100 + index * 2);
  const falling = Array.from({ length: 60 }, (_, index) => 200 - index * 2);
  assert.equal(classifyTrend(rising), "uptrend");
  assert.equal(classifyTrend(falling), "downtrend");
});

test("classifyTrend stays neutral without enough data", () => {
  assert.equal(classifyTrend([100, 101, 102]), "neutral");
});

test("calculateMACD holds a bearish position while the decline accelerates", () => {
  const falling = Array.from({ length: 80 }, (_, index) => 500 - index ** 1.6);
  const macd = calculateMACD(falling);
  assert.ok(macd.macd < 0, `expected negative MACD, received ${macd.macd}`);
  assert.equal(macd.position, "bearish");
  assert.equal(macd.crossedRecently, false);
});

test("calculateMACD turns the histogram positive when a decline decelerates", () => {
  const easing = Array.from({ length: 80 }, (_, index) => 300 * 0.99 ** index);
  const macd = calculateMACD(easing);
  assert.ok(macd.macd < 0, "the trend is still down");
  assert.equal(macd.position, "bullish");
});

test("calculateMACD holds a bullish position while growth accelerates", () => {
  const accelerating = Array.from({ length: 80 }, (_, index) => 100 + index ** 1.6);
  const macd = calculateMACD(accelerating);
  assert.ok(macd.macd > 0, `expected positive MACD, received ${macd.macd}`);
  assert.equal(macd.position, "bullish");
});

test("calculateMACD converges to a flat histogram on a perfectly linear series", () => {
  const linear = Array.from({ length: 80 }, (_, index) => 100 + index * 2);
  const macd = calculateMACD(linear);
  assert.ok(
    Math.abs(macd.histogram) < 0.01,
    `a constant slope should collapse the histogram, received ${macd.histogram}`,
  );
});

test("calculateMACD flags only the bar where the histogram flips sign", () => {
  const rising = Array.from({ length: 60 }, (_, index) => 100 + index * 2);
  const flipBar = calculateMACD([...rising, 218 - 6]);
  assert.equal(flipBar.position, "bearish");
  assert.equal(flipBar.crossedRecently, true);

  const laterBars = calculateMACD([
    ...rising,
    ...Array.from({ length: 4 }, (_, index) => 218 - (index + 1) * 6),
  ]);
  assert.equal(laterBars.position, "bearish");
  assert.equal(laterBars.crossedRecently, false);
});

test("calculateMACD returns a neutral shape when data is too short", () => {
  const macd = calculateMACD([1, 2, 3]);
  assert.deepEqual(macd, {
    macd: 0,
    signal: 0,
    histogram: 0,
    position: "neutral",
    crossedRecently: false,
  });
});

test("calculateVolatility is zero on a flat series and positive when it swings", () => {
  const flat = Array.from({ length: 40 }, () => 100);
  assert.equal(calculateVolatility(flat), 0);

  const choppy = Array.from({ length: 40 }, (_, index) => (index % 2 === 0 ? 100 : 110));
  assert.ok(calculateVolatility(choppy) > 0);
});

test("computeTechnicalScore keeps the score inside the calibrated range", () => {
  const rising = Array.from({ length: 120 }, (_, index) => 100 + index);
  const falling = Array.from({ length: 120 }, (_, index) => 300 - index);

  const bullish = computeTechnicalScore(rising);
  const bearish = computeTechnicalScore(falling);

  assert.ok(bullish.score >= 5 && bullish.score <= 95);
  assert.ok(bearish.score >= 5 && bearish.score <= 95);
  assert.ok(
    bullish.score > bearish.score,
    "a rising series must score higher than a falling one",
  );
  assert.equal(bullish.trend, "uptrend");
  assert.equal(bearish.trend, "downtrend");
  assert.ok(bullish.reasons.length > 0);
  assert.ok(bullish.changePercent1y > 0);
  assert.ok(bearish.changePercent1y < 0);
});

test("computeTechnicalScore survives an empty series", () => {
  const reading = computeTechnicalScore([]);
  assert.ok(reading.score >= 5 && reading.score <= 95);
  assert.equal(reading.rsi, 50);
  assert.equal(reading.trend, "neutral");
  assert.equal(reading.changePercent1y, 0);
});
