import { z } from "zod";

export const analyzeRequestSchema = z.object({
  ticker: z.string().min(1),
  market: z.enum(["US"]),
  risk_profile: z.enum(["Conservative", "Moderate", "Aggressive"]),
  investment_goal: z.enum(["Short Term", "Long Term"]),
});

export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;

export const wireRequestSchema = z.object({
  ticker: z.string().min(1),
  risk_profile: z.enum(["conservative", "moderate", "aggressive"]),
  investment_goal: z.enum(["short_term", "medium_term", "long_term"]),
  locale: z.enum(["id", "en"]).optional(),
});

export type WireRequest = z.infer<typeof wireRequestSchema>;

const riskProfileWire = {
  Conservative: "conservative",
  Moderate: "moderate",
  Aggressive: "aggressive",
} as const;

const investmentGoalWire = {
  "Short Term": "short_term",
  "Long Term": "long_term",
} as const;

export function toWireRequest(input: AnalyzeRequest, locale?: "id" | "en"): WireRequest {
  return {
    ticker: input.ticker.toUpperCase().trim(),
    risk_profile: riskProfileWire[input.risk_profile],
    investment_goal: investmentGoalWire[input.investment_goal],
    ...(locale ? { locale } : {}),
  };
}

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
