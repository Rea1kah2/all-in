import { z } from "zod";

export const analyzeRequestSchema = z.object({
  ticker: z.string().min(1),
  market: z.enum(["US"]),
  risk_profile: z.enum(["Conservative", "Moderate", "Aggressive"]),
  investment_goal: z.enum(["Short Term", "Long Term"]),
});

export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;

export const analyzeResponseSchema = z.object({
  recommendation: z.enum(["BUY", "HOLD", "SELL"]),
  confidence: z.number().min(0).max(100),
  fundamental_score: z.number().min(0).max(100),
  technical_score: z.number().min(0).max(100),
  risk_score: z.number().min(0).max(100),
  reason: z.array(z.string()).min(1),
});

export type AnalyzeResponse = z.infer<typeof analyzeResponseSchema>;
