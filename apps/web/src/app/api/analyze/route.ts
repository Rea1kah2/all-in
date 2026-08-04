import { runAnalysis, ServiceError } from "@all-in/analysis-engine";
import { wireRequestSchema } from "@all-in/contracts";
import { getDb, schema } from "@all-in/db";
import { NextResponse } from "next/server";
import { env } from "@/config/env";
import { requireUser } from "@/lib/require-user";

/**
 * Analisis berjalan in-process di sini, bukan lewat panggilan jaringan ke
 * layanan terpisah. Awalnya ini memanggil backend Express di Render, tetapi
 * paket gratis semua penyedia hosting proses panjang (Render, Railway, Fly.io)
 * kini mensyaratkan kartu untuk verifikasi. Menjalankan mesin analisis
 * langsung di dalam fungsi serverless Vercel yang sama sekali menghindari
 * kebutuhan itu, dan sebagai bonus menghapus satu jaringan hop plus secret
 * bersama yang sebelumnya menjaganya.
 *
 * Timeout eksekusi diatur lewat `maxDuration` di bawah, bukan `AbortSignal`,
 * karena sekarang tidak ada permintaan HTTP keluar yang perlu dibatasi.
 *
 * Hasil yang berhasil disimpan ke tabel `analysis`. Satu baris di sana mewakili
 * tiga panggilan Gemini yang sudah dibayar, jadi refresh halaman tidak lagi
 * membuang hasil yang sudah didapat.
 */
export const maxDuration = 60;

export async function POST(request: Request) {
  const { user, response } = await requireUser();
  if (!user) return response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Permintaan tidak valid", errors: { body: ["Bukan JSON"] } },
      { status: 422 },
    );
  }

  const parsed = wireRequestSchema.safeParse(body);
  if (!parsed.success) {
    const errors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path.join(".") || "body";
      errors[field] = [...(errors[field] ?? []), issue.message];
    }
    return NextResponse.json(
      { message: "Permintaan tidak valid", errors },
      { status: 422 },
    );
  }

  const locale = parsed.data.locale ?? "id";

  let payload: Awaited<ReturnType<typeof runAnalysis>>;
  try {
    payload = await runAnalysis(parsed.data, locale);
  } catch (error) {
    if (error instanceof ServiceError) {
      return NextResponse.json(
        { message: error.message, code: error.code },
        { status: error.status },
      );
    }
    console.error("Analyze pipeline failed", error);
    return NextResponse.json(
      {
        message: "Analisis gagal diproses, coba lagi sebentar lagi",
        code: "analysis_failed",
      },
      { status: 500 },
    );
  }

  try {
    await getDb(env.DATABASE_URL).insert(schema.analysis).values({
      userId: user.id,
      ticker: parsed.data.ticker,
      riskProfile: parsed.data.risk_profile,
      investmentGoal: parsed.data.investment_goal,
      locale,
      payload,
    });
  } catch (error) {
    // Kegagalan simpan tidak boleh membuang hasil yang sudah dibayar dengan
    // kuota Gemini. Pengguna tetap menerimanya, hanya saja tidak akan muncul
    // lagi di riwayat.
    console.error("Gagal menyimpan riwayat analisis", error);
  }

  return NextResponse.json(payload);
}
