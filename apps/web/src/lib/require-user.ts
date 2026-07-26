import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getAuth } from "@/lib/auth";

/**
 * Gerbang sesi untuk Route Handler yang menyentuh data milik pengguna. Beda
 * dari middleware (yang cuma mengecek keberadaan cookie), ini benar benar
 * memvalidasi sesi ke database.
 */
export async function requireUser() {
  let session: Awaited<ReturnType<ReturnType<typeof getAuth>["api"]["getSession"]>>;
  try {
    session = await getAuth().api.getSession({ headers: await headers() });
  } catch (error) {
    console.error("Sesi tidak bisa diperiksa", error);
    return {
      user: null,
      response: NextResponse.json(
        { message: "Layanan akun belum dikonfigurasi", code: "auth_unavailable" },
        { status: 503 },
      ),
    };
  }

  if (!session?.user) {
    return {
      user: null,
      response: NextResponse.json(
        { message: "Belum masuk", code: "unauthorized" },
        { status: 401 },
      ),
    };
  }

  return { user: session.user, response: null };
}
