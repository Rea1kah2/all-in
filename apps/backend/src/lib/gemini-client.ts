import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { env } from "./env.ts";
import { aiUnavailable } from "./errors.ts";

const client = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

const REQUEST_TIMEOUT_MS = 30_000;

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

type AskOptions = {
  /**
   * Anggaran token thinking. `0` mematikan thinking, cocok untuk agent yang hanya
   * menafsirkan angka yang sudah dihitung. Dikosongkan berarti mengikuti perilaku
   * dinamis bawaan model, dipakai untuk agent yang benar benar perlu menimbang.
   */
  thinkingBudget?: number;
};

export async function askGeminiJson<T>(
  schema: z.ZodType<T>,
  systemPrompt: string,
  userPrompt: string,
  options: AskOptions = {},
): Promise<T> {
  let text: string | undefined;

  try {
    const response = await client.models.generateContent({
      model: env.GEMINI_MODEL,
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseJsonSchema: toGeminiSchema(schema),
        temperature: 0.4,
        httpOptions: { timeout: REQUEST_TIMEOUT_MS },
        ...(options.thinkingBudget === undefined
          ? {}
          : { thinkingConfig: { thinkingBudget: options.thinkingBudget } }),
      },
    });
    text = response.text;
  } catch (error) {
    console.error("Gemini request failed", error);
    throw aiUnavailable();
  }

  if (!text) {
    console.error("Gemini returned an empty response");
    throw aiUnavailable();
  }

  const parsed = schema.safeParse(extractJson(text));
  if (!parsed.success) {
    console.error("Gemini response failed validation", parsed.error.issues);
    throw aiUnavailable();
  }

  return parsed.data;
}
