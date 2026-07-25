import { type AnalyzeResponse, analyzeResponseSchema } from "@/types/analysis";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function firstNumber(...values: unknown[]): number | undefined {
  for (const value of values) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }
  return undefined;
}

function firstString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === "string" && value.length > 0) return value;
  }
  return undefined;
}

function toReasonList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter(
      (item): item is string => typeof item === "string" && item.length > 0,
    );
  }
  if (typeof value === "string" && value.length > 0) return [value];
  return [];
}

function toRecommendation(value: unknown): "BUY" | "HOLD" | "SELL" {
  const upper = typeof value === "string" ? value.toUpperCase() : "";
  return upper === "BUY" || upper === "SELL" ? upper : "HOLD";
}

function toRiskLevel(value: unknown): "Low" | "Medium" | "High" | undefined {
  if (value === "Low" || value === "Medium" || value === "High") return value;
  return undefined;
}

function normalizeMarketData(raw: Record<string, unknown>) {
  const data = asRecord(raw.market_data ?? raw.marketData);
  const technical = asRecord(data.technical_indicators ?? data.technicalIndicators);
  const news = Array.isArray(data.news)
    ? data.news
        .map((item) => {
          if (typeof item === "string") return item;
          const record = asRecord(item);
          return firstString(record.title, record.summary);
        })
        .filter((item): item is string => Boolean(item))
    : undefined;

  const marketData = {
    price: firstNumber(data.price, data.current_price),
    changePercent1y: firstNumber(data.price_change_1y, data.changePercent1y),
    pe: firstNumber(data.pe, data.pe_ratio),
    roe: firstNumber(data.roe),
    rsi: firstNumber(technical.rsi, data.rsi),
    trend: firstString(technical.trend as string, data.trend as string),
    news: news && news.length > 0 ? news : undefined,
  };

  const hasValue = Object.values(marketData).some((value) => value !== undefined);
  return hasValue ? marketData : undefined;
}

export function normalizeAnalyzeResponse(raw: unknown): AnalyzeResponse {
  const envelope = asRecord(raw);
  const data = "data" in envelope ? asRecord(envelope.data) : envelope;
  const agentScores = asRecord(data.agent_scores ?? data.agentScores);

  const candidate = {
    recommendation: toRecommendation(data.recommendation),
    confidence: firstNumber(data.confidence, data.confidence_score) ?? 0,
    fundamental_score: firstNumber(data.fundamental_score, agentScores.fundamental) ?? 0,
    technical_score: firstNumber(data.technical_score, agentScores.technical) ?? 0,
    market_intelligence_score:
      firstNumber(
        data.market_intelligence_score,
        agentScores.market_intelligence,
        data.risk_score,
      ) ?? 0,
    reason: toReasonList(data.reason ?? data.reasons),
    company_name: firstString(data.company_name, data.companyName),
    sector: firstString(data.sector),
    risk_level: toRiskLevel(data.risk_level ?? data.riskLevel),
    final_reasoning: firstString(data.final_reasoning, data.finalReasoning),
    what_could_change: firstString(data.what_could_change, data.whatCouldChange),
    market_context: firstString(data.market_context, data.marketContext),
    fundamental_analysis: firstString(data.fundamental_analysis),
    technical_analysis: firstString(data.technical_analysis),
    market_data: normalizeMarketData(data),
  };

  return analyzeResponseSchema.parse(candidate);
}
