import { join } from "node:path";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { z } from "zod";
import { env, geminiModelChain } from "./env.ts";
import { aiQuotaExceeded, aiUnavailable } from "./errors.ts";
import { GeminiBudget } from "./gemini-budget.ts";
import { cacheDir } from "./paths.ts";

const client = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

const REQUEST_TIMEOUT_MS = 30_000;

export const geminiBudget = new GeminiBudget(
  env.GEMINI_DAILY_CALL_LIMIT,
  join(cacheDir, "gemini-budget.json"),
);

function toGeminiSchema(schema: z.ZodType): Record<string, unknown> {
  const jsonSchema = z.toJSONSchema(schema) as Record<string, unknown>;
  const { $schema, ...rest } = jsonSchema;
  void $schema;
  return rest;
}

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start === -1 || end <= start) {
      throw aiUnavailable();
    }
    return JSON.parse(trimmed.slice(start, end + 1));
  }
}

/**
 * Kuota Gemini yang habis datang sebagai HTTP 429. Ini dibedakan dari kegagalan
 * lain karena tindakan penggunanya berbeda: menunggu reset harian, bukan mencoba
 * lagi sebentar lagi.
 */
function isQuotaError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    (error as { status?: unknown }).status === 429
  );
}

function logUsage(
  model: string,
  label: string,
  response: { usageMetadata?: unknown },
): void {
  const usage = response.usageMetadata as
    | {
        promptTokenCount?: number;
        candidatesTokenCount?: number;
        thoughtsTokenCount?: number;
        totalTokenCount?: number;
      }
    | undefined;

  if (!usage) return;

  console.warn(
    `Gemini usage ${label} model=${model} prompt=${usage.promptTokenCount ?? 0} ` +
      `output=${usage.candidatesTokenCount ?? 0} thoughts=${usage.thoughtsTokenCount ?? 0} ` +
      `total=${usage.totalTokenCount ?? 0} sisa=${geminiBudget.remaining(model)}`,
  );
}

/**
 * `light` untuk agent yang hanya menafsirkan angka yang sudah dihitung, dia tidak
 * perlu menimbang apa pun. `heavy` untuk agent yang benar benar mengambil
 * keputusan. Tingkat ini menentukan model mana yang dicoba lebih dulu sekaligus
 * berapa banyak thinking yang diizinkan.
 */
type Tier = "light" | "heavy";

const thinkingLevelByTier: Record<Tier, ThinkingLevel> = {
  light: ThinkingLevel.MINIMAL,
  heavy: ThinkingLevel.LOW,
};

type AskOptions = {
  tier?: Tier;
  /** Nama agent, hanya untuk log pemakaian token. */
  label?: string;
};

async function generateOnce<T>(
  model: string,
  schema: z.ZodType<T>,
  systemPrompt: string,
  userPrompt: string,
  options: AskOptions,
): Promise<T> {
  if (!geminiBudget.hasRoom(model)) {
    console.warn(`Jatah harian ${model} habis, panggilan tidak dikirim`);
    throw aiQuotaExceeded();
  }

  let text: string | undefined;

  // Dicatat sebelum dikirim, karena percobaan yang gagal pun ikut dihitung Google.
  geminiBudget.record(model);

  try {
    const response = await client.models.generateContent({
      model,
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseJsonSchema: toGeminiSchema(schema),
        temperature: 0.4,
        httpOptions: { timeout: REQUEST_TIMEOUT_MS },
        thinkingConfig: { thinkingLevel: thinkingLevelByTier[options.tier ?? "heavy"] },
      },
    });
    logUsage(model, options.label ?? "agent", response);
    text = response.text;
  } catch (error) {
    if (isQuotaError(error)) {
      console.error(`Kuota Gemini habis untuk ${model}`);
      throw aiQuotaExceeded();
    }
    console.error(`Gemini request failed pada ${model}`, error);
    throw aiUnavailable();
  }

  if (!text) {
    console.error(`Gemini mengembalikan respons kosong pada ${model}`);
    throw aiUnavailable();
  }

  const parsed = schema.safeParse(extractJson(text));
  if (!parsed.success) {
    console.error("Gemini response failed validation", parsed.error.issues);
    throw aiUnavailable();
  }

  return parsed.data;
}

export async function askGeminiJson<T>(
  schema: z.ZodType<T>,
  systemPrompt: string,
  userPrompt: string,
  options: AskOptions = {},
): Promise<T> {
  let quotaError: unknown = null;

  for (const model of geminiModelChain[options.tier ?? "heavy"]) {
    try {
      return await generateOnce(model, schema, systemPrompt, userPrompt, options);
    } catch (error) {
      // Hanya kehabisan kuota yang layak dicoba ulang di model lain. Kegagalan
      // lain, termasuk keluaran yang tidak lolos skema, akan berulang sama saja
      // dan hanya membakar jatah model berikutnya.
      if (!(error instanceof Error) || !isQuotaServiceError(error)) {
        throw error;
      }
      quotaError = error;
    }
  }

  throw quotaError ?? aiUnavailable();
}

function isQuotaServiceError(error: Error): boolean {
  return "code" in error && (error as { code?: unknown }).code === "ai_quota_exceeded";
}
