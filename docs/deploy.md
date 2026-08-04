# Panduan Deploy

Dua layanan:

```
Vercel (Next.js, termasuk AI Analysis)  ->  Neon (Postgres)
```

Browser hanya bicara ke Vercel. Tidak ada layanan backend terpisah: seluruh pipeline AI
Analysis (Data Collector plus tiga agent Gemini) berjalan langsung di dalam fungsi
serverless Next.js yang sama, lewat paket `@all-in/analysis-engine`.

> **Kenapa tidak ada layanan backend terpisah.** Sebelumnya ada rencana memakai Render
> untuk backend Express yang berjalan terus. Ternyata hampir semua penyedia hosting
> proses panjang (Render, Railway, Fly.io) sekarang mensyaratkan kartu untuk verifikasi,
> bahkan di paket gratis. Menjalankan mesin analisis langsung sebagai fungsi serverless
> Vercel menghindari kebutuhan itu sepenuhnya, sekaligus menghapus satu jaringan hop dan
> secret bersama yang sebelumnya menjaganya. Konsekuensinya, penghitung kuota Gemini
> harian dan cache hasil analisis yang dulu berupa berkas JSON kini disimpan sebagai
> tabel Postgres (`gemini_budget`, `analysis_cache`), karena fungsi serverless tidak
> punya disk yang bertahan antar permintaan.

---

## 1. Neon, database

1. Buat project Postgres baru, salin connection string (bentuknya
   `postgres://user:password@host/db?sslmode=require`).
2. Buat tabelnya dari mesinmu sendiri:

```bash
cd packages/db
DATABASE_URL="<connection string Neon>" pnpm db:push
```

Harus muncul sepuluh tabel: `user`, `session`, `account`, `verification`, `watchlist`,
`price_alert`, `analysis`, `notification`, `gemini_budget`, `analysis_cache`.

---

## 2. Vercel, satu satunya layanan aplikasi

| Pengaturan | Isi |
|---|---|
| Root Directory | `apps/web` |
| Framework | Next.js (terdeteksi otomatis) |

Vercel akan mengenali pnpm workspace di atas `apps/web` dengan sendirinya, termasuk paket
`@all-in/analysis-engine` dan `@all-in/db`.

Environment variables, semuanya **server saja**, tidak ada satu pun yang berawalan
`NEXT_PUBLIC_`:

| Variabel | Isi |
|---|---|
| `DATABASE_URL` | connection string Neon |
| `BETTER_AUTH_SECRET` | acak, `openssl rand -hex 32` |
| `BETTER_AUTH_URL` | domain produksi, mis. `https://all-in.vercel.app` |
| `GEMINI_API_KEY` | key dari Google AI Studio |
| `GEMINI_MODEL` | `gemini-3.5-flash` |
| `GEMINI_LIGHT_MODEL` | `gemini-3.5-flash-lite` |
| `GEMINI_DAILY_CALL_LIMIT` | `18` |
| `ANALYSIS_CACHE_TTL_MS` | `600000` |

`BETTER_AUTH_URL` wajib. Tanpanya better-auth menurunkan origin dari request, dan di belakang
proxy Vercel hasilnya bisa salah sehingga login atau logout ditolak dengan alasan yang
membingungkan.

### Kalau satu model Gemini sedang bermasalah

Ketersediaan model Gemini bisa berubah sewaktu waktu. Mesin analisis menangani ini di dua
tingkat. Pertama, kalau satu model membalas `503` (kelebihan beban) atau `504` (timeout),
tingkat itu otomatis jatuh ke model satunya. Kedua, kalau kamu mengganti model lewat env ke
keluarga yang berbeda, perbedaan bentuk konfigurasinya ditangani sendiri: keluarga 3.x
memakai `thinkingLevel`, keluarga 2.x memakai `thinkingBudget` dan menolak `thinkingLevel`
dengan `400`. Sistem belajar dari penolakan pertama lalu mengirim ulang tanpa konfigurasi
itu.

Yang perlu diperhatikan: **jangan menaruh kedua tingkat di keluarga model yang sama** kalau
kamu ingin tahan terhadap gangguan seperti ini. `GEMINI_MODEL` dan `GEMINI_LIGHT_MODEL` yang
sama sama dari keluarga 3.5 akan mati bersamaan saat keluarga itu bermasalah.

### Batas waktu eksekusi

`apps/web/src/app/api/analyze/route.ts` mengeset `maxDuration = 60` (detik), maksimum yang
diizinkan paket Hobby Vercel. Analisis normal butuh 6 sampai 12 detik, tetapi rangkaian
fallback (model kelebihan beban, lalu jatuh ke model lain) bisa menambah beberapa detik lagi.
Kalau kamu naik ke paket Pro, batas ini bisa dinaikkan lebih tinggi.

---

## 3. Verifikasi setelah live

1. Buka domain produksi, daftar akun baru, lalu keluar dan masuk lagi. Ini membuktikan Vercel
   dan Neon tersambung dan `BETTER_AUTH_URL` benar.
2. Buka Company Explorer untuk `AAPL` dan `BBCA.JK`. Harga harus wajar dan BBCA tampil dalam
   Rupiah.
3. Jalankan satu analisis, lalu jalankan lagi dengan parameter identik. Yang kedua harus jauh
   lebih cepat karena dilayani dari `analysis_cache`, bukan memanggil Gemini lagi.
4. Refresh halaman analisis. Hasilnya harus muncul kembali dari riwayat di database.
5. Cek `GET /api/analyze/quota` (perlu login) untuk memastikan penghitung kuota bertambah
   sesuai jumlah panggilan Gemini yang sebenarnya terjadi.

---

## Catatan

- **Free tier Gemini sekitar sembilan analisis per hari.** Begitu ada pengguna sungguhan,
  aktifkan billing Tier 1 lalu naikkan `GEMINI_DAILY_CALL_LIMIT`.
- **Alert harga belum berbunyi saat aplikasi tertutup.** Tabel `notification` sudah siap
  dibaca, tetapi belum ada yang menulis ke sana. Itu butuh pekerjaan terjadwal di server dan
  belum dikerjakan.
- **Cache dan penghitung kuota kini di Postgres**, sehingga konsisten di semua instance
  serverless yang mungkin berjalan bersamaan, sesuatu yang tidak bisa dijamin oleh berkas
  lokal di arsitektur backend terpisah sebelumnya.
