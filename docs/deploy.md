# Panduan Deploy

Tiga layanan, tiga peran berbeda:

```
Vercel (Next.js)  ->  Render (backend AI Analysis)
      |
      v
Neon (Postgres)
```

Browser **hanya** bicara ke Vercel. Alamat backend dan seluruh secret tinggal di server, tidak
pernah masuk ke bundel klien.

---

## 1. Neon, database

1. Buat project Postgres baru, salin connection string (bentuknya
   `postgres://user:password@host/db?sslmode=require`).
2. Buat tabelnya dari mesinmu sendiri:

```bash
cd packages/db
DATABASE_URL="<connection string Neon>" pnpm db:push
```

Harus muncul delapan tabel: `user`, `session`, `account`, `verification`, `watchlist`,
`price_alert`, `analysis`, `notification`.

---

## 2. Render, backend AI Analysis

Backend adalah proses Node yang berjalan terus, jadi tidak bisa ikut Vercel.

**Penting: jangan set Root Directory ke `apps/backend`.** Backend memakai paket workspace
`@all-in/contracts`, yang hanya bisa di-resolve kalau seluruh monorepo ikut ter-checkout. Biarkan
Root Directory di akar repo.

| Pengaturan | Isi |
|---|---|
| Environment | Node |
| Build Command | `corepack enable && pnpm install --frozen-lockfile && pnpm --filter @all-in/backend build` |
| Start Command | `node apps/backend/dist/server.js` |
| Health Check Path | `/health` |

`/health` sengaja berada di luar penjagaan `BACKEND_SHARED_SECRET` supaya Render bisa
memeriksanya tanpa kredensial. Versi Node diambil dari `.node-version` di akar repo.

Environment variables:

| Variabel | Isi |
|---|---|
| `GEMINI_API_KEY` | key dari Google AI Studio |
| `GEMINI_MODEL` | `gemini-3.5-flash` |
| `GEMINI_LIGHT_MODEL` | `gemini-3.5-flash-lite` |
| `GEMINI_DAILY_CALL_LIMIT` | `18` |
| `BACKEND_SHARED_SECRET` | acak, `openssl rand -hex 32`. **Harus sama persis dengan yang di Vercel** |
| `ALLOWED_ORIGIN` | domain Vercel |
| `RATE_LIMIT_PER_MINUTE` | `5` |
| `CACHE_DIR` | hanya kalau memasang disk, mis. `/var/data/cache` |

### Kalau satu model Gemini sedang bermasalah

Ketersediaan model Gemini bisa berubah sewaktu waktu. Saat panduan ini ditulis, seluruh keluarga
`gemini-3.5` membalas `503 UNAVAILABLE` selama lebih dari setengah jam, sementara `gemini-2.5-flash`
dan `gemini-3-flash-preview` normal.

Backend menangani ini di dua tingkat. Pertama, kalau satu model membalas `503` atau `504`,
tingkat itu otomatis jatuh ke model satunya. Kedua, kalau kamu mengganti model lewat env ke
keluarga yang berbeda, perbedaan bentuk konfigurasinya ditangani sendiri: keluarga 3.x memakai
`thinkingLevel`, keluarga 2.x memakai `thinkingBudget` dan menolak `thinkingLevel` dengan `400`.
Backend belajar dari penolakan pertama lalu mengirim ulang tanpa konfigurasi itu, sehingga
mengganti `GEMINI_MODEL` benar benar berfungsi sebagai jalan keluar.

Yang perlu diperhatikan: **jangan menaruh kedua tingkat di keluarga yang sama** kalau kamu ingin
tahan terhadap gangguan seperti ini. `GEMINI_MODEL` dan `GEMINI_LIGHT_MODEL` yang sama sama dari
3.5 akan mati bersamaan saat keluarga itu bermasalah.

### Dua keterbatasan paket gratis Render, dan apa artinya

