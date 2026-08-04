import {
  type AnalyzeResponse,
  analyzeResponseSchema,
  type WireRequest,
} from "@all-in/contracts";
import { runDecisionAgent } from "./agents/decision-agent.ts";
import { runFundamentalAgent } from "./agents/fundamental-agent.ts";
import { runMarketIntelligenceAgent } from "./agents/market-intelligence-agent.ts";
import { getCachedAnalysis, setCachedAnalysis } from "./lib/analysis-cache.ts";
import { collectMarketData } from "./lib/data-collector.ts";
import { env, geminiModels } from "./lib/env.ts";
import { geminiBudget } from "./lib/gemini-client.ts";
import { computeTechnicalScore } from "./lib/technical-indicators.ts";

export { ServiceError } from "./lib/errors.ts";

/**
 * Pipeline lengkap: Data Collector lalu tiga agent Gemini. Ini pengganti
 * langsung dari route Express `POST /api/analyze` sebelumnya, dipanggil
 * in-process dari Route Handler Next.js, bukan lewat jaringan.
 */
export async function runAnalysis(
  request: WireRequest,
  locale: "id" | "en",
): Promise<AnalyzeResponse> {
  const ticker = request.ticker.trim().toUpperCase();

  // Nama model ikut jadi kunci, kalau tidak hasil dari model lama akan tetap
  // disajikan setelah model diganti lewat env.
  const cacheKey = [
    ticker,
    request.risk_profile,
    request.investment_goal,
    locale,
    env.GEMINI_MODEL,
    env.GEMINI_LIGHT_MODEL,
  ].join(":");

  const cached = await getCachedAnalysis(cacheKey);
  if (cached) return cached;

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
    request,
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
      currency: data.currency,
      changePercent1y: technical.changePercent1y,
      pe: data.peRatio ?? undefined,
      roe: data.roe ?? undefined,
      rsi: technical.rsi,
      trend: technical.trend,
      news: data.headlines.length > 0 ? data.headlines : undefined,
    },
  });

  await setCachedAnalysis(cacheKey, payload);
  return payload;
}

/** Dipakai endpoint status untuk menampilkan sisa jatah kuota harian. */
export async function geminiQuotaSnapshot() {
  const snapshot = await geminiBudget.snapshot(geminiModels);
  return {
    pacificDate: snapshot.date,
    dailyLimitPerModel: snapshot.limit,
    models: geminiModels.map((model) => ({
      model,
      used: snapshot.used[model] ?? 0,
      remaining: Math.max(snapshot.limit - (snapshot.used[model] ?? 0), 0),
    })),
  };
}

export { env as analysisEngineEnv } from "./lib/env.ts";
