import { getDb, schema } from "@all-in/db";
import { put } from "@vercel/blob";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { env } from "@/config/env";
import { requireUser } from "@/lib/require-user";

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/**
 * Unggah foto profil ke Vercel Blob, lalu simpan URL-nya ke kolom `image` yang
 * sudah lama ada di tabel `user` tetapi tidak pernah dipakai.
 *
 * Kolom itu diperbarui langsung lewat Drizzle, bukan lewat `authClient`, karena
 * ini berjalan di server tanpa sesi klien. Nilainya tetap terbaca oleh
 * better-auth karena tabelnya sama.
 */
export async function POST(request: Request) {
  const { user, response } = await requireUser();
  if (!user) return response;

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    // Terjadi kalau Blob store belum diaktifkan di dashboard Vercel. Dijawab
    // dengan pesan yang menyebutkan penyebabnya, bukan error mentah, supaya
    // jelas ini soal konfigurasi dan bukan berkasnya yang bermasalah.
    return NextResponse.json(
      {
        message: "Penyimpanan berkas belum dikonfigurasi",
        code: "blob_unavailable",
      },
      { status: 503 },
    );
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { message: "Berkas tidak ditemukan", errors: { file: ["Pilih satu gambar"] } },
      { status: 422 },
    );
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      {
        message: "Jenis berkas tidak didukung",
        errors: { file: ["Hanya JPG, PNG, WebP, atau GIF"] },
      },
      { status: 422 },
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      {
        message: "Ukuran berkas terlalu besar",
        errors: { file: ["Maksimal 2 MB"] },
      },
      { status: 422 },
    );
  }

  let url: string;
  try {
    // `addRandomSuffix` mencegah tabrakan nama sekaligus memastikan URL berubah
    // tiap unggahan, sehingga cache browser tidak menahan foto lama.
    const blob = await put(`avatars/${user.id}`, file, {
      access: "public",
      addRandomSuffix: true,
      contentType: file.type,
    });
    url = blob.url;
  } catch (error) {
    console.error("Gagal mengunggah avatar", error);
    return NextResponse.json(
      { message: "Gagal mengunggah foto, coba lagi", code: "upload_failed" },
      { status: 502 },
    );
  }

  await getDb(env.DATABASE_URL)
    .update(schema.user)
    .set({ image: url })
    .where(eq(schema.user.id, user.id));

  return NextResponse.json({ image: url });
}

export async function DELETE() {
  const { user, response } = await requireUser();
  if (!user) return response;

  await getDb(env.DATABASE_URL)
    .update(schema.user)
    .set({ image: null })
    .where(eq(schema.user.id, user.id));

  return NextResponse.json({ image: null });
}
