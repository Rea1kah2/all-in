import { geminiQuotaSnapshot } from "@all-in/analysis-engine";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/require-user";

/** Sisa jatah kuota Gemini harian, untuk debugging tanpa membakar panggilan. */
export async function GET() {
  const { user, response } = await requireUser();
  if (!user) return response;

  const quota = await geminiQuotaSnapshot();
  return NextResponse.json({ quota });
}
