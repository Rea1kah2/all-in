import { getDb, schema } from "@all-in/db";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { env } from "@/config/env";
import { requireUser } from "@/lib/require-user";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user, response } = await requireUser();
  if (!user) return response;

  const id = Number((await params).id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ message: "ID tidak valid" }, { status: 422 });
  }

  await getDb(env.DATABASE_URL)
    .update(schema.notification)
    .set({ read: true })
    .where(and(eq(schema.notification.id, id), eq(schema.notification.userId, user.id)));

  return new NextResponse(null, { status: 204 });
}
