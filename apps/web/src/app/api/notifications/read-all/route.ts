import { getDb, schema } from "@all-in/db";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { env } from "@/config/env";
import { requireUser } from "@/lib/require-user";

export async function POST() {
  const { user, response } = await requireUser();
  if (!user) return response;

  await getDb(env.DATABASE_URL)
    .update(schema.notification)
    .set({ read: true })
    .where(eq(schema.notification.userId, user.id));

  return new NextResponse(null, { status: 204 });
}
