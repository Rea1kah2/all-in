import { getDb, schema } from "@all-in/db";
import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { env } from "@/config/env";
import { requireUser } from "@/lib/require-user";
import { notificationSchema } from "@/types/notification";

export async function GET() {
  const { user, response } = await requireUser();
  if (!user) return response;

  const rows = await getDb(env.DATABASE_URL).query.notification.findMany({
    where: eq(schema.notification.userId, user.id),
    orderBy: desc(schema.notification.createdAt),
    limit: 50,
  });

  // `payload` disimpan sebagai jsonb bebas bentuk, divalidasi ulang di sini
  // supaya baris yang rusak tidak ikut menjatuhkan seluruh daftar.
  const items = rows.flatMap((row) => {
    const candidate = {
      id: row.id,
      type: row.type,
      read: row.read,
      href: row.href,
      createdAt: row.createdAt.toISOString(),
      ...(row.payload as Record<string, unknown>),
    };
    const parsed = notificationSchema.safeParse(candidate);
    return parsed.success ? [parsed.data] : [];
  });

  return NextResponse.json(items);
}
