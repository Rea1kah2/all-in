import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { z } from "zod";
import { getEnv, getGeminiModelChain } from "./env.ts";
import { aiQuotaExceeded, aiUnavailable, modelOverloaded } from "./errors.ts";
import { GeminiBudget } from "./gemini-budget.ts";

const REQUEST_TIMEOUT_MS = 30_000;

// Dibuat malas (bukan konstanta modul), sama seperti env: supaya import modul
// ini tidak butuh GEMINI_API_KEY sudah ada, hanya penggunaan sungguhan yang
// butuh. Lihat komentar getEnv() di env.ts untuk alasan lengkapnya.
let clientInstance: GoogleGenAI | null = null;
function getClient(): GoogleGenAI {
  if (!clientInstance) {
    clientInstance = new GoogleGenAI({ apiKey: getEnv().GEMINI_API_KEY });
  }
  return clientInstance;
}

let budgetInstance: GeminiBudget | null = null;
export function getGeminiBudget(): GeminiBudget {
  if (!budgetInstance) {
    budgetInstance = new GeminiBudget(getEnv().GEMINI_DAILY_CALL_LIMIT);
  }
  return budgetInstance;
}

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
function statusOf(error: unknown): number | null {
  if (typeof error !== "object" || error === null || !("status" in error)) return null;
  const status = (error as { status?: unknown }).status;
  return typeof status === "number" ? status : null;
}

function isQuotaError(error: unknown): boolean {
  return statusOf(error) === 429;
}

/**
 * `503 UNAVAILABLE` berarti model itu sedang kelebihan beban di sisi Google dan
 * `504 DEADLINE_EXCEEDED` berarti permintaannya kehabisan waktu di sana.
 * Keduanya soal keadaan model itu, bukan soal permintaan kita, jadi layak
 * dicoba ulang di tingkat model berikutnya, sama seperti kehabisan kuota.
 */
function isOverloadedError(error: unknown): boolean {
  const status = statusOf(error);
  return status === 503 || status === 504;
}

async function logUsage(
  model: string,
  label: string,
  response: { usageMetadata?: unknown },
): Promise<void> {
  const usage = response.usageMetadata as
    | {
        promptTokenCount?: number;
        candidatesTokenCount?: number;
        thoughtsTokenCount?: number;
        totalTokenCount?: number;
      }
    | undefined;

  if (!usage) return;

  const remaining = await getGeminiBudget().remaining(model);
  console.warn(
    `Gemini usage ${label} model=${model} prompt=${usage.promptTokenCount ?? 0} ` +
      `output=${usage.candidatesTokenCount ?? 0} thoughts=${usage.thoughtsTokenCount ?? 0} ` +
      `total=${usage.totalTokenCount ?? 0} sisa=${remaining}`,
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

/**
 * Model yang menolak `thinkingConfig`. Keluarga 3.x memakai `thinkingLevel`,
 * keluarga 2.x memakai `thinkingBudget` dan membalas 400 untuk `thinkingLevel`.
 * Daripada memelihara daftar keluarga model yang akan basi, kita belajar dari
 * penolakan pertama lalu berhenti mengirimkannya untuk model itu. Ini penting
 * karena mengganti model lewat env adalah jalan keluar saat satu keluarga
 * sedang bermasalah, dan jalan keluar itu tidak boleh ikut rusak.
 *
 * Catatan untuk deploy serverless: set ini hidup selama instance hangat saja,
 * tidak lintas instance. Itu tidak masalah, hanya berarti penghematan satu
 * percobaan ekstra tidak selalu kena, bukan soal kebenaran.
 */
const thinkingUnsupported = new Set<string>();

function isThinkingUnsupportedError(error: unknown): boolean {
  if (statusOf(error) !== 400) return false;
  const message = error instanceof Error ? error.message : String(error);
  return message.toLowerCase().includes("thinking");
}

async function generateOnce<T>(
  model: string,
  schema: z.ZodType<T>,
  systemPrompt: string,
  userPrompt: string,
  options: AskOptions,
): Promise<T> {
  const budget = getGeminiBudget();
  if (!(await budget.hasRoom(model))) {
    console.warn(`Jatah harian ${model} habis, panggilan tidak dikirim`);
    throw aiQuotaExceeded();
  }

  let text: string | undefined;

  // Dicatat sebelum dikirim, karena percobaan yang gagal pun ikut dihitung Google.
  await budget.record(model);

  const send = (withThinking: boolean) =>
    getClient().models.generateContent({
      model,
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseJsonSchema: toGeminiSchema(schema),
        temperature: 0.4,
        httpOptions: { timeout: REQUEST_TIMEOUT_MS },
        ...(withThinking
          ? {
              thinkingConfig: {
                thinkingLevel: thinkingLevelByTier[options.tier ?? "heavy"],
              },
            }
          : {}),
      },
    });

  try {
    let response: Awaited<ReturnType<typeof send>>;
    try {
      response = await send(!thinkingUnsupported.has(model));
    } catch (error) {
      if (!isThinkingUnsupportedError(error)) throw error;
      console.warn(
        `Model ${model} tidak menerima thinkingConfig, dikirim ulang tanpa itu`,
      );
      thinkingUnsupported.add(model);
      await budget.record(model);
      response = await send(false);
    }
    await logUsage(model, options.label ?? "agent", response);
    text = response.text;
  } catch (error) {
    if (isQuotaError(error)) {
      console.error(`Kuota Gemini habis untuk ${model}`);
      throw aiQuotaExceeded();
    }
    if (isOverloadedError(error)) {
      console.warn(`Model ${model} sedang kelebihan beban, mencoba model berikutnya`);
      throw modelOverloaded();
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
  let lastRetryable: unknown = null;

  for (const model of getGeminiModelChain()[options.tier ?? "heavy"]) {
    try {
      return await generateOnce(model, schema, systemPrompt, userPrompt, options);
    } catch (error) {
      // Hanya dua keadaan yang layak dicoba ulang di model lain: kuota habis,
      // dan model sedang kelebihan beban di sisi Google. Keduanya soal model
      // itu, bukan soal permintaan kita. Kegagalan lain, termasuk keluaran yang
      // tidak lolos skema, akan berulang sama saja dan hanya membakar jatah
      // model berikutnya.
      if (!(error instanceof Error) || !isRetryableOnNextModel(error)) {
        throw error;
      }
      lastRetryable = error;
    }
  }

  // Kelebihan beban bersifat sementara, jadi dilaporkan sebagai gangguan biasa
  // supaya pengguna diminta mencoba lagi, bukan diberi tahu jatah hariannya habis.
  if (lastRetryable instanceof Error && codeOf(lastRetryable) === "model_overloaded") {
    throw aiUnavailable();
  }
  throw lastRetryable ?? aiUnavailable();
}

function codeOf(error: Error): unknown {
  return "code" in error ? (error as { code?: unknown }).code : undefined;
}

function isRetryableOnNextModel(error: Error): boolean {
  const code = codeOf(error);
  return code === "ai_quota_exceeded" || code === "model_overloaded";
}
