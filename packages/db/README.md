# @all-in/db

Skema Drizzle dan klien Postgres untuk data pengguna (auth, watchlist, price alert,
riwayat analisis, notifikasi). Dipakai oleh `apps/web`, bukan oleh `apps/backend`
(backend AI Analysis tidak menyimpan apa pun soal pengguna).

## Setup

Butuh Postgres apa saja yang bisa diakses lewat connection string biasa (bukan driver
serverless khusus vendor). Neon, Postgres lokal, atau Docker semuanya cocok.

```bash
cd packages/db
DATABASE_URL="postgres://user:password@host:5432/db" pnpm db:push
```

`db:push` menyinkronkan tabel langsung dari `src/schema.ts` tanpa berkas migrasi,
cocok untuk pengembangan. Kalau nanti butuh riwayat migrasi yang bisa direview (mis.
menjelang produksi), pindah ke `pnpm db:generate` diikuti migrasi bertahap.

`apps/web/.env.local` butuh `DATABASE_URL` yang sama, plus `BETTER_AUTH_SECRET`
(string acak, contoh `openssl rand -hex 32`). Keduanya opsional di level skema env
(`apps/web/src/config/env.ts`), supaya `pnpm dev` tetap bisa jalan sebelum database
disiapkan. Tanpa keduanya, hanya fitur yang menyentuh akun (login, watchlist, alert,
riwayat analisis) yang gagal dengan pesan jelas, halaman lain tetap normal.

## Tabel

| Tabel | Isi |
|---|---|
| `user`, `session`, `account`, `verification` | milik better-auth. `notify_price_alert` dan `notify_news_digest` ditambahkan ke `user` untuk halaman Settings |
| `watchlist` | ticker yang diikuti pengguna, harga diambil langsung dari Yahoo saat dibaca, bukan disimpan |
| `price_alert` | target harga per ticker per pengguna |
| `analysis` | hasil `AnalyzeResponse` utuh dari `apps/backend`, satu baris mewakili tiga panggilan Gemini yang sudah dibayar |
| `notification` | belum ada yang menulis ke tabel ini, endpoint bacanya sudah siap menunggu pekerjaan lanjutan yang menjadwalkan pengecekan alert |

## Kenapa driver TCP biasa, bukan driver serverless Neon

`getDb()` di `src/index.ts` memakai paket `postgres` (driver TCP standar), bukan
`@neondatabase/serverless`. Ini membuat `DATABASE_URL` yang sama bisa menunjuk Postgres
lokal saat pengembangan maupun Neon saat deploy, tanpa kode berbeda per lingkungan.
