import { z } from "zod";

export const marketIndexSchema = z.object({
  symbol: z.string(),
  name: z.string(),
  value: z.number(),
  change: z.number(),
  changePercent: z.number(),
  spark: z.array(z.number()),
});

export type MarketIndex = z.infer<typeof marketIndexSchema>;

export const moverSchema = z.object({
  ticker: z.string(),
  name: z.string(),
  price: z.number(),
  changePercent: z.number(),
  spark: z.array(z.number()),
});

export type Mover = z.infer<typeof moverSchema>;

export const marketSummarySchema = z.object({
  indices: z.array(marketIndexSchema),
  gainers: z.array(moverSchema),
  losers: z.array(moverSchema),
});

export type MarketSummary = z.infer<typeof marketSummarySchema>;
