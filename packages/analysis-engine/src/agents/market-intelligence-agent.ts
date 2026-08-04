import type { Locale } from "@all-in/contracts";
import { z } from "zod";
import type { CollectedData } from "../lib/data-collector.ts";
import { askGeminiJson } from "../lib/gemini-client.ts";
import type { TechnicalReading } from "../lib/technical-indicators.ts";
import {
  analystGuardrails,
  formatPercentValue,
  formatRatio,
  languageInstruction,
} from "./shared.ts";

const marketIntelligenceResultSchema = z.object({
  score: z
    .number()
    .min(0)
    .max(100)
    .describe("Skor intelijen pasar, 0 sangat negatif, 100 sangat positif"),
  reasons: z
    .array(z.string())
    .min(2)
    .max(4)
    .describe("Alasan ringkas berbasis berita dan ukuran risiko yang diberikan"),
  context: z
    .string()
    .describe("Satu paragraf pendek tentang konteks pasar dan sentimen terkini"),
});

export type MarketIntelligenceResult = z.infer<typeof marketIntelligenceResultSchema>;

export async function runMarketIntelligenceAgent(
  data: CollectedData,
  technical: TechnicalReading,
  locale: Locale,
): Promise<MarketIntelligenceResult> {
  const systemPrompt = [
    analystGuardrails,
    "Peranmu adalah Market Intelligence Agent. Nilai sentimen berita terkini dan konteks risiko pasar untuk saham ini.",
    "Panduan penilaian, berita positif dan volatilitas terkendali menaikkan skor, berita negatif, volatilitas tinggi, serta beta jauh di atas satu menurunkan skor.",
    "Jika tidak ada berita yang diberikan, katakan bahwa aliran berita sedang sepi dan nilai berdasarkan ukuran risiko saja.",
    languageInstruction[locale],
  ].join(" ");

  const headlines =
    data.headlines.length > 0
      ? data.headlines.map((headline, index) => `${index + 1}. ${headline}`).join("\n")
      : "Tidak ada berita terbaru yang tersedia.";

  const rangePosition =
    data.fiftyTwoWeekHigh !== null && data.fiftyTwoWeekLow !== null
      ? `${(((data.price - data.fiftyTwoWeekLow) / Math.max(data.fiftyTwoWeekHigh - data.fiftyTwoWeekLow, 1e-9)) * 100).toFixed(1)}% dari rentang 52 minggu`
      : "tidak tersedia";

  const userPrompt = [
    `Perusahaan: ${data.companyName} (${data.ticker})`,
    `Sektor: ${data.sector ?? "tidak tersedia"}`,
    `Volatilitas tahunan: ${formatPercentValue(technical.volatility)}`,
    `Beta: ${formatRatio(data.beta)}`,
    `Perubahan harga periode data: ${formatPercentValue(technical.changePercent1y)}`,
    `Posisi harga: ${rangePosition}`,
    "",
    "Berita terbaru:",
    headlines,
    "",
    "Berikan penilaian intelijen pasar dalam format JSON sesuai skema.",
  ].join("\n");

  return askGeminiJson(marketIntelligenceResultSchema, systemPrompt, userPrompt, {
    tier: "light",
    label: "market-intelligence",
  });
}
