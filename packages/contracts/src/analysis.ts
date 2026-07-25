import { z } from "zod";

export const localeSchema = z.enum(["id", "en"]);

export type Locale = z.infer<typeof localeSchema>;

export const wireRequestSchema = z.object({
  ticker: z.string().min(1).max(12),
  risk_profile: z.enum(["conservative", "moderate", "aggressive"]),
  investment_goal: z.enum(["short_term", "medium_term", "long_term"]),
  locale: localeSchema.optional(),
});

export type WireRequest = z.infer<typeof wireRequestSchema>;

export const marketDataSchema = z.object({
  price: z.number().optional(),
  changePercent1y: z.number().optional(),
  pe: z.number().optional(),
  roe: z.number().optional(),
  rsi: z.number().optional(),
  trend: z.string().optional(),
  news: z.array(z.string()).optional(),
});

export type MarketData = z.infer<typeof marketDataSchema>;

export const analyzeResponseSchema = z.object({
  recommendation: z.enum(["BUY", "HOLD", "SELL"]),
  confidence: z.number().min(0).max(100),
  fundamental_score: z.number().min(0).max(100),
  technical_score: z.number().min(0).max(100),
  market_intelligence_score: z.number().min(0).max(100),
  reason: z.array(z.string()).min(1),
  company_name: z.string().optional(),
  sector: z.string().optional(),
  risk_level: z.enum(["Low", "Medium", "High"]).optional(),
  final_reasoning: z.string().optional(),
  what_could_change: z.string().optional(),
  market_context: z.string().optional(),
  fundamental_analysis: z.string().optional(),
  technical_analysis: z.string().optional(),
  market_data: marketDataSchema.optional(),
});

export type AnalyzeResponse = z.infer<typeof analyzeResponseSchema>;
