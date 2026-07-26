import { analyzeResponseSchema, wireRequestSchema } from "@all-in/contracts";
import { getDb, schema } from "@all-in/db";
import { NextResponse } from "next/server";
import { env } from "@/config/env";
import { requireUser } from "@/lib/require-user";

/**
 * Proxy sisi server untuk backend AI Analysis.
 *
 * Browser tidak pernah lagi memanggil backend langsung, sehingga alamat backend
 * tidak ikut ke bundel klien dan secret bersama tetap tinggal di server. Tiap
 * panggilan ke backend berbiaya, jadi endpoint itu tidak boleh terbuka bagi siapa
 * pun yang menebak URL-nya, dan sekarang mewajibkan sesi login supaya jelas
 * siapa yang memakai jatah kuota harian.
 *
 * Hasil yang berhasil disimpan ke tabel `analysis`. Satu baris di sana mewakili
 * tiga panggilan Gemini yang sudah dibayar, jadi refresh halaman tidak lagi
 * membuang hasil yang sudah didapat.
 */
export async function POST(request: Request) {
  const { user, response } = await requireUser();
  if (!user) return response;

  if (!env.ANALYSIS_API_URL) {
    return NextResponse.json(
      { message: "Layanan analisis belum dikonfigurasi", code: "ai_unavailable" },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Permintaan tidak valid", errors: { body: ["Bukan JSON"] } },
      { status: 422 },
    );
  }

  // Divalidasi di sini juga supaya permintaan yang jelas salah tidak sampai
  // membebani backend, memakai skema yang sama persis dengan backend.
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

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (env.BACKEND_SHARED_SECRET) {
    headers["x-backend-secret"] = env.BACKEND_SHARED_SECRET;
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${env.ANALYSIS_API_URL}/api/analyze`, {
      method: "POST",
      headers,
      body: JSON.stringify(parsed.data),
      cache: "no-store",
    });
  } catch (error) {
    console.error("Tidak bisa menghubungi backend analisis", error);
    return NextResponse.json(
      { message: "Layanan analisis tidak dapat dihubungi", code: "ai_unavailable" },
      { status: 503 },
    );
  }

  const payload = await upstream.json().catch(() => null);

  if (payload === null) {
    return NextResponse.json(
      { message: "Balasan layanan analisis tidak terbaca", code: "ai_unavailable" },
      { status: 502 },
    );
  }

  if (upstream.ok) {
    const validated = analyzeResponseSchema.safeParse(payload);
    if (validated.success && env.DATABASE_URL) {
      try {
        await getDb(env.DATABASE_URL)
          .insert(schema.analysis)
          .values({
            userId: user.id,
            ticker: parsed.data.ticker,
            riskProfile: parsed.data.risk_profile,
            investmentGoal: parsed.data.investment_goal,
            locale: parsed.data.locale ?? "id",
            payload: validated.data,
          });
      } catch (error) {
        // Kegagalan simpan tidak boleh membuang hasil yang sudah dibayar
        // dengan kuota Gemini. Pengguna tetap menerimanya, hanya saja tidak
        // akan muncul lagi di riwayat.
        console.error("Gagal menyimpan riwayat analisis", error);
      }
    }
  }

  // Status dan kode error backend diteruskan apa adanya, karena UI memetakan
  // `code` menjadi pesan terjemahan.
  return NextResponse.json(payload, { status: upstream.status });
}
