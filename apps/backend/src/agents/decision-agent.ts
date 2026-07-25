import type { Locale, WireRequest } from "@all-in/contracts";
import { z } from "zod";
import type { CollectedData } from "../lib/data-collector.ts";
import { askGeminiJson } from "../lib/gemini-client.ts";
import type { TechnicalReading } from "../lib/technical-indicators.ts";
import type { FundamentalResult } from "./fundamental-agent.ts";
import type { MarketIntelligenceResult } from "./market-intelligence-agent.ts";
import {
  analystGuardrails,
  investmentGoalLabel,
  languageInstruction,
  riskProfileLabel,
} from "./shared.ts";

const decisionResultSchema = z.object({
  recommendation: z.enum(["BUY", "HOLD", "SELL"]),
  confidence: z
    .number()
    .min(0)
    .max(100)
    .describe("Tingkat keyakinan terhadap rekomendasi, 0 sampai 100"),
  reason: z
    .array(z.string())
    .min(3)
    .max(4)
    .describe("Alasan utama di balik rekomendasi, satu kalimat per poin"),
  final_reasoning: z
    .string()
    .describe(
      "Satu paragraf yang menjelaskan bagaimana ketiga skor menghasilkan verdict",
    ),
  what_could_change: z
    .string()
    .describe("Kondisi konkret yang bisa mengubah verdict ini di masa depan"),
  risk_level: z.enum(["Low", "Medium", "High"]),
});

export type DecisionResult = z.infer<typeof decisionResultSchema>;

export async function runDecisionAgent(input: {
  data: CollectedData;
  technical: TechnicalReading;
  fundamental: FundamentalResult;
  marketIntelligence: MarketIntelligenceResult;
  request: WireRequest;
  locale: Locale;
}): Promise<DecisionResult> {
  const { data, technical, fundamental, marketIntelligence, request, locale } = input;

  const systemPrompt = [
    analystGuardrails,
    "Peranmu adalah Decision Agent. Kamu menerima tiga skor yang sudah dihitung agent lain dan menggabungkannya menjadi satu rekomendasi akhir.",
    "Bobot penilaian, fundamental dan teknikal adalah penentu utama arah, intelijen pasar menyesuaikan keyakinan.",
    "Sesuaikan hasil dengan profil risiko dan horizon investasi pengguna. Profil konservatif menuntut bukti lebih kuat sebelum BUY, profil agresif lebih toleran terhadap volatilitas.",
    "Tetapkan risk_level dari volatilitas, beta, dan konsistensi ketiga skor.",
    "Keyakinan tinggi hanya jika ketiga skor searah. Jika skor saling bertentangan, turunkan keyakinan dan pertimbangkan HOLD.",
    languageInstruction[locale],
  ].join(" ");

  const userPrompt = [
    `Perusahaan: ${data.companyName} (${data.ticker})`,
    `Sektor: ${data.sector ?? "tidak tersedia"}`,
    "",
    `Skor fundamental: ${fundamental.score} dari 100`,
    `Ringkasan fundamental: ${fundamental.summary}`,
    `Alasan fundamental: ${fundamental.reasons.join("; ")}`,
    "",
    `Skor teknikal: ${technical.score} dari 100`,
    `RSI: ${technical.rsi}, tren: ${technical.trend}, posisi MACD: ${technical.macd.position}`,
    `Alasan teknikal: ${technical.reasons.join("; ")}`,
    "",
    `Skor intelijen pasar: ${marketIntelligence.score} dari 100`,
    `Konteks pasar: ${marketIntelligence.context}`,
    `Alasan intelijen pasar: ${marketIntelligence.reasons.join("; ")}`,
    "",
    `Volatilitas tahunan: ${technical.volatility}%`,
    `Beta: ${data.beta ?? "tidak tersedia"}`,
    "",
    `Profil risiko pengguna: ${riskProfileLabel(request.risk_profile)}`,
    `Horizon investasi pengguna: ${investmentGoalLabel(request.investment_goal)}`,
    "",
    "Berikan keputusan akhir dalam format JSON sesuai skema.",
  ].join("\n");

  return askGeminiJson(decisionResultSchema, systemPrompt, userPrompt, {
    tier: "heavy",
    label: "decision",
  });
}
