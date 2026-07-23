import { z } from "zod";

export const priceSchema = z.object({
  current: z.number(),
  change: z.number(),
  changePercent: z.number(),
  currency: z.string(),
});

export const metricsSchema = z.object({
  peRatio: z.number().nullable(),
  roe: z.number().nullable(),
  debtToEquity: z.number().nullable(),
  dividendYield: z.number().nullable(),
});

export const companySchema = z.object({
  ticker: z.string(),
  name: z.string(),
  exchange: z.string(),
  sector: z.string(),
  industry: z.string(),
  description: z.string(),
  price: priceSchema,
  metrics: metricsSchema,
});

export type Company = z.infer<typeof companySchema>;

export const candleSchema = z.object({
  time: z.number(),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
});

export type Candle = z.infer<typeof candleSchema>;