**Instance tidur setelah sekitar 15 menit tanpa trafik.** Bangunnya bisa sampai sekitar satu
menit, dan analisis sendiri butuh 6 sampai 12 detik. Jadi analisis pertama setelah masa sepi bisa
terasa lama. Proxy di Next.js sudah diberi batas 90 detik supaya permintaan tidak menggantung
selamanya, dan kegagalannya jatuh ke pesan "layanan analisis sedang tidak tersedia" yang sudah
diterjemahkan. Kalau ini mengganggu, instance berbayar Render menghilangkan masalahnya
sepenuhnya.

**Tidak ada disk persisten.** Isi `.cache` (penghitung kuota harian Gemini dan cache hasil
analisis) terhapus tiap kali deploy dan tiap kali instance bangun dari tidur. Akibatnya
penghitung kuota kembali ke nol lebih sering dari seharusnya. Ini melemahkan, bukan mematikan:
kuota Google sendiri tetap berlaku dan `429` dari sana tetap ditangani sebagai
`ai_quota_exceeded`. Yang hilang hanya kemampuan menolak panggilan sebelum dikirim. Kalau nanti
memasang disk berbayar, cukup isi `CACHE_DIR` tanpa mengubah kode.

---

## 3. Vercel, frontend

| Pengaturan | Isi |
|---|---|
| Root Directory | `apps/web` |
| Framework | Next.js (terdeteksi otomatis) |

Vercel akan mengenali pnpm workspace di atas `apps/web` dengan sendirinya.

Environment variables, semuanya **server saja**, tidak ada satu pun yang berawalan
`NEXT_PUBLIC_`:

| Variabel | Isi |
|---|---|
| `DATABASE_URL` | connection string Neon |
| `BETTER_AUTH_SECRET` | acak, `openssl rand -hex 32`. **Jangan pakai yang sama dengan lokal** |
| `BETTER_AUTH_URL` | domain produksi, mis. `https://all-in.vercel.app` |
| `ANALYSIS_API_URL` | URL layanan Render, mis. `https://all-in-backend.onrender.com` |
| `BACKEND_SHARED_SECRET` | sama persis dengan yang di Render |

`BETTER_AUTH_URL` wajib. Tanpanya better-auth menurunkan origin dari request, dan di belakang
proxy Vercel hasilnya bisa salah sehingga login atau logout ditolak dengan alasan yang
membingungkan.

Urutannya: deploy Render dulu supaya URL-nya ada, baru isi `ANALYSIS_API_URL` di Vercel.

---

## 4. Verifikasi setelah live

1. Buka domain produksi, daftar akun baru, lalu keluar dan masuk lagi. Ini membuktikan Vercel
   dan Neon tersambung dan `BETTER_AUTH_URL` benar.
2. Buka Company Explorer untuk `AAPL` dan `BBCA.JK`. Harga harus wajar dan BBCA tampil dalam
   Rupiah. Ini membuktikan jalur data Yahoo hidup tanpa menyentuh Render.
3. Jalankan satu analisis. Kalau instance Render sedang tidur, yang pertama memang lama.
4. Refresh halaman analisis. Hasilnya harus muncul kembali dari database.
5. Buktikan backend tertutup:

```bash
curl -X POST https://<layanan-render>.onrender.com/api/analyze \
  -H 'Content-Type: application/json' \
  -d '{"ticker":"AAPL","risk_profile":"moderate","investment_goal":"long_term"}'
# harus 401 unauthorized
```

6. Buktikan alamat backend tidak bocor: cari string `onrender.com` di Sources DevTools pada
   domain produksi. Harus nihil.

---

## Catatan

- **CORS bukan lagi pengaman backend.** Sejak browser tidak memanggil backend langsung,
  permintaan datang server ke server dan CORS tidak berlaku di sana. Yang benar benar menjaga
  adalah `BACKEND_SHARED_SECRET`. `ALLOWED_ORIGIN` tetap diisi, tapi jangan dianggap lapisan
  keamanan.
- **Free tier Gemini sekitar sembilan analisis per hari.** Begitu ada pengguna sungguhan,
  aktifkan billing Tier 1 lalu naikkan `GEMINI_DAILY_CALL_LIMIT`.
- **Alert harga belum berbunyi saat aplikasi tertutup.** Tabelnya sudah siap dibaca, tapi belum
  ada yang menulis ke sana. Itu butuh pekerjaan terjadwal di server dan belum dikerjakan.
