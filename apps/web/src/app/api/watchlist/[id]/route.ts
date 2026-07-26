import { getDb, schema } from "@all-in/db";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { env } from "@/config/env";
import { requireUser } from "@/lib/require-user";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const id = Number((await params).id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ message: "ID tidak valid" }, { status: 422 });
  }

  // `userId` ikut disyaratkan di WHERE supaya pengguna tidak bisa menghapus
  // baris milik orang lain hanya dengan menebak id.
  await getDb(env.DATABASE_URL)
    .delete(schema.watchlist)
    .where(and(eq(schema.watchlist.id, id), eq(schema.watchlist.userId, user.id)));

  return new NextResponse(null, { status: 204 });
}
