import { getDb, schema } from "@all-in/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { env } from "@/config/env";

function buildAuth() {
  if (!env.DATABASE_URL) {
    throw new Error("DATABASE_URL belum diisi, auth tidak bisa dipakai");
  }
  if (!env.BETTER_AUTH_SECRET) {
    throw new Error("BETTER_AUTH_SECRET belum diisi, auth tidak bisa dipakai");
  }

  return betterAuth({
    secret: env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(getDb(env.DATABASE_URL), {
      provider: "pg",
      schema,
    }),
    emailAndPassword: {
      enabled: true,
    },
    user: {
      changeEmail: {
        enabled: true,
        // Tidak ada pengiriman email verifikasi yang disiapkan, jadi email
        // pengguna tidak pernah terverifikasi dan perubahan berlaku langsung.
        // Ini sengaja meniru perilaku mock lama, bukan celah keamanan baru.
        updateEmailWithoutVerification: true,
      },
      additionalFields: {
        // `input: true` (default) sengaja dipertahankan: halaman Settings
        // mengubah kedua field ini lewat authClient.updateUser, bukan cuma
        // membacanya.
        notifyPriceAlert: {
          type: "boolean",
          defaultValue: true,
        },
        notifyNewsDigest: {
          type: "boolean",
          defaultValue: true,
        },
      },
    },
    plugins: [nextCookies()],
  });
}

let instance: ReturnType<typeof buildAuth> | undefined;

/**
 * Instance server better-auth, dibuat sekali dan hanya saat benar benar
 * dipanggil. Dibuat lazy (bukan konstanta modul) supaya `pnpm dev` tetap bisa
 * jalan sebelum `DATABASE_URL` dan `BETTER_AUTH_SECRET` disiapkan, halaman
 * yang tidak menyentuh auth tidak ikut rusak. `notifyPriceAlert` dan
 * `notifyNewsDigest` bukan bawaan better-auth, keduanya field tambahan yang
 * sudah dipakai halaman Settings sejak masih mock.
 */
export function getAuth() {
  if (!instance) instance = buildAuth();
  return instance;
}
