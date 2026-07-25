import type { Locale } from "@all-in/contracts";
import { z } from "zod";
import type { CollectedData } from "../lib/data-collector.ts";
import { askGeminiJson } from "../lib/gemini-client.ts";
import {
  analystGuardrails,
  formatMoney,
  formatPercentFromFraction,
  formatPercentValue,
  formatRatio,
  languageInstruction,
} from "./shared.ts";

const fundamentalResultSchema = z.object({
  score: z
    .number()
    .min(0)
    .max(100)
    .describe("Skor kesehatan fundamental, 0 sangat lemah, 100 sangat kuat"),
  reasons: z
    .array(z.string())
    .min(2)
    .max(4)
    .describe("Alasan ringkas yang merujuk angka yang diberikan"),
  summary: z.string().describe("Satu kalimat ringkasan kondisi fundamental"),
});

export type FundamentalResult = z.infer<typeof fundamentalResultSchema>;

export async function runFundamentalAgent(
  data: CollectedData,
  locale: Locale,
): Promise<FundamentalResult> {
  const systemPrompt = [
    analystGuardrails,
    "Peranmu adalah Fundamental Agent. Nilai kesehatan bisnis dan kewajaran valuasi dari metrik yang diberikan.",
    "Panduan penilaian, ROE tinggi dan margin laba tebal menaikkan skor, rasio utang terhadap ekuitas yang besar dan PE yang jauh di atas rata rata sektor menurunkan skor, pertumbuhan pendapatan positif menaikkan skor.",
    "Jika sebuah metrik tidak tersedia, abaikan metrik itu dan jangan berspekulasi.",
    languageInstruction[locale],
  ].join(" ");

  const userPrompt = [
    `Perusahaan: ${data.companyName} (${data.ticker})`,
    `Sektor: ${data.sector ?? "tidak tersedia"}`,
    `Industri: ${data.industry ?? "tidak tersedia"}`,
    `Kapitalisasi pasar: ${formatMoney(data.marketCap, data.currency)}`,
    `PE ratio (trailing): ${formatRatio(data.peRatio)}`,
    `PE ratio (forward): ${formatRatio(data.forwardPE)}`,
    `Return on equity: ${formatPercentFromFraction(data.roe)}`,
    `Margin laba bersih: ${formatPercentFromFraction(data.profitMargin)}`,
    `Pertumbuhan pendapatan: ${formatPercentFromFraction(data.revenueGrowth)}`,
    `Rasio utang terhadap ekuitas: ${formatPercentValue(data.debtToEquityPercent)}`,
    `Dividend yield: ${formatPercentFromFraction(data.dividendYield)}`,
    "",
    "Berikan penilaian fundamental dalam format JSON sesuai skema.",
  ].join("\n");

  return askGeminiJson(fundamentalResultSchema, systemPrompt, userPrompt, {
    thinkingBudget: 0,
  });
}
