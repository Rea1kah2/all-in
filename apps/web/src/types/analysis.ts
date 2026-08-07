import {
  type AnalyzeResponse,
  analyzeResponseSchema,
  type MarketData,
  marketDataSchema,
  type WireRequest,
  wireRequestSchema,
} from "@all-in/contracts";
import { z } from "zod";

export {
  type AnalyzeResponse,
  analyzeResponseSchema,
  type MarketData,
  marketDataSchema,
  type WireRequest,
  wireRequestSchema,
};

export const analyzeRequestSchema = z.object({
  ticker: z.string().min(1),
  market: z.enum(["US"]),
  risk_profile: z.enum(["Conservative", "Moderate", "Aggressive"]),
  investment_goal: z.enum(["Short Term", "Long Term"]),
});

export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;

const riskProfileWire = {
  Conservative: "conservative",
  Moderate: "moderate",
  Aggressive: "aggressive",
} as const;

const investmentGoalWire = {
  "Short Term": "short_term",
  "Long Term": "long_term",
} as const;

/**
 * Kebalikan dari peta di atas. Preferensi default pengguna disimpan dalam bentuk
 * wire (`moderate`, `long_term`) karena itu yang dipakai backend, sedangkan
 * formulir memakai label UI, jadi keduanya perlu jembatan dua arah.
 */
export function riskProfileFromWire(
  value: WireRequest["risk_profile"],
): AnalyzeRequest["risk_profile"] {
  const map = {
    conservative: "Conservative",
    moderate: "Moderate",
    aggressive: "Aggressive",
  } as const;
  return map[value];
}

export function investmentGoalFromWire(
  value: WireRequest["investment_goal"],
): AnalyzeRequest["investment_goal"] {
  // Backend mengenal `medium_term`, formulir tidak. Dipetakan ke jangka panjang
  // supaya nilai lama atau nilai dari sumber lain tidak membuat formulir kosong.
  return value === "short_term" ? "Short Term" : "Long Term";
}

export function toWireRequest(input: AnalyzeRequest, locale?: "id" | "en"): WireRequest {
  return {
    ticker: input.ticker.toUpperCase().trim(),
    risk_profile: riskProfileWire[input.risk_profile],
    investment_goal: investmentGoalWire[input.investment_goal],
    ...(locale ? { locale } : {}),
  };
}
