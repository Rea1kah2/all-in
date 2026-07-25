import { join } from "node:path";
import {
  type AnalyzeResponse,
  analyzeResponseSchema,
  wireRequestSchema,
} from "@all-in/contracts";
import { Router } from "express";
import { runDecisionAgent } from "../agents/decision-agent.ts";
import { runFundamentalAgent } from "../agents/fundamental-agent.ts";
import { runMarketIntelligenceAgent } from "../agents/market-intelligence-agent.ts";
import { TtlCache } from "../lib/cache.ts";
import { collectMarketData } from "../lib/data-collector.ts";
import { env } from "../lib/env.ts";
import { ServiceError } from "../lib/errors.ts";
import { cacheDir } from "../lib/paths.ts";
import { computeTechnicalScore } from "../lib/technical-indicators.ts";

const cache = new TtlCache<AnalyzeResponse>(
  env.ANALYSIS_CACHE_TTL_MS,
  join(cacheDir, "analysis.json"),
);

export const analyzeRouter = Router();

analyzeRouter.post("/api/analyze", async (request, response) => {
  const parsed = wireRequestSchema.safeParse(request.body);

  if (!parsed.success) {
    const errors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path.join(".") || "body";
      errors[field] = [...(errors[field] ?? []), issue.message];
    }
    response.status(422).json({ message: "Permintaan tidak valid", errors });
    return;
  }

  const input = parsed.data;
  const locale = input.locale ?? "id";
  const ticker = input.ticker.trim().toUpperCase();
  const cacheKey = [ticker, input.risk_profile, input.investment_goal, locale].join(":");

  const cached = cache.get(cacheKey);
  if (cached) {
    response.json(cached);
    return;
  }

  try {
    const data = await collectMarketData(ticker);
    const technical = computeTechnicalScore(data.closes);

    const [fundamental, marketIntelligence] = await Promise.all([
      runFundamentalAgent(data, locale),
      runMarketIntelligenceAgent(data, technical, locale),
    ]);

    const decision = await runDecisionAgent({
      data,
      technical,
      fundamental,
      marketIntelligence,
      request: input,
      locale,
    });

    const payload: AnalyzeResponse = analyzeResponseSchema.parse({
      recommendation: decision.recommendation,
      confidence: Math.round(decision.confidence),
      fundamental_score: Math.round(fundamental.score),
      technical_score: technical.score,
      market_intelligence_score: Math.round(marketIntelligence.score),
      reason: decision.reason,
      company_name: data.companyName,
      sector: data.sector ?? undefined,
      risk_level: decision.risk_level,
      final_reasoning: decision.final_reasoning,
      what_could_change: decision.what_could_change,
      market_context: marketIntelligence.context,
      fundamental_analysis: fundamental.summary,
      technical_analysis: technical.reasons.join(". "),
      market_data: {
        price: data.price,
        changePercent1y: technical.changePercent1y,
        pe: data.peRatio ?? undefined,
        roe: data.roe ?? undefined,
        rsi: technical.rsi,
        trend: technical.trend,
        news: data.headlines.length > 0 ? data.headlines : undefined,
      },
    });

    cache.set(cacheKey, payload);
    response.json(payload);
  } catch (error) {
    if (error instanceof ServiceError) {
      response.status(error.status).json({ message: error.message, code: error.code });
      return;
    }

    console.error("Analyze pipeline failed", error);
    response.status(500).json({
      message: "Analisis gagal diproses, coba lagi sebentar lagi",
      code: "analysis_failed",
    });
  }
});
