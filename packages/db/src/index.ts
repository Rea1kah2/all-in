import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.ts";

export * from "./schema.ts";
export { schema };

/**
 * Driver TCP biasa, bukan driver serverless khusus Neon, supaya koneksi yang
 * sama bisa menunjuk Postgres lokal saat pengembangan maupun Neon saat deploy
 * hanya dengan mengganti DATABASE_URL.
 */
let client: ReturnType<typeof postgres> | null = null;
let database: ReturnType<typeof drizzle<typeof schema>> | null = null;

/**
 * Instance dibuat sekali lalu dipakai ulang, jadi `connectionString` hanya
 * berpengaruh pada pemanggilan pertama. Ini disengaja karena aplikasi hanya
 * bicara ke satu database, dan membuat pool baru per permintaan akan menghabiskan
 * koneksi. Kalau nanti benar benar perlu lebih dari satu database, ganti dengan
 * cache berkunci URL, jangan diam diam mengandalkan perilaku sekarang.
 */
export function getDb(connectionString?: string) {
  if (database) return database;

  const url = connectionString ?? process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL belum diisi, database tidak bisa dibuka");
  }

  client = postgres(url, { max: 5, prepare: false });
  database = drizzle(client, { schema });
  return database;
}

export type Database = ReturnType<typeof getDb>;
